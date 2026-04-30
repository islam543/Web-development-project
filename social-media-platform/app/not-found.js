import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="brand-kicker">Asteria</p>
        <h1 className="auth-title">Page not found</h1>
        <p className="muted">The profile or post you requested does not exist.</p>
        <p>
          <Link href="/feed">Return to feed</Link>
        </p>
      </div>
    </div>
  );
}
