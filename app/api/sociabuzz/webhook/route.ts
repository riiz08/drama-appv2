import { supabase as supabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Webhook Sociabuzz diterima:", body);

    // --- Ambil data utama dari webhook ---
    const amount = body?.amount ?? 0;
    if (!amount || amount <= 0) {
      console.warn("❌ Jumlah donasi tidak valid:", amount);
      return NextResponse.json({ success: false, reason: "invalid amount" });
    }

    // --- Koneksi ke Supabase ---
    const supabase = supabaseClient;

    // Ambil record donasi aktif (asumsi hanya 1)
    const { data: goals, error: getError } = await supabase
      .from("donation_goal")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (getError || !goals) {
      console.error("Gagal ambil donation_goal:", getError);
      return NextResponse.json({ success: false, reason: "goal not found" });
    }

    // --- Hitung total baru ---
    const updatedAmount = (goals.current_amount ?? 0) + amount;

    // --- Update ke database ---
    const { error: updateError } = await supabase
      .from("donation_goal")
      .update({ current_amount: updatedAmount })
      .eq("id", goals.id);

    if (updateError) {
      console.error("Gagal update donation_goal:", updateError);
      return NextResponse.json({ success: false, reason: "update failed" });
    }

    revalidateTag("donation_goal");

    console.log(
      `✅ Donasi ${amount} IDR ditambahkan. Total sekarang: ${updatedAmount}`
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error webhook Sociabuzz:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
