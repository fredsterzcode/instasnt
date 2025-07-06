"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) window.location.href = '/auth';
      else {
        setUser(data.user);
        setEmail(data.user.email || '');
        // Optionally fetch name from a profile table or metadata
        setName(data.user.user_metadata?.name || '');
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    const { error } = await supabase.auth.updateUser({
      email,
      data: { name }
    });
    if (error) setError(error.message);
    else setSuccess('Profile updated!');
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👤 Account</h1>
      <form onSubmit={handleUpdate} className="bg-white p-6 rounded shadow mb-6">
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Name</label>
          <input
            className="w-full p-2 border rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input
            className="w-full p-2 border rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email"
            type="email"
          />
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Update Profile</button>
        {success && <div className="text-green-600 mt-2">{success}</div>}
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
      <div className="bg-gray-100 p-4 rounded">
        <div className="mb-2 font-semibold">Credits</div>
        <div className="text-xl">(coming soon)</div>
      </div>
    </div>
  );
} 