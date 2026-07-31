import "server-only";

import Stripe from "stripe";
import { env } from "./env";

let stripeClient: Stripe | undefined;
let gstTaxRateIdPromise: Promise<string> | undefined;

export function getMinimumStripeCourseAmount() {
  if (env.STRIPE_CURRENCY === "inr") {
    return {
      minorUnits: 5_000,
      displayAmount: "₹50",
    };
  }

  return {
    minorUnits: 50,
    displayAmount: "$0.50",
  };
}

export function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY);

  return stripeClient;
}

export function getGstTaxRateId() {
  gstTaxRateIdPromise ??= findOrCreateGstTaxRate().catch((error) => {
    gstTaxRateIdPromise = undefined;
    throw error;
  });

  return gstTaxRateIdPromise;
}

async function findOrCreateGstTaxRate() {
  const stripe = getStripeClient();
  const taxRates = await stripe.taxRates.list({
    active: true,
    limit: 100,
  });
  const existingGstRate = taxRates.data.find(
    (taxRate) =>
      taxRate.percentage === 18 &&
      taxRate.inclusive === false &&
      taxRate.country === "IN" &&
      (taxRate.tax_type === "gst" || taxRate.display_name === "GST"),
  );

  if (existingGstRate) {
    return existingGstRate.id;
  }

  const gstTaxRate = await stripe.taxRates.create(
    {
      display_name: "GST",
      description: "18% Goods and Services Tax",
      jurisdiction: "India",
      percentage: 18,
      inclusive: false,
      country: "IN",
      tax_type: "gst",
      metadata: {
        source: "coursehub",
      },
    },
    {
      idempotencyKey: "coursehub-gst-18-exclusive",
    },
  );

  return gstTaxRate.id;
}
