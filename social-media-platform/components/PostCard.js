import Link from "next/link";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
} from "@heroui/react";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function PostCard({ post, redirectTo, showDetailLink = true }) {
  return (
    <Card as="article" shadow="sm">
      <CardHeader className="flex flex-wrap items-center gap-3">
        <Avatar
          name={post.author.name}
          src={post.author.avatarUrl || undefined}
          size="sm"
        />
        <div className="flex min-w-0 flex-col">
          <Link className="truncate font-semibold" href={`/users/${post.author.username}`}>
            {post.author.name}
          </Link>
          <p className="text-sm text-default-500">@{post.author.username}</p>
        </div>
        <Chip variant="flat" size="sm" color="default">
          {formatDate(post.createdAt)}
        </Chip>
      </CardHeader>

      <CardBody className="gap-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="w-full rounded-large border border-divider object-cover"
          src={post.imageUrl}
          alt="Post attachment"
        />
      ) : null}
      </CardBody>

      <CardFooter className="flex flex-wrap gap-2">
        <form action={`/api/posts/${post.id}/like`} method="post">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button variant="flat" color="default" type="submit" size="sm">
            {post.likedByViewer ? "Unlike" : "Like"} ({post._count.likes})
          </Button>
        </form>

        <form action={`/api/posts/${post.id}/repost`} method="post">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button variant="flat" color="default" type="submit" size="sm">
            {post.repostedByViewer ? "Undo repost" : "Repost"} (
            {post._count.reposts})
          </Button>
        </form>

        {showDetailLink ? (
          <Button
            as={Link}
            href={`/post/${post.id}`}
            variant="bordered"
            color="default"
            size="sm"
          >
            Replies ({post._count.replies})
          </Button>
        ) : (
          <Chip variant="flat" size="sm" color="default">
            Replies ({post._count.replies})
          </Chip>
        )}
      </CardFooter>
    </Card>
  );
}
