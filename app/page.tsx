import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">InstantList</h1>
      <p className="mb-8">AI-powered website builder. Sign up or log in to get started.</p>
      <Link href="/auth" className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition">Login / Register</Link>
    </main>
  );
}
