import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import UserSearchPanel from "@/components/UserSearchPanel";
import { Card, CardBody, CardHeader } from "@heroui/react";
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
      <Card shadow="sm">
        <CardHeader>
          <h2 className="text-xl font-semibold">Platform statistics</h2>
        </CardHeader>
      </Card>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item) => (
          <Card shadow="sm" key={item.label}>
            <CardBody>
              <p className="text-xs text-default-500">{item.label}</p>
              <p className="text-3xl font-semibold">{item.value}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Most active user in last 90 days</h3>
        </CardHeader>
        <CardBody>
        {stats.mostActiveUserLast90Days ? (
          <p>
            {stats.mostActiveUserLast90Days.name} (@
            {stats.mostActiveUserLast90Days.username}) with{" "}
            {stats.mostActiveUserLast90Days.activity} combined posts and replies.
          </p>
        ) : (
          <p className="text-default-500">No activity data available.</p>
        )}
        </CardBody>
      </Card>

      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Most followed user</h3>
        </CardHeader>
        <CardBody>
        {stats.mostFollowedUser ? (
          <p>
            {stats.mostFollowedUser.name} (@{stats.mostFollowedUser.username}) has{" "}
            {stats.mostFollowedUser.followers} followers.
          </p>
        ) : (
          <p className="text-default-500">No follow data available.</p>
        )}
        </CardBody>
      </Card>
    </AppShell>
  );
}
