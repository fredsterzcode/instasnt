import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is missing' }, { status: 500 });
  }
  const { user_id, email } = await req.json();
  if (!user_id || !email) {
    console.error('Missing user_id or email');
    return NextResponse.json({ error: 'Missing user_id or email' }, { status: 400 });
  }
  // Insert user with 10 credits if not exists
  const { error } = await supabaseAdmin
    .from('users')
    .upsert({ id: user_id, email, credits: 10 }, { onConflict: 'id' });
  if (error) {
    console.error('Supabase upsert error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 