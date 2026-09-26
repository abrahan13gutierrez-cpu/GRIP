import Stripe from "https://esm.sh/stripe@17.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;

    if (!email) {
      console.error("No email found in checkout session");
      return new Response("No email found", { status: 400 });
    }

    // Buscar el usuario en auth.users por email
    const { data: userList, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("Error listing users:", userError);
      return new Response("User lookup failed", { status: 500 });
    }

    const user = userList.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      console.error(`No user found with email: ${email}`);
      return new Response("User not found", { status: 404 });
    }

    // Activar en perfiles usando el id del usuario
    const { error: updateError } = await supabase
      .from("perfiles")
      .update({ activo: true })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating perfiles:", updateError);
      return new Response("Database update failed", { status: 500 });
    }

    console.log(`Activated user: ${email} (${user.id})`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});