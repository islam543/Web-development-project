import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import UserSearchPanel from "@/components/UserSearchPanel";
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
      <section className="card">
        <h2 className="section-title">Your Feed</h2>
        <p className="muted">Latest notes from across Asteria.</p>
      </section>

      <PostComposer redirectTo="/feed" />

      <section className="stack-list">
        {posts.length === 0 ? (
          <section className="card">
            <p className="muted">No posts yet. Share the first note.</p>
          </section>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} redirectTo="/feed" />
          ))
        )}
      </section>
    </AppShell>
  );
}
