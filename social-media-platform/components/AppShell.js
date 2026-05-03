import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Link as HeroLink,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppShell({ user, rightPanel, children }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-[1320px] grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)_340px]">
      <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-4">
        <Card shadow="sm">
          <CardHeader className="flex-col items-start gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warning">
              Asteria
            </p>
            <h1 className="text-2xl font-semibold">Social Circle</h1>
          </CardHeader>
        </Card>

        <Card shadow="sm">
          <CardBody className="p-2">
            <p className="pb-1 px-2 text-sm text-default-500">Navigation</p>
            <nav className="flex flex-col gap-1">
              <HeroLink
                as={Link}
                href="/feed"
                color="foreground"
                underline="none"
                className="block rounded-medium px-3 py-2 hover:bg-default-100"
              >
                Feed
              </HeroLink>
              <HeroLink
                as={Link}
                href={`/users/${user.username}`}
                color="foreground"
                underline="none"
                className="block rounded-medium px-3 py-2 hover:bg-default-100"
              >
                My Profile
              </HeroLink>
              <HeroLink
                as={Link}
                href="/stats"
                color="foreground"
                underline="none"
                className="block rounded-medium px-3 py-2 hover:bg-default-100"
              >
                Statistics
              </HeroLink>
            </nav>
          </CardBody>
        </Card>

        <Card shadow="sm">
          <CardBody className="gap-3">
            <div className="flex items-center gap-3">
              <Badge color="success" content="" isDot placement="bottom-right">
                <Avatar
                  name={user.name}
                  src={user.avatarUrl || undefined}
                  size="md"
                />
              </Badge>
              <div>
                <p className="font-semibold leading-tight">{user.name}</p>
                <p className="text-sm text-default-500">@{user.username}</p>
              </div>
            </div>
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="bordered" color="default" fullWidth>
                Log out
              </Button>
            </form>
          </CardBody>
        </Card>
      </aside>

      <main className="flex min-w-0 flex-col gap-4">{children}</main>
      <aside className="flex flex-col gap-4 lg:sticky lg:top-4">{rightPanel}</aside>
    </div>
  );
}