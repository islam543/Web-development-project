"use client";

import { useState, useTransition } from "react";
import { Button, addToast } from "@heroui/react";

export default function FollowButton({
  username,
  initialIsFollowing,
  initialFollowersCount,
  onFollowerCountChange,
  size = "sm",
}) {
  const [isFollowing, setIsFollowing] = useState(Boolean(initialIsFollowing));
  const [followersCount, setFollowersCount] = useState(
    Number(initialFollowersCount || 0),
  );
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const previousFollowing = isFollowing;
    const previousFollowers = followersCount;
    const nextFollowing = !previousFollowing;
    const nextFollowers = Math.max(
      0,
      previousFollowers + (nextFollowing ? 1 : -1),
    );

    setIsFollowing(nextFollowing);
    setFollowersCount(nextFollowers);
    onFollowerCountChange?.(nextFollowers);

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/users/${encodeURIComponent(username)}/follow`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          },
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok || payload?.status !== "ok") {
          throw new Error(payload?.error || "Unable to update follow status");
        }

        setIsFollowing(Boolean(payload.following));

        if (typeof payload.followersCount === "number") {
          const safeCount = Math.max(0, payload.followersCount);
          setFollowersCount(safeCount);
          onFollowerCountChange?.(safeCount);
        }
      } catch {
        setIsFollowing(previousFollowing);
        setFollowersCount(previousFollowers);
        onFollowerCountChange?.(previousFollowers);
        addToast({
          title: "Follow update failed",
          description:
            "We could not update the follow status. Please try again.",
          color: "danger",
        });
      }
    });
  };

  return (
    <Button
      size={size}
      color={isFollowing ? "default" : "primary"}
      variant={isFollowing ? "bordered" : "solid"}
      isLoading={isPending}
      onPress={handleToggle}
    >
      {isFollowing ? "Unfollow" : "Follow"} ({followersCount})
    </Button>
  );
}
