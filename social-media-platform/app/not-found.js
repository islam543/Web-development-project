import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-[520px] rounded-large border border-divider bg-content1 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-warning">
          Asteria
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-default-500">
          The profile or post you requested does not exist.
        </p>
        <p className="mt-4">
          <Link href="/feed">Return to feed</Link>
        </p>
      </div>
    </div>
  );
}
