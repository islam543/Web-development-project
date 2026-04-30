import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import UserSearchPanel from "@/components/UserSearchPanel";
import { getCurrentUser } from "@/lib/session";
import {
  getPlatformStats,
  searchUsers,
} from "@/lib/repositories/socialRepository";

export const dynamic = "force-dynamic";

export default async function StatsPage({ searchParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const query = searchParams?.q?.trim() ?? "";
  const [stats, users] = await Promise.all([
    getPlatformStats(),
    searchUsers({ query, viewerId: currentUser.id }),
  ]);

  const statCards = [
    { label: "Total users", value: stats.totalUsers },
    { label: "Total posts", value: stats.totalPosts },
    { label: "Total replies", value: stats.totalReplies },
    { label: "Total likes", value: stats.totalLikes },
    { label: "Total follow relationships", value: stats.totalFollows },
    {
      label: "Average followers per user",
      value: stats.avgFollowersPerUser.toFixed(2),
    },
    {
      label: "Average posts per user",
      value: stats.avgPostsPerUser.toFixed(2),
    },
    {
      label: "Average likes per post",
      value: stats.avgLikesPerPost.toFixed(2),
    },
  ];

  return (
    <AppShell
      user={currentUser}
      rightPanel={
        <UserSearchPanel query={query} users={users} redirectTo="/stats" />
      }
    >
      <section className="card">
        <h2 className="section-title">Platform statistics</h2>
      </section>

      <section className="stats-grid">
        {statCards.map((item) => (
          <article className="card stat-card" key={item.label}>
            <p className="muted tiny">{item.label}</p>
            <p className="stat-value">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="card">
        <h3 className="section-title">Most active user in last 90 days</h3>
        {stats.mostActiveUserLast90Days ? (
          <p>
            {stats.mostActiveUserLast90Days.name} (@
            {stats.mostActiveUserLast90Days.username}) with{" "}
            {stats.mostActiveUserLast90Days.activity} combined posts and replies.
          </p>
        ) : (
          <p className="muted">No activity data available.</p>
        )}
      </section>

      <section className="card">
        <h3 className="section-title">Most followed user</h3>
        {stats.mostFollowedUser ? (
          <p>
            {stats.mostFollowedUser.name} (@{stats.mostFollowedUser.username}) has{" "}
            {stats.mostFollowedUser.followers} followers.
          </p>
        ) : (
          <p className="muted">No follow data available.</p>
        )}
      </section>
    </AppShell>
  );
}
