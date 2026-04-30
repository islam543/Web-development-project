"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, Button, Card, CardBody, CardHeader, Input } from "@heroui/react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card shadow="sm" className="w-full max-w-[520px]">
        <CardHeader className="flex-col items-start gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warning">
            Asteria
          </p>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-default-500">
            Log in to access your feed and profile network.
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          {error ? (
            <Alert color="danger" variant="flat" title="Login failed">
              {error}
            </Alert>
          ) : null}

          <form className="flex flex-col gap-3" action="/api/auth/login" method="post">
            <Input label="Email" type="email" name="email" isRequired />
            <Input
              label="Password"
              type="password"
              name="password"
              minLength={8}
              isRequired
            />
            <Button color="primary" type="submit">
            Log in
            </Button>
          </form>

          <p className="text-sm text-default-500">
            No account yet? <Link href="/register">Create one</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
