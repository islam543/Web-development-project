import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import PostCard from "@/components/PostCard";
import UserSearchPanel from "@/components/UserSearchPanel";
import { Button, Card, CardBody, CardHeader, Textarea } from "@heroui/react";
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
      <Card shadow="sm">
        <CardHeader>
          <h2 className="text-xl font-semibold">Post details</h2>
        </CardHeader>
      </Card>

      <PostCard
        post={post}
        redirectTo={`/post/${params.postId}`}
        showDetailLink={false}
      />

      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Reply to this post</h3>
        </CardHeader>
        <CardBody>
        <form
          className="flex flex-col gap-3"
          action={`/api/posts/${post.id}/reply`}
          method="post"
        >
          <input type="hidden" name="redirectTo" value={`/post/${post.id}`} />
          <Textarea
            label="Your reply"
            name="content"
            placeholder="Write your reply..."
            maxLength={280}
            isRequired
          />
          <Button color="primary" type="submit" className="self-start">
            Reply
          </Button>
        </form>
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Replies ({post._count.replies})</h3>
        </CardHeader>
        <CardBody className="gap-3">
        {post.replies.length === 0 ? (
          <p className="text-default-500">No replies yet.</p>
        ) : (
          post.replies.map((reply) => (
            <article
              className="rounded-large border border-divider bg-content2 p-3"
              key={reply.id}
            >
              <header className="mb-2 flex flex-wrap items-center gap-2">
                <Link className="font-semibold" href={`/users/${reply.author.username}`}>
                  {reply.author.name}
                </Link>
                <span className="text-sm text-default-500">
                  @{reply.author.username}
                </span>
                <span className="text-sm text-default-500">
                  · {formatDate(reply.createdAt)}
                </span>
              </header>
              <p className="whitespace-pre-wrap">{reply.content}</p>
            </article>
          ))
        )}
        </CardBody>
      </Card>

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
