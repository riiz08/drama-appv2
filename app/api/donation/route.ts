import { NextResponse } from "next/server";
import { unstable_cache, revalidateTag } from "next/cache";
import { supabase } from "@/lib/supabase";

// --- Fungsi untuk ambil dan update goal ---
const getDonationGoal = unstable_cache(
  async () => {
    // Ambil satu record aktif dari donation_goal
    const { data: goal, error } = await supabase
      .from("donation_goal")
      .select("*")
      .single();

    if (error || !goal) {
      console.error("Gagal ambil data donation_goal:", error);
      throw new Error("Data tidak ditemukan");
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
        // Invalidasi cache agar data baru langsung disajikan
        revalidateTag("donation_goal");
      }
    }

    // Hitung progress (%)
    const progress = Math.min(
      Math.round((goal.current_amount / goal.target_amount) * 100),
      100
    );

    return {
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      progress,
      currency: goal.base_currency,
      last_reset_month: goal.last_reset_month,
    };
  },
  ["donation_goal"], // key unik untuk cache
  {
    revalidate: false, // cache 10 menit
    tags: ["donation_goal"], // bisa di-refresh manual dari webhook
  }
);

export async function GET() {
  try {
    const data = await getDonationGoal();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Terjadi kesalahan di server:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
