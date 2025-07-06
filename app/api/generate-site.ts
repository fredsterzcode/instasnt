import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt) {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert web developer. Generate a modern, responsive landing page using HTML and Tailwind CSS. Return only the HTML and CSS.' },
        { role: 'user', content: prompt }
      ],
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
    return NextResponse.json({ html, css });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'OpenAI error' }, { status: 500 });
  }
} 