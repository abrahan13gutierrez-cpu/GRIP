-- GRIP platform schema
-- Run this in the Supabase SQL editor, or via `supabase db push` if you use the CLI.
-- Covers every table the app code in lib/platform, lib/dashboard and app/api already queries.

create extension if not exists pgcrypto;

-- =========================================================
-- profiles: one row per auth.users row, holds public identity
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  phone text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, phone)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1),
      'member'
    ),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- channels + pinned_resources
-- =========================================================
create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  category text not null,
  is_broadcast boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.pinned_resources (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  title text not null,
  description text,
  url text,
  sort_order integer not null default 0
);

create index if not exists pinned_resources_channel_id_idx on public.pinned_resources (channel_id);

-- =========================================================
-- messages + reactions
-- =========================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_channel_id_created_at_idx on public.messages (channel_id, created_at);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

create index if not exists reactions_message_id_idx on public.reactions (message_id);

-- =========================================================
-- course_progress + mission_progress
-- =========================================================
create table if not exists public.course_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id text not null,
  progress integer not null default 0 check (progress between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists public.mission_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  drill_id integer not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  primary key (user_id, drill_id)
);

-- =========================================================
-- videos: Mux upload/asset bookkeeping (lesson & drill playback)
-- =========================================================
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  ref_id text,
  upload_id text unique,
  asset_id text unique,
  playback_id text,
  status text not null default 'preparing',
  created_at timestamptz not null default now()
);

create index if not exists videos_kind_ref_id_idx on public.videos (kind, ref_id);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.pinned_resources enable row level security;
alter table public.messages enable row level security;
alter table public.reactions enable row level security;
alter table public.course_progress enable row level security;
alter table public.mission_progress enable row level security;
alter table public.videos enable row level security;

-- profiles: any signed-in member can read usernames (needed for chat joins);
-- a user can only edit their own profile.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- channels & pinned_resources: read-only catalog for signed-in members.
create policy "channels are readable by authenticated users"
  on public.channels for select
  to authenticated
  using (true);

create policy "pinned resources are readable by authenticated users"
  on public.pinned_resources for select
  to authenticated
  using (true);

-- messages: members read all channel messages and can only post as themselves.
create policy "messages are readable by authenticated users"
  on public.messages for select
  to authenticated
  using (true);

create policy "users can send their own messages"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- reactions: members read all, but can only add/remove their own reaction.
create policy "reactions are readable by authenticated users"
  on public.reactions for select
  to authenticated
  using (true);

create policy "users can add their own reactions"
  on public.reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users can remove their own reactions"
  on public.reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- course_progress / mission_progress: strictly per-user.
create policy "users manage their own course progress"
  on public.course_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage their own mission progress"
  on public.mission_progress for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- videos: read-only catalog for signed-in members; writes come from the
-- Mux webhook via the service-role key, which bypasses RLS.
create policy "videos are readable by authenticated users"
  on public.videos for select
  to authenticated
  using (true);

-- =========================================================
-- Seed channels to match the community layout in lib/dashboard/data.ts
-- =========================================================
insert into public.channels (slug, name, description, category, is_broadcast, sort_order)
values
  ('announcements', 'announcements', 'Official GRIP announcements.', 'INFORMATION', false, 1),
  ('gutispeech', 'gutispeech', 'Coach Gutierrez''s notes and philosophy.', 'INFORMATION', false, 2),
  ('energy-calls', 'energy-calls', 'Live energy call archive.', 'CALL ARCHIVE', true, 3),
  ('g-of-the-week', 'g-of-the-week', 'Weekly standout recognition.', 'LEADERBOARD', false, 4),
  ('wins', 'wins', 'Share your wins with the squad.', 'LEADERBOARD', false, 5),
  ('leaderboard', 'leaderboard', 'Full GRIP leaderboard.', 'LEADERBOARD', false, 6),
  ('grip-chat', 'grip-chat', 'General GRIP community chat.', 'CHATS', false, 7),
  ('wake-up-say-gm', 'wake-up-say-gm', 'Morning check-in.', 'DAILY LESSONS', false, 8),
  ('daily-checklist', 'daily-checklist', 'Daily checklist tracking.', 'DAILY LESSONS', false, 9),
  ('daily-lessons', 'daily-lessons', 'Daily lesson drops.', 'DAILY LESSONS', false, 10)
on conflict (slug) do nothing;
