import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // pakai service role biar bisa update
);

export async function GET() {
  try {
    // Ambil satu record aktif dari donation_goal
    const { data: goal, error } = await supabase
      .from("donation_goal")
      .select("*")
      .single();

    if (error || !goal) {
      console.error("Gagal ambil data donation_goal:", error);
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    // Dapatkan bulan sekarang dalam format YYYY-MM
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Jika bulan berganti, reset current_amount ke 0
    if (goal.last_reset_month !== currentMonth) {
      const { error: updateError } = await supabase
        .from("donation_goal")
        .update({
          current_amount: 0,
          last_reset_month: currentMonth,
        })
        .eq("id", goal.id);

      if (updateError) {
        console.error("Gagal reset data:", updateError);
      } else {
        goal.current_amount = 0;
        goal.last_reset_month = currentMonth;
      }
    }

    // Hitung progress (%)
    const progress = Math.min(
      Math.round((goal.current_amount / goal.target_amount) * 100),
      100
    );

    return NextResponse.json({
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      progress,
      currency: goal.base_currency,
      last_reset_month: goal.last_reset_month,
    });
  } catch (err) {
    console.error("Terjadi kesalahan di server:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
