"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
} from "@heroui/react";
import FollowButton from "@/components/FollowButton";

function SearchUserRow({ user }) {
  const [followersCount, setFollowersCount] = useState(
    Number(user._count.followers || 0),
  );

  return (
    <article className="flex items-center justify-between gap-3 rounded-large border border-divider bg-content2 p-3">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center gap-3">
          <Avatar
            size="sm"
            name={user.name}
            src={user.avatarUrl || undefined}
          />
          <div className="min-w-0">
            <Link href={`/users/${user.username}`} className="truncate font-semibold">
              {user.name}
            </Link>
            <p className="truncate text-sm text-default-500">@{user.username}</p>
          </div>
        </div>
        <p className="text-xs text-default-500">
          {followersCount} followers · {user._count.posts} posts
        </p>
      </div>

      <FollowButton
        username={user.username}
        initialIsFollowing={user.isFollowedByViewer}
        initialFollowersCount={followersCount}
        onFollowerCountChange={setFollowersCount}
      />
    </article>
  );
}

export default function UserSearchPanel({ query, users, redirectTo }) {
  const searchAction = redirectTo || "/feed";

  return (
    <Card shadow="sm">
      <CardHeader className="flex-col items-start gap-1">
        <h2 className="text-lg font-semibold">Discover people</h2>
        <p className="text-sm text-default-500">
          Search by name or username and follow instantly.
        </p>
      </CardHeader>
      <CardBody className="gap-3">
        <form action={searchAction} method="get" className="flex gap-2 max-sm:flex-col">
          <Input
            type="search"
            name="q"
            placeholder="Search by name or username"
            defaultValue={query}
          />
          <Button type="submit" variant="flat" color="default">
            Search
          </Button>
        </form>

        <div className="flex flex-col gap-3">
          {users.length === 0 ? (
            <p className="text-sm text-default-500">No users found.</p>
          ) : (
            users.map((user) => <SearchUserRow key={user.id} user={user} />)
          )}
        </div>
      </CardBody>
    </Card>
  );
}
