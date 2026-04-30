"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, Button, Card, CardBody, CardHeader, Input } from "@heroui/react";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card shadow="sm" className="w-full max-w-[520px]">
        <CardHeader className="flex-col items-start gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warning">
            Asteria
          </p>
          <h1 className="text-3xl font-semibold">Create account</h1>
          <p className="text-sm text-default-500">
            Join a more elegant social platform experience.
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          {error ? (
            <Alert color="danger" variant="flat" title="Registration failed">
              {error}
            </Alert>
          ) : null}

          <form className="flex flex-col gap-3" action="/api/auth/register" method="post">
            <Input label="Full name" type="text" name="name" isRequired />
            <Input label="Username" type="text" name="username" isRequired />
            <Input label="Email" type="email" name="email" isRequired />
            <Input
              label="Password"
              type="password"
              name="password"
              minLength={8}
              isRequired
            />
            <Button color="primary" type="submit">
            Create account
            </Button>
          </form>

          <p className="text-sm text-default-500">
            Already registered? <Link href="/login">Log in</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
