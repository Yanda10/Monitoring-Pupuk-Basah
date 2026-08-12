import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ESP32 mengirim data ke endpoint ini via POST
export async function POST(request) {
  try {
    const { ph, temp, tds } = await request.json();

    const { data, error } = await supabase
      .from('sensor_data')
      .insert([{ ph, temp, tds }]);

    if (error) throw error;
    return NextResponse.json({ message: 'Data berhasil disimpan' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Frontend mengambil data via GET
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sensor_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}