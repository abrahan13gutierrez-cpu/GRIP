export type ViewId =
  | "chat"
  | "courses"
  | "misiones"
  | "friends"
  | "wallet"
  | "rank"
  | "checklist"
  | "marketplace"

export type Course = {
  id: string
  title: string
  description: string
  progress: number
  lessons: number
}

export const COURSES: Course[] = [
  {
    id: "framing",
    title: "Framing",
    description: "Master pitch presentation and strike-zone manipulation",
    progress: 72,
    lessons: 14,
  },
  {
    id: "throwing",
    title: "Throwing",
    description: "Build elite pop time and transfer mechanics",
    progress: 45,
    lessons: 11,
  },
  {
    id: "blocking",
    title: "Blocking",
    description: "Command the dirt, control the running game",
    progress: 30,
    lessons: 9,
  },
  {
    id: "calling-game",
    title: "Calling Game",
    description: "Learn to sequence pitches like a pro",
    progress: 12,
    lessons: 16,
  },
  {
    id: "pitcher-relationships",
    title: "Pitcher Relationships",
    description: "Build trust and communication with your pitching staff",
    progress: 0,
    lessons: 7,
  },
  {
    id: "personal-development",
    title: "Personal Development",
    description: "Mental performance and discipline for catchers",
    progress: 58,
    lessons: 12,
  },
]

export type ChannelGroup = {
  label: string
  channels: { id: string; name: string; unread?: number; live?: boolean }[]
}

export const CHANNEL_GROUPS: ChannelGroup[] = [
  {
    label: "START HERE",
    channels: [
      { id: "welcome", name: "welcome" },
      { id: "announcements", name: "announcements", unread: 2 },
      { id: "rules", name: "rules" },
    ],
  },
  {
    label: "TRAINING",
    channels: [
      { id: "daily-broadcast", name: "daily-broadcast", live: true },
      { id: "film-room", name: "film-room", unread: 5 },
      { id: "framing-lab", name: "framing-lab" },
      { id: "pop-time", name: "pop-time" },
    ],
  },
  {
    label: "GENERAL",
    channels: [
      { id: "general", name: "general", unread: 12 },
      { id: "wins", name: "wins" },
      { id: "gear-talk", name: "gear-talk" },
    ],
  },
]

export type Reaction = { emoji: string; count: number; reacted?: boolean }

export type Message = {
  id: string
  author: string
  role: "Coach" | "Student" | "Bot"
  rank: string
  initials: string
  time: string
  day: "Yesterday" | "Today"
  type: "text" | "voice"
  content: string
  duration?: string
  reactions?: Reaction[]
}

export const MESSAGES: Message[] = [
  {
    id: "m1",
    author: "Coach Reyes",
    role: "Coach",
    rank: "Diamond",
    initials: "CR",
    time: "4:12 PM",
    day: "Yesterday",
    type: "text",
    content:
      "Reminder: send in your framing reps before Friday. I want soft hands and a quiet setup — no stabbing at the low pitch.",
    reactions: [
      { emoji: "🔥", count: 8 },
      { emoji: "🧤", count: 3 },
    ],
  },
  {
    id: "m2",
    author: "GRIP Bot",
    role: "Bot",
    rank: "System",
    initials: "GB",
    time: "8:00 AM",
    day: "Today",
    type: "text",
    content: "Daily broadcast starts in 30 minutes. Topic: transfer footwork and exchange speed.",
    reactions: [{ emoji: "⚡", count: 5 }],
  },
  {
    id: "m3",
    author: "Marcus T.",
    role: "Student",
    rank: "Gold",
    initials: "MT",
    time: "8:14 AM",
    day: "Today",
    type: "voice",
    content: "",
    duration: "0:42",
    reactions: [
      { emoji: "👀", count: 4 },
      { emoji: "💪", count: 6, reacted: true },
    ],
  },
  {
    id: "m4",
    author: "Marcus T.",
    role: "Student",
    rank: "Gold",
    initials: "MT",
    time: "8:15 AM",
    day: "Today",
    type: "text",
    content: "Just hit a 1.91 pop time in practice. The transfer cue from film-room is a game changer.",
    reactions: [
      { emoji: "🚀", count: 11 },
      { emoji: "🔥", count: 7 },
    ],
  },
  {
    id: "m5",
    author: "Coach Reyes",
    role: "Coach",
    rank: "Diamond",
    initials: "CR",
    time: "8:21 AM",
    day: "Today",
    type: "text",
    content: "That's the standard. Now do it in a game with a runner breathing down your neck. Own the moment.",
    reactions: [{ emoji: "🎯", count: 9 }],
  },
]

export type Member = {
  id: string
  name: string
  role: "Coach" | "Student" | "Bot"
  rank: string
  initials: string
  online: boolean
}

export const MEMBERS: Member[] = [
  { id: "u1", name: "Coach Reyes", role: "Coach", rank: "Diamond", initials: "CR", online: true },
  { id: "u2", name: "Marcus T.", role: "Student", rank: "Gold", initials: "MT", online: true },
  { id: "u3", name: "GRIP Bot", role: "Bot", rank: "System", initials: "GB", online: true },
  { id: "u4", name: "Jordan P.", role: "Student", rank: "Silver", initials: "JP", online: true },
  { id: "u5", name: "Coach Ellis", role: "Coach", rank: "Platinum", initials: "CE", online: true },
  { id: "u6", name: "Diego M.", role: "Student", rank: "Bronze", initials: "DM", online: false },
  { id: "u7", name: "Sam K.", role: "Student", rank: "Silver", initials: "SK", online: false },
  { id: "u8", name: "Tyler B.", role: "Student", rank: "Gold", initials: "TB", online: false },
]
