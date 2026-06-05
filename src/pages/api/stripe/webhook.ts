import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const parts: Record<string, string> = {};
  header.split(",").forEach((p) => {
    const [k, v] = p.trim().split("=");
    parts[k] = v;
  });

  const t  = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${t}.${payload}`)
  );

  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hex === v1;
}

export const POST: APIRoute = async ({ request }) => {
  const webhookSecret  = import.meta.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey      = import.meta.env.STRIPE_SECRET_KEY;
  const supabaseUrl    = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const sig     = request.headers.get("stripe-signature") ?? "";
  const payload = await request.text();

  const valid = await verifyStripeSignature(payload, sig, webhookSecret);
  if (!valid) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };

  // ── checkout.session.completed ────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Record<string, unknown>;
    const userId   = (session.metadata as Record<string, string> | null)?.user_id;
    const subId    = session.subscription as string;

    if (userId && serviceRoleKey && stripeKey) {
      // Fetch subscription to get current_period_end
      let periodEnd = new Date(Date.now() + 31536000000).toISOString();
      try {
        const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
          headers: { Authorization: `Bearer ${stripeKey}` },
        });
        const sub = await subRes.json() as Record<string, unknown>;
        if (sub.current_period_end) {
          periodEnd = new Date((sub.current_period_end as number) * 1000).toISOString();
        }
      } catch (_) {}

      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      await supabase.from("suscripciones").upsert(
        {
          user_id:                 userId,
          stripe_customer_id:      session.customer as string,
          stripe_subscription_id:  subId,
          status:                  "active",
          current_period_end:      periodEnd,
        },
        { onConflict: "user_id" }
      );
    }
  }

  // ── subscription status changes ───────────────────────────────
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Record<string, unknown>;
    if (serviceRoleKey) {
      const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const periodEnd = sub.current_period_end
        ? new Date((sub.current_period_end as number) * 1000).toISOString()
        : undefined;

      await supabase
        .from("suscripciones")
        .update({
          status: sub.status as string,
          ...(periodEnd ? { current_period_end: periodEnd } : {}),
        })
        .eq("stripe_subscription_id", sub.id as string);
    }
  }

  return new Response("OK", { status: 200 });
};
