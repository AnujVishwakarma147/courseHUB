import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import type Stripe from "stripe";

export function GET(request: Request) {
  return Response.json({
    status: "ready",
    message:
      "Stripe webhook endpoint is ready. Stripe sends signed POST requests to this URL.",
    webhookUrl: request.url,
    signingSecretConfigured: Boolean(env.STRIPE_WEBHOOK_SECRET),
  });
}

export async function POST(request: Request) {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return Response.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = getStripeClient().webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 },
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await fulfillCheckout(event.data.object);
  }

  return Response.json({ received: true });
}

async function fulfillCheckout(checkout: Stripe.Checkout.Session) {
  const courseId = checkout.metadata?.courseId;
  const userId = checkout.metadata?.userId;
  const amount = checkout.amount_total;

  if (
    checkout.payment_status !== "paid" ||
    checkout.currency?.toLowerCase() !== env.STRIPE_CURRENCY ||
    !courseId ||
    !userId ||
    amount === null
  ) {
    return;
  }

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
    create: {
      userId,
      courseId,
      amount,
      status: "Active",
    },
    update: {
      amount,
      status: "Active",
    },
  });
}
