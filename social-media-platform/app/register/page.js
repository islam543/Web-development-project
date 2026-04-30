import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  const error = searchParams?.error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="brand-kicker">Asteria</p>
        <h1 className="auth-title">Create account</h1>
        <p className="muted">Join a more elegant social platform experience.</p>

        {error ? <p className="error-banner">{error}</p> : null}

        <form className="stack-form" action="/api/auth/register" method="post">
          <label>
            <span>Full name</span>
            <input className="input" type="text" name="name" required />
          </label>
          <label>
            <span>Username</span>
            <input className="input" type="text" name="username" required />
          </label>
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
            Create account
          </button>
        </form>

        <p className="muted">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
