"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import {
  getGstTaxRateId,
  getMinimumStripeCourseAmount,
  getStripeClient,
} from "@/lib/stripe";
import { ApiResponse } from "@/lib/types";

type EnrollmentCheckoutData = {
  checkoutUrl?: string;
  redirectUrl?: string;
};

type CheckoutConfirmationData = {
  watchUrl: string;
};

export async function enrollInCourseAction(
  courseId: string,
): Promise<ApiResponse<EnrollmentCheckoutData>> {
  const user = await requireUser();

  try {
    if (!env.STRIPE_SECRET_KEY) {
      return {
        status: "error",
        message:
          "Stripe payment is not configured yet. Add your Stripe secret key.",
      };
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
        title: true,
        price: true,
        slug: true,
        fileKey: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "Course not found",
      };
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      select: {
        status: true,
      },
    });

    const learningUrl = new URL(
      `/dashboard/${course.slug}`,
      env.BETTER_AUTH_URL,
    ).toString();

    if (existingEnrollment?.status === "Active") {
      return {
        status: "success",
        message: "You are already enrolled in this course.",
        data: {
          redirectUrl: learningUrl,
        },
      };
    }

    const courseAmount = Math.round(course.price * 100);

    if (courseAmount <= 0) {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
        create: {
          userId: user.id,
          courseId: course.id,
          amount: 0,
          status: "Active",
        },
        update: {
          amount: 0,
          status: "Active",
        },
      });

      return {
        status: "success",
        message: "You have been enrolled successfully.",
        data: {
          redirectUrl: learningUrl,
        },
      };
    }

    const minimumCharge = getMinimumStripeCourseAmount();

    if (courseAmount < minimumCharge.minorUnits) {
      return {
        status: "error",
        message:
          `Stripe cannot process this amount for the configured account. ` +
          `Set the course price to at least ${minimumCharge.displayAmount}, ` +
          "or set it to 0 for a free course.",
      };
    }

    const stripe = getStripeClient();
    const gstTaxRateId = await getGstTaxRateId();
    const paymentSuccessUrl = new URL("/payment/success", env.BETTER_AUTH_URL);
    const paymentCancelUrl = new URL("/payment/cancel", env.BETTER_AUTH_URL);
    paymentCancelUrl.searchParams.set("course_id", course.id);
    paymentCancelUrl.searchParams.set("course_slug", course.slug);
    const thumbnailUrl =
      `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}` +
      `/image/upload/${course.fileKey}`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      automatic_tax: {
        enabled: false,
      },
      managed_payments: {
        enabled: false,
      },
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: env.STRIPE_CURRENCY,
            unit_amount: courseAmount,
            tax_behavior: "exclusive",
            product_data: {
              name: course.title,
              images: [thumbnailUrl],
              tax_code: "txcd_20060158",
              metadata: {
                courseId: course.id,
              },
            },
          },
          quantity: 1,
          tax_rates: [gstTaxRateId],
        },
      ],
      metadata: {
        courseId: course.id,
        userId: user.id,
        courseTitle: course.title,
        gstRate: "18",
      },
      payment_intent_data: {
        metadata: {
          courseId: course.id,
          userId: user.id,
        },
      },
      success_url:
        `${paymentSuccessUrl.toString()}` +
        "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: paymentCancelUrl.toString(),
      billing_address_collection: "auto",
    });

    if (!checkout.url || checkout.amount_total === null) {
      return {
        status: "error",
        message: "Stripe did not return a valid checkout session.",
      };
    }

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      create: {
        userId: user.id,
        courseId: course.id,
        amount: checkout.amount_total,
        status: "Pending",
      },
      update: {
        amount: checkout.amount_total,
        status: "Pending",
      },
    });

    return {
      status: "success",
      message: "Opening secure Stripe checkout...",
      data: {
        checkoutUrl: checkout.url,
      },
    };
  } catch (error) {
    console.error("Unable to create Stripe checkout", error);

    return {
      status: "error",
      message: "Failed to open Stripe payment. Please try again.",
    };
  }
}

export async function confirmStripeCheckoutAction(
  sessionId: string,
  expectedCourseId?: string,
): Promise<ApiResponse<CheckoutConfirmationData>> {
  const user = await requireUser();

  try {
    if (!env.STRIPE_SECRET_KEY) {
      return {
        status: "error",
        message: "Stripe payment is not configured.",
      };
    }

    const stripe = getStripeClient();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const courseId = checkout.metadata?.courseId;
    const paidAmount = checkout.amount_total;

    const isValidCheckout =
      Boolean(courseId) &&
      (!expectedCourseId || courseId === expectedCourseId) &&
      checkout.status === "complete" &&
      checkout.payment_status === "paid" &&
      checkout.client_reference_id === user.id &&
      checkout.metadata?.courseId === courseId &&
      checkout.metadata?.userId === user.id &&
      checkout.currency?.toLowerCase() === env.STRIPE_CURRENCY &&
      paidAmount !== null;

    if (!isValidCheckout || !courseId) {
      return {
        status: "error",
        message: "Payment could not be verified.",
      };
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      select: {
        amount: true,
      },
    });

    if (enrollment && enrollment.amount !== paidAmount) {
      return {
        status: "error",
        message: "Payment amount does not match this enrollment.",
      };
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        slug: true,
      },
    });

    if (!course) {
      return {
        status: "error",
        message: "The purchased course is no longer available.",
      };
    }

    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
      create: {
        userId: user.id,
        courseId,
        amount: paidAmount,
        status: "Active",
      },
      update: {
        amount: paidAmount,
        status: "Active",
      },
    });

    return {
      status: "success",
      message: "Payment successful. You are now enrolled!",
      data: {
        watchUrl: `/dashboard/${course.slug}`,
      },
    };
  } catch (error) {
    console.error("Unable to verify Stripe checkout", error);

    return {
      status: "error",
      message: "Payment verification failed. Please refresh this page.",
    };
  }
}

export async function cancelStripeCheckoutAction(
  courseId: string,
): Promise<ApiResponse> {
  const user = await requireUser();

  try {
    await prisma.enrollment.updateMany({
      where: {
        userId: user.id,
        courseId,
        status: "Pending",
      },
      data: {
        status: "Cancelled",
      },
    });

    return {
      status: "success",
      message: "Payment was cancelled.",
    };
  } catch (error) {
    console.error("Unable to cancel Stripe checkout", error);

    return {
      status: "error",
      message: "Unable to update the cancelled payment.",
    };
  }
}
