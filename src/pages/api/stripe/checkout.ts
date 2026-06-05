import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const stripeKey = import.meta.env.STRIPE_SECRET_KEY;
  const priceId   = import.meta.env.STRIPE_PRICE_ID;
  const origin    = new URL(request.url).origin;

  if (!stripeKey || !priceId) {
    return new Response(
      JSON.stringify({ error: "Stripe no está configurado. Agrega STRIPE_SECRET_KEY y STRIPE_PRICE_ID." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { email?: string | null; userId?: string | null } = {};
  try { body = await request.json(); } catch (_) {}

  const params = new URLSearchParams({
    mode:                         "subscription",
    "line_items[0][price]":       priceId,
    "line_items[0][quantity]":    "1",
    success_url:                  `${origin}/suscripcion/gracias?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:                   `${origin}/suscripcion`,
    allow_promotion_codes:        "true",
  });

  if (body.email)  params.set("customer_email",        body.email);
  if (body.userId) params.set("metadata[user_id]",     body.userId);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const session = await res.json() as { url?: string; error?: { message: string } };

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: session.error?.message ?? "Error al crear sesión de pago" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ url: session.url }),
    { headers: { "Content-Type": "application/json" } }
  );
};
