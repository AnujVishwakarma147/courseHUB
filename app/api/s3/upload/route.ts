import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
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
      { error: "Only admins can upload course thumbnails" },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    fileName?: string;
    contentType?: string;
    size?: number;
  };
  const contentType = body.contentType ?? "";
  const extension = allowedImageTypes.get(contentType);

  if (!extension) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP, GIF, and AVIF images are allowed" },
      { status: 400 },
    );
  }

  if (!body.size || body.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Image size must be 5 MB or less" },
      { status: 400 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `course-thumbnails/${session.user.id}`;
  const publicId = randomUUID();
  const signaturePayload = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = createHash("sha1").update(signaturePayload).digest("hex");

  return NextResponse.json({
    apiKey: env.CLOUDINARY_API_KEY,
    folder,
    publicId,
    signature,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
  });
}
