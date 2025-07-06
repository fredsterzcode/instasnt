"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import Link from 'next/link';

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [websites, setWebsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) window.location.href = '/auth';
      else {
        setUser(data.user);
        // Fetch user's websites
        const { data: sites } = await supabase
          .from('websites')
          .select('*')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false });
        setWebsites(sites || []);
        setLoading(false);
      }
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💼 My Projects</h1>
      <p className="mb-6">All your generated websites and assets will appear here.</p>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-2">Websites</h2>
          {websites.length === 0 ? (
            <div className="text-gray-500 mb-6">No websites yet.</div>
          ) : (
            <div className="mb-8">
              <table className="w-full text-left border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Name</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {websites.map(site => (
                    <tr key={site.id} className="border-t">
                      <td className="p-2">{site.name || 'Untitled'}</td>
                      <td className="p-2">{site.created_at ? new Date(site.created_at).toLocaleString() : ''}</td>
                      <td className="p-2">
                        <Link href={`/site-generator?id=${site.id}`} className="text-blue-600 underline">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Assets, blogs, etc. can be added here in the future */}
        </>
      )}
    </div>
  );
} 