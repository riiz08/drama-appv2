// /app/api/sociabuzz/webhook/route.js
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verifikasi tanda tangan / secret key (jika disediakan Sociabuzz)
    // misalnya: const signature = req.headers.get('x-sociabuzz-signature')

    console.log("Webhook diterima:", body);

    // Contoh: simpan ke database
    // await supabase.from('payments').insert(body);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error webhook:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
