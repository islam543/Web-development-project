import Link from "next/link";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function PostCard({ post, redirectTo, showDetailLink = true, currentUserId }) {
  const isOwn = currentUserId && post.author?.id === currentUserId;

  return (
    <article className="post-card">
      <header className="post-header">
        <Link className="post-author" href={`/users/${post.author.username}`}>
          {post.author.name}
        </Link>
        <span className="muted">@{post.author.username}</span>
        <span className="muted">· {formatDate(post.createdAt)}</span>
        {isOwn && (
          <form
            action={`/api/posts/${post.id}/delete`}
            method="post"
            style={{ marginLeft: "auto" }}
          >
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
                className="icon-btn"
                type="submit"
                style={{ color: "inherit" }}

>
                   Delete
                  </button>

          </form>
        )}
      </header>

      <p className="post-content">{post.content}</p>

      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="post-image" src={post.imageUrl} alt="Post attachment" />
      ) : null}

      <div className="post-actions">
        <form action={`/api/posts/${post.id}/like`} method="post">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button className="icon-btn" type="submit">
            {post.likedByViewer ? "Unlike" : "Like"} ({post._count.likes})
          </button>
        </form>

        <form action={`/api/posts/${post.id}/repost`} method="post">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button className="icon-btn" type="submit">
            {post.repostedByViewer ? "Undo repost" : "Repost"} ({post._count.reposts})
          </button>
        </form>

        {showDetailLink ? (
          <Link className="icon-btn link-btn" href={`/post/${post.id}`}>
            Replies ({post._count.replies})
          </Link>
        ) : (
          <span className="muted">Replies ({post._count.replies})</span>
        )}
      </div>
    </article>
  );
}