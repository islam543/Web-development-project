import Link from "next/link";

export default function AppShell({ user, rightPanel, children }) {
  return (
    <div className="app-shell">
      <aside className="left-panel">
        <div className="brand-block">
          <p className="brand-kicker">Asteria</p>
          <h1 className="brand-title">Social Circle</h1>
        </div>

        <nav className="main-nav">
          <Link href="/feed">Feed</Link>
          <Link href={`/users/${user.username}`}>My Profile</Link>
          <Link href="/stats">Statistics</Link>
        </nav>

        <div className="account-box">
          <p className="account-name">{user.name}</p>
          <p className="account-handle">@{user.username}</p>
          <form action="/api/auth/logout" method="post">
            <button className="secondary-btn" type="submit">
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="main-panel">{children}</main>
      <aside className="right-panel">{rightPanel}</aside>
    </div>
  );
}
