import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";
import ProfileSummaryCard from "@/components/ProfileSummaryCard";
import UserSearchPanel from "@/components/UserSearchPanel";
import { Button, Card, CardBody } from "@heroui/react";
import { getCurrentUser } from "@/lib/session";
import {
  getProfileByUsername,
  searchUsers,
} from "@/lib/repositories/socialRepository";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({ params, searchParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const [profile, users] = await Promise.all([
    getProfileByUsername({
      username: params.username,
      viewerId: currentUser.id,
    }),
    searchUsers({
      query: searchParams?.q?.trim() ?? "",
      viewerId: currentUser.id,
    }),
  ]);

  if (!profile) notFound();

  const isSelf = currentUser.username === profile.username;

  return (
    <AppShell
      user={currentUser}
      rightPanel={
        <UserSearchPanel
          query={searchParams?.q?.trim() ?? ""}
          users={users}
          redirectTo={`/users/${profile.username}`}
        />
      }
    >
      <section className="card">
        <h2 className="section-title">{profile.name}</h2>
        <p className="muted">@{profile.username}</p>
        {profile.bio ? <p>{profile.bio}</p> : null}
        <p className="muted tiny">
          {profile._count.followers} followers · {profile._count.following}{" "}
          following · {profile._count.posts} posts
        </p>

        {isSelf ? null : (
          <form
            action={`/api/users/${profile.username}/follow`}
            method="post"
            className="inline-form"
          >
            <input
              type="hidden"
              name="redirectTo"
              value={`/users/${profile.username}`}
            />
            <button className="secondary-btn" type="submit">
              {profile.isFollowedByViewer ? "Unfollow" : "Follow"}
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h3 className="section-title">Posts by {profile.name}</h3>
        {profile.posts.length === 0 ? (
          <Card shadow="sm">
            <CardBody>
              <p className="text-default-500">No posts yet.</p>
            </CardBody>
          </Card>
        ) : (
          profile.posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              redirectTo={`/users/${profile.username}`}
              currentUserId={currentUser.id}
            />
          ))
        )}
      </section>

      <Card shadow="sm">
        <CardBody>
          <Button as={Link} href="/feed" variant="flat" color="default" className="self-start">
            Back to feed
          </Button>
        </CardBody>
      </Card>
    </AppShell>
  );
}