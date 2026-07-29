import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import arcjet from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 200 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);
const allowedVideoTypes = new Map([
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
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
      { error: "Only admins can upload course media" },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    fileName?: string;
    contentType?: string;
    size?: number;
    mediaType?: "image" | "video";
  };
  const contentType = body.contentType ?? "";
  const resourceType = body.mediaType === "video" ? "video" : "image";
  const isVideo = resourceType === "video";
  const extension = isVideo
    ? allowedVideoTypes.get(contentType)
    : allowedImageTypes.get(contentType);

  if (!extension) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Only MP4, WebM, and MOV videos are allowed"
          : "Only JPG, PNG, WebP, GIF, and AVIF images are allowed",
      },
      { status: 400 },
    );
  }

  const maxFileSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (!body.size || body.size > maxFileSize) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Video size must be 200 MB or less"
          : "Image size must be 5 MB or less",
      },
      { status: 400 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = isVideo
    ? `course-videos/${session.user.id}`
    : `course-thumbnails/${session.user.id}`;
  const publicId = randomUUID();
  const signaturePayload = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const signature = createHash("sha1").update(signaturePayload).digest("hex");

  return NextResponse.json({
    apiKey: env.CLOUDINARY_API_KEY,
    folder,
    publicId,
    signature,
    timestamp,
    uploadUrl:
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}` +
      `/${resourceType}/upload`,
  });
}
