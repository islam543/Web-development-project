"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Textarea,
} from "@heroui/react";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export default function PostComposer({ redirectTo = "/feed" }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const trimmedContent = content.trim();

    if (!trimmedContent && !imageFile) {
      setError("Post cannot be empty.");
      return;
    }

    startTransition(async () => {
      try {
        let imageDataUrl = null;

        if (imageFile) {
          imageDataUrl = await fileToDataUrl(imageFile);
        }

        const response = await fetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: trimmedContent,
            redirectTo,
            imageDataUrl,
          }),
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "Failed to publish post.");
        }

        setContent("");
        setImageFile(null);
        router.push(payload.redirectTo || redirectTo);
        router.refresh();
      } catch (submitError) {
        setError(
          submitError?.message ||
            "Failed to publish post. Please try again in a moment.",
        );
      }
    });
  };

  return (
    <Card shadow="sm">
      <CardHeader className="flex-col items-start gap-1">
        <h2 className="text-xl font-semibold">Create a message</h2>
        <p className="text-sm text-default-500">Share what is on your mind.</p>
      </CardHeader>
      <CardBody>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          {error ? (
            <Alert color="danger" variant="flat" title="Could not publish post">
              {error}
            </Alert>
          ) : null}

          <Textarea
            label="Post content"
            placeholder="Share what is on your mind..."
            value={content}
            onValueChange={setContent}
            maxLength={320}
            minRows={4}
          />

          <Input
            type="file"
            accept="image/*"
            label="Attach image (optional)"
            onChange={(event) => {
              const nextFile = event.target.files?.[0] || null;
              setImageFile(nextFile);
            }}
          />

          <Button
            type="submit"
            color="primary"
            variant="solid"
            isLoading={isPending}
            className="self-start"
          >
            Publish
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
