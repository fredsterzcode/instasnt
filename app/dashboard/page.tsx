"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number|null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) router.push('/auth');
      else {
        setUser(data.user);
        // Fetch credits from users table
        const { data: userRow } = await supabase
          .from('users')
          .select('credits')
          .eq('id', data.user.id)
          .single();
        setCredits(userRow?.credits ?? null);
      }
    });
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {user ? (
        <>
          <div className="mb-2">Logged in as: <span className="font-mono">{user.email}</span></div>
          <div className="mb-2">Credits: <span className="font-mono">{credits === null ? '(loading...)' : credits}</span></div>
          <div className="mt-8">(Site/asset list coming soon)</div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </main>
  );
} 