import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decision = await arcjet.protect(request, {
      fingerprint: session.user.id,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "Request blocked" }, { status: 403 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete course thumbnails" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const key = body.key;

    const userPrefix = `course-thumbnails/${session.user.id}/`;

    if (typeof key !== "string" || !key.startsWith(userPrefix)) {
      return NextResponse.json(
        { error: "Missing or invalid object key" },
        { status: 400 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `public_id=${key}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
    const signature = createHash("sha1").update(signaturePayload).digest("hex");
    const formData = new URLSearchParams({
      api_key: env.CLOUDINARY_API_KEY,
      public_id: key,
      signature,
      timestamp: String(timestamp),
    });
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      },
    );
    const result = (await cloudinaryResponse.json()) as {
      result?: string;
      error?: { message?: string };
    };

    if (!cloudinaryResponse.ok || !["ok", "not found"].includes(result.result ?? "")) {
      throw new Error(result.error?.message ?? "Cloudinary delete failed");
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
