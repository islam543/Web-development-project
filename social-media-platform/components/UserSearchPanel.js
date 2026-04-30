import Link from "next/link";

export default function UserSearchPanel({ query, users, redirectTo }) {
  return (
    <section className="card">
      <h2 className="section-title">Discover people</h2>

      <form action="/feed" method="get" className="search-form">
        <input
          className="input"
          type="search"
          name="q"
          placeholder="Search by name or username"
          defaultValue={query}
        />
        <button className="secondary-btn" type="submit">
          Search
        </button>
      </form>

      <div className="search-results">
        {users.length === 0 ? (
          <p className="muted">No users found.</p>
        ) : (
          users.map((user) => (
            <article className="search-user" key={user.id}>
              <div>
                <Link href={`/users/${user.username}`} className="post-author">
                  {user.name}
                </Link>
                <p className="muted">@{user.username}</p>
                <p className="muted tiny">
                  {user._count.followers} followers · {user._count.posts} posts
                </p>
              </div>

              <form action={`/api/users/${user.username}/follow`} method="post">
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <button className="secondary-btn" type="submit">
                  {user.isFollowedByViewer ? "Unfollow" : "Follow"}
                </button>
              </form>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
