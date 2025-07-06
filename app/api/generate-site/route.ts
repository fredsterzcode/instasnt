import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { chat, websiteId } = await req.json();
  if (!chat || !Array.isArray(chat) || chat.length === 0) {
    return NextResponse.json({ error: 'Missing chat history' }, { status: 400 });
  }
  try {
    // Build OpenAI messages from chat history
    const messages = [
      { role: 'system', content: 'You are an expert web developer. Generate a modern, responsive landing page using HTML and Tailwind CSS. Return only the HTML and CSS.' },
      ...chat.map((msg: any) => ({ role: msg.role, content: msg.message }))
    ];
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1800,
    });
    const content = completion.choices[0].message.content || '';
    // Try to split HTML and CSS if possible
    let html = content;
    let css = '';
    const cssMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (cssMatch) {
      css = cssMatch[1];
      html = content.replace(cssMatch[0], '');
    }
    // Save chat messages if websiteId is provided
    if (websiteId) {
      const lastUserMsg = chat[chat.length - 1];
      await supabase.from('website_chats').insert([
        {
          website_id: websiteId,
          user_id: lastUserMsg.user_id || null,
          role: 'user',
          message: lastUserMsg.message
        },
        {
          website_id: websiteId,
          user_id: lastUserMsg.user_id || null,
          role: 'assistant',
          message: html
        }
      ]);
    }
    return NextResponse.json({ html, css });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'OpenAI error' }, { status: 500 });
  }
} 