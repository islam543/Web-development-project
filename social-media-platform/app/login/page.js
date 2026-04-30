import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  const error = searchParams?.error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="brand-kicker">Asteria</p>
        <h1 className="auth-title">Welcome back</h1>
        <p className="muted">Log in to access your feed and profile network.</p>

        {error ? <p className="error-banner">{error}</p> : null}

        <form className="stack-form" action="/api/auth/login" method="post">
          <label>
            <span>Email</span>
            <input className="input" type="email" name="email" required />
          </label>
          <label>
            <span>Password</span>
            <input
              className="input"
              type="password"
              name="password"
              minLength={8}
              required
            />
          </label>
          <button className="primary-btn" type="submit">
            Log in
          </button>
        </form>

        <p className="muted">
          No account yet? <Link href="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
