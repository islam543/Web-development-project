import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/requestAuth";
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

async function saveImage(imageFile) {
  if (!imageFile || typeof imageFile.arrayBuffer !== "function") return null;

  const bytes = Buffer.from(await imageFile.arrayBuffer());
  if (bytes.length === 0) return null;
  if (!imageFile.type.startsWith("image/")) return null;

  const ext = imageFile.type.split("/")[1] || "png";
  const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const targetFile = path.join(uploadDir, fileName);

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(targetFile, bytes);

  return `/uploads/${fileName}`;
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();
  const content = String(formData.get("content") || "").trim();
  const redirectTo = String(formData.get("redirectTo") || "/feed");
  const image = formData.get("image");

  if (!content && (!image || image.size === 0)) {
    return NextResponse.redirect(
      new URL(`${redirectTo}?error=Post+cannot+be+empty`, request.url),
    );
  }

  const imageUrl = await saveImage(image);

  await createPost({
    authorId: user.id,
    content: content || "Shared an image",
    imageUrl,
  });

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
