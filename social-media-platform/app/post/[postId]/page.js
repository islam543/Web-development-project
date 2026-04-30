import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";
import UserSearchPanel from "@/components/UserSearchPanel";
import { getCurrentUser } from "@/lib/session";
import {
  getPostDetail,
  searchUsers,
} from "@/lib/repositories/socialRepository";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params, searchParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const [post, users] = await Promise.all([
    getPostDetail(params.postId, currentUser.id),
    searchUsers({
      query: searchParams?.q?.trim() ?? "",
      viewerId: currentUser.id,
    }),
  ]);

  if (!post) notFound();

  return (
    <AppShell
      user={currentUser}
      rightPanel={
        <UserSearchPanel
          query={searchParams?.q?.trim() ?? ""}
          users={users}
          redirectTo={`/post/${params.postId}`}
        />
      }
    >
      <section className="card">
        <h2 className="section-title">Post details</h2>
      </section>

      <PostCard post={post} redirectTo={`/post/${params.postId}`} showDetailLink={false} />

      <section className="card">
        <h3 className="section-title">Reply to this post</h3>
        <form
          className="stack-form"
          action={`/api/posts/${post.id}/reply`}
          method="post"
        >
          <input type="hidden" name="redirectTo" value={`/post/${post.id}`} />
          <textarea
            className="textarea"
            name="content"
            placeholder="Write your reply..."
            maxLength={280}
            required
          />
          <button className="primary-btn" type="submit">
            Reply
          </button>
        </form>
      </section>

      <section className="card">
        <h3 className="section-title">Replies ({post._count.replies})</h3>
        {post.replies.length === 0 ? (
          <p className="muted">No replies yet.</p>
        ) : (
          post.replies.map((reply) => (
            <article className="reply-card" key={reply.id}>
              <header className="post-header">
                <Link className="post-author" href={`/users/${reply.author.username}`}>
                  {reply.author.name}
                </Link>
                <span className="muted">@{reply.author.username}</span>
                <span className="muted">· {formatDate(reply.createdAt)}</span>
              </header>
              <p>{reply.content}</p>
            </article>
          ))
        )}
      </section>

      <section className="card">
        <Link className="link-btn" href="/feed">
          Back to feed
        </Link>
      </section>
    </AppShell>
  );
}
