import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Hello world!
      </h1>
      <div className="mt-6 flex flex-col items-start gap-2">
        <Link
          href="/journal"
          className="inline-flex min-h-11 items-center font-medium text-indigo-600 hover:text-indigo-800"
        >
          Read the journal →
        </Link>
        <Link
          href="/tracker"
          className="inline-flex min-h-11 items-center font-medium text-indigo-600 hover:text-indigo-800"
        >
          Routine tracker →
        </Link>
      </div>
    </main>
  );
}
