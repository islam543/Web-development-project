import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
import { getSafeRedirectPath } from "@/lib/redirects";
import { createPost, getFeedPosts } from "@/lib/repositories/socialRepository";

export const runtime = "nodejs";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await getFeedPosts(user.id);
  return NextResponse.json({ posts });
}

function getImageExtension(mimeType) {
  const raw = String(mimeType || "").split("/")[1] || "png";
  const safe = raw.toLowerCase().replace(/[^a-z0-9.+-]/g, "");
  return safe || "png";
}

async function persistImage(bytes, mimeType) {
  if (!mimeType?.startsWith("image/")) return null;

  const ext = getImageExtension(mimeType);
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const targetFile = path.join(uploadDir, fileName);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(targetFile, bytes);

  return `/uploads/${fileName}`;
}

async function saveImageFile(imageFile) {
  if (!imageFile || typeof imageFile.arrayBuffer !== "function") return null;

  const bytes = Buffer.from(await imageFile.arrayBuffer());

  if (bytes.length === 0) return null;

  return persistImage(bytes, imageFile.type);
}

async function saveImageDataUrl(imageDataUrl) {
  if (!imageDataUrl) return null;

  const match = String(imageDataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) return null;

  const mimeType = match[1];
  const base64Payload = match[2];
  const bytes = Buffer.from(base64Payload, "base64");

  if (bytes.length === 0) return null;

  return persistImage(bytes, mimeType);
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  const expectsJson = contentType.includes("application/json");
  const user = await getUserFromRequest(request);

  if (!user) {
    if (expectsJson) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (expectsJson) {
    let payload = null;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON payload." },
        { status: 400 },
      );
    }

    const content = String(payload?.content || "").trim();
    const redirectTo = getSafeRedirectPath(payload?.redirectTo, "/feed");
    const imageDataUrl = payload?.imageDataUrl;

    if (!content && !imageDataUrl) {
      return NextResponse.json(
        { ok: false, error: "Post cannot be empty." },
        { status: 400 },
      );
    }

    const imageUrl = await saveImageDataUrl(imageDataUrl);
    if (imageDataUrl && !imageUrl) {
      return NextResponse.json(
        { ok: false, error: "Image payload is invalid." },
        { status: 400 },
      );
    }

    try {
      const post = await createPost({
        authorId: user.id,
        content: content || "Shared an image",
        imageUrl,
      });

      return NextResponse.json({
        ok: true,
        postId: post.id,
        redirectTo: redirectTo || `/post/${post.id}`,
      });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Failed to create post." },
        { status: 500 },
      );
    }
  }

  const formData = await request.formData();
  const content = String(formData.get("content") || "").trim();
  const redirectTo = getSafeRedirectPath(formData.get("redirectTo"));
  const image = formData.get("image");

  if (!content && (!image || image.size === 0)) {
    return NextResponse.redirect(
      new URL(`${redirectTo}?error=Post+cannot+be+empty`, request.url),
    );
  }

  const imageUrl = await saveImageFile(image);

  await createPost({
    authorId: user.id,
    content: content || "Shared an image",
    imageUrl,
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
