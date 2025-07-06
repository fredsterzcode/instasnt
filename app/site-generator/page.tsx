"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  created_at?: string;
}

export default function SiteGeneratorPage() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get('id');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history if editing an existing site
  useEffect(() => {
    if (!websiteId) return;
    (async () => {
      const { data, error } = await supabase
        .from('website_chats')
        .select('*')
        .eq('website_id', websiteId)
        .order('created_at', { ascending: true });
      if (data) setChat(data);
    })();
  }, [websiteId]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    const newChat: ChatMessage[] = [...chat, { role: 'user', message: input }];
    setChat(newChat);
    setInput('');
    try {
      const res = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: newChat, websiteId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate site');
      setHtml(data.html);
      setCss(data.css);
      setChat([...newChat, { role: 'assistant', message: data.html } as ChatMessage]);
      setSuccess('AI updated your site!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      // Deduct 1 credit
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not logged in');
      const res = await fetch('/api/deduct-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.data.user.id, amount: 1 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to deduct credits');
      // Save site and chat
      let siteId = websiteId;
      if (!siteId) {
        // Create new site
        const { data: site, error: siteError } = await supabase.from('websites').insert({
          user_id: user.data.user.id,
          name: chat[0]?.message || 'Untitled',
          html,
          css
        }).select().single();
        if (siteError) throw new Error(siteError.message);
        siteId = site.id;
      } else {
        // Update existing site
        const { error: updateError } = await supabase.from('websites').update({ html, css }).eq('id', siteId);
        if (updateError) throw new Error(updateError.message);
      }
      // Save chat history
      for (const msg of chat) {
        if (!msg.id) {
          await supabase.from('website_chats').insert({
            website_id: siteId,
            user_id: user.data.user.id,
            role: msg.role,
            message: msg.message
          });
        }
      }
      setSuccess('Site and chat saved!');
      router.push(`/site-generator?id=${siteId}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="flex flex-col items-center p-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">AI Website Chat Builder</h1>
      <div className="w-full max-w-2xl border rounded p-4 mb-4 bg-white min-h-[300px] flex flex-col">
        {chat.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}> 
            <span className={`inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>{msg.message}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex w-full max-w-2xl mb-4">
        <input
          className="flex-1 p-2 border rounded mr-2"
          placeholder="Send a prompt to improve your site..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          disabled={loading}
        />
        <button
          className="px-4 py-2 bg-black text-white rounded"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {(html || css) && (
        <>
          <h2 className="text-xl font-bold mt-8 mb-2">Live Preview</h2>
          <div className="w-full max-w-2xl border rounded overflow-hidden mb-4" style={{ minHeight: 400 }}>
            <iframe
              title="Preview"
              srcDoc={`<style>${css}</style>${html}`}
              className="w-full h-[400px] bg-white"
            />
          </div>
          <button
            className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition"
            onClick={handleSave}
          >
            Save Site & Chat (1 credit)
          </button>
        </>
      )}
    </main>
  );
} 