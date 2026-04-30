"use client";

import { useState } from "react";
import { Avatar, Chip } from "@heroui/react";
import FollowButton from "@/components/FollowButton";

export default function ProfileSummaryCard({ profile, isSelf }) {
  const [followersCount, setFollowersCount] = useState(
    Number(profile._count.followers || 0),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar
          name={profile.name}
          src={profile.avatarUrl || undefined}
          size="lg"
        />
        <div>
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          <p className="text-sm text-default-500">@{profile.username}</p>
        </div>
      </div>

      {profile.bio ? <p>{profile.bio}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Chip variant="flat" size="sm" color="default">
          {followersCount} followers
        </Chip>
        <Chip variant="flat" size="sm" color="default">
          {profile._count.following} following
        </Chip>
        <Chip variant="flat" size="sm" color="default">
          {profile._count.posts} posts
        </Chip>
      </div>

      {isSelf ? null : (
        <FollowButton
          username={profile.username}
          initialIsFollowing={profile.isFollowedByViewer}
          initialFollowersCount={followersCount}
          onFollowerCountChange={setFollowersCount}
        />
      )}
    </div>
  );
}
