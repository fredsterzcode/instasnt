import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { user_id, amount } = await req.json();
  if (!user_id || typeof amount !== 'number') {
    return NextResponse.json({ error: 'Missing user_id or amount' }, { status: 400 });
  }
  // Deduct credits atomically
  const { data, error } = await supabaseAdmin.rpc('deduct_credits', { user_id, amount });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true, credits: data });
} 