import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import UserSearchPanel from "@/components/UserSearchPanel";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { getCurrentUser } from "@/lib/session";
import {
  getFeedPosts,
  searchUsers,
} from "@/lib/repositories/socialRepository";

export const dynamic = "force-dynamic";

export default async function FeedPage({ searchParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const query = searchParams?.q?.trim() ?? "";
  const [posts, users] = await Promise.all([
    getFeedPosts(currentUser.id),
    searchUsers({ query, viewerId: currentUser.id }),
  ]);

  return (
    <AppShell
      user={currentUser}
      rightPanel={<UserSearchPanel query={query} users={users} redirectTo="/feed" />}
    >
      <Card shadow="sm">
        <CardHeader className="flex-col items-start gap-1">
          <h2 className="text-xl font-semibold">Your Feed</h2>
          <p className="text-sm text-default-500">
            Latest notes from across Asteria.
          </p>
        </CardHeader>
      </Card>

      <PostComposer redirectTo="/feed" />

      <section className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <Card shadow="sm">
            <CardBody>
              <p className="text-default-500">No posts yet. Share the first note.</p>
            </CardBody>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              redirectTo="/feed"
              currentUserId={currentUser.id}
            />
          ))
        )}
      </section>
    </AppShell>
  );
}