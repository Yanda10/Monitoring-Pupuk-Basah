import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ... (Simpan method GET dan POST yang sudah ada di sini) ...

// Tambahkan handler DELETE berikut:
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Ganti 'sensor_logs' dengan NAMA TABEL kamu di Supabase
    const tableName = 'sensor_logs'; 

    if (id) {
      // 1. Hapus SATU baris spesifik jika ada query ?id=...
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ message: 'Data berhasil dihapus' }, { status: 200 });
    } else {
      // 2. Hapus SEMUA data di tabel
      const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('id', 0); // Menghapus semua baris yang ID-nya bukan 0

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ message: 'Semua log berhasil dibersihkan' }, { status: 200 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}