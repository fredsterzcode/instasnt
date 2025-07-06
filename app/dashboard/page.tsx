"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number|null>(null);
  const [brand, setBrand] = useState<string>('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) window.location.href = '/auth';
      else {
        setUser(data.user);
        // Fetch credits from users table
        const { data: userRow } = await supabase
          .from('users')
          .select('credits')
          .eq('id', data.user.id)
          .single();
        setCredits(userRow?.credits ?? null);
        // Fetch brand name (optional, placeholder)
        // const { data: brandKit } = await supabase.from('brand_kits').select('brand_name').eq('user_id', data.user.id).single();
        // setBrand(brandKit?.brand_name || '');
      }
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Welcome back{brand ? `, ${brand}` : ''}!</h1>
      <div className="mb-6 text-gray-700">{user && <span>Logged in as: <span className="font-mono">{user.email}</span></span>}</div>
      <div className="flex items-center mb-8 space-x-6">
        <div className="bg-black text-white px-6 py-4 rounded text-xl font-bold">Credits: {credits === null ? '(loading...)' : credits}</div>
        <div className="text-gray-500">Usage this month: <span className="font-mono">(soon)</span></div>
      </div>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/site-generator" className="block bg-gray-900 text-white rounded p-4 text-center font-semibold hover:bg-gray-700 transition">Start a new website</Link>
        <Link href="/design-studio" className="block bg-gray-900 text-white rounded p-4 text-center font-semibold hover:bg-gray-700 transition">Generate a logo</Link>
        <Link href="/copywriting" className="block bg-gray-900 text-white rounded p-4 text-center font-semibold hover:bg-gray-700 transition">Write content</Link>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Recent Projects</h2>
        <div className="bg-gray-100 rounded p-4 text-gray-500">(Websites, assets, blogs will appear here soon)</div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Recommended Tools</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/site-generator" className="px-3 py-1 bg-black text-white rounded text-sm">🌐 Website Builder</Link>
          <Link href="/design-studio" className="px-3 py-1 bg-black text-white rounded text-sm">🎨 Design Studio</Link>
          <Link href="/copywriting" className="px-3 py-1 bg-black text-white rounded text-sm">🧠 AI Copywriting</Link>
          <Link href="/ad-social" className="px-3 py-1 bg-black text-white rounded text-sm">📣 Ad & Social Creator</Link>
        </div>
      </div>
    </div>
  );
} 