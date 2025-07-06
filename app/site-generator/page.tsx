"use client";
import { Suspense, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import DOMPurify from 'dompurify';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  created_at?: string;
}
interface Page {
  id: string;
  name: string;
  chat: ChatMessage[];
  html: string;
  css: string;
}

export default function SiteGeneratorPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SiteGeneratorPage />
    </Suspense>
  );
}

function SiteGeneratorPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a Home page if none exist
  useEffect(() => {
    if (pages.length === 0) {
      const homeId = crypto.randomUUID();
      setPages([{ id: homeId, name: 'Home', chat: [], html: '', css: '' }]);
      setCurrentPageId(homeId);
    }
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pages, currentPageId]);

  const currentPage = pages.find(p => p.id === currentPageId);

  const handleSend = async () => {
    if (!input.trim() || !currentPage) return;
    setLoading(true);
    setError('');
    setSuccess('');
    const newChat: ChatMessage[] = [...currentPage.chat, { role: 'user', message: input }];
    updatePage(currentPageId, { chat: newChat });
    setInput('');
    try {
      const res = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat: newChat })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate site');
      updatePage(currentPageId, { chat: [...newChat, { role: 'assistant', message: data.html }], html: data.html, css: data.css });
      setSuccess('AI updated your site!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  function updatePage(id: string, updates: Partial<Page>) {
    setPages(pages => pages.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  function addPage() {
    const newId = crypto.randomUUID();
    setPages([...pages, { id: newId, name: `Page ${pages.length + 1}`, chat: [], html: '', css: '' }]);
    setCurrentPageId(newId);
  }

  function renamePage(id: string, newName: string) {
    updatePage(id, { name: newName });
  }

  function deletePage(id: string) {
    if (pages.length === 1) return; // Always keep at least one page
    setPages(pages => pages.filter(p => p.id !== id));
    if (currentPageId === id) setCurrentPageId(pages[0].id);
  }

  // Sanitize HTML for preview
  function safePreview(html: string, css: string) {
    const cleanHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS: [ 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'img', 'section', 'header', 'footer', 'main', 'nav', 'article', 'aside', 'strong', 'em', 'b', 'i', 'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'form', 'input', 'label', 'button', 'blockquote', 'pre', 'code' ], ALLOWED_ATTR: [ 'href', 'src', 'alt', 'class', 'style', 'id', 'type', 'value', 'placeholder', 'name', 'rows', 'cols', 'width', 'height' ] });
    return `<style>${css}</style>${cleanHtml}`;
  }

  return (
    <div className="flex h-[90vh] bg-white rounded shadow overflow-hidden">
      {/* Sidebar: Pages */}
      <aside className="w-56 bg-black text-white flex flex-col p-4 space-y-2 border-r">
        <div className="font-bold text-lg mb-4">Pages</div>
        {pages.map(page => (
          <div key={page.id} className={`flex items-center mb-2 ${page.id === currentPageId ? 'bg-gray-800' : ''} rounded`}> 
            <button
              className="flex-1 text-left px-3 py-2 focus:outline-none"
              onClick={() => setCurrentPageId(page.id)}
            >
              {page.name}
            </button>
            <button className="px-2 text-xs hover:text-red-400" onClick={() => deletePage(page.id)} title="Delete page">✕</button>
          </div>
        ))}
        <button className="mt-4 px-3 py-2 bg-white text-black rounded hover:bg-gray-200" onClick={addPage}>+ Add Page</button>
      </aside>
      {/* Main: Chat and Preview */}
      <div className="flex-1 flex flex-row h-full">
        {/* Chat area */}
        <section className="w-[420px] flex flex-col border-r h-full bg-white">
          <div className="font-bold text-lg p-4 border-b">Chat: {currentPage?.name}</div>
          <div className="flex-1 overflow-y-auto p-4">
            {currentPage?.chat.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}> 
                <span className={`inline-block px-3 py-2 rounded ${msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}>{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t flex">
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
          {error && <div className="text-red-500 text-center mb-2">{error}</div>}
          {success && <div className="text-green-600 text-center mb-2">{success}</div>}
        </section>
        {/* Live Preview */}
        <section className="flex-1 flex flex-col h-full bg-gray-50">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="font-bold text-lg">Live Preview: {currentPage?.name}</div>
            {/* Export/Deploy buttons can go here */}
          </div>
          <div className="flex-1 overflow-auto p-6">
            {currentPage?.html || currentPage?.css ? (
              <iframe
                title="Preview"
                sandbox="allow-same-origin allow-forms allow-popups allow-pointer-lock allow-top-navigation"
                srcDoc={safePreview(currentPage.html, currentPage.css)}
                className="w-full h-full min-h-[600px] bg-white border rounded shadow"
                style={{ minHeight: 600 }}
              />
            ) : (
              <div className="text-gray-400 text-center mt-24">No preview yet. Start chatting to build your site!</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
} 