import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import DramaTable from "@/components/admin/DramaTable";
import { getAllDramas } from "@/app/actions/drama";

export const dynamic = "force-dynamic";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Kelola Drama | Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DramasPage() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  // Fetch dramas
  const result = await getAllDramas();
  const dramas = result.success ? result.dramas : [];

  return (
    <div className="min-h-screen bg-black">
      <AdminHeader user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Kelola Drama</h1>
          <p className="text-gray-400">
            Manage semua drama yang ada di website
          </p>
        </div>

        {/* Drama Table */}
        <DramaTable dramas={dramas} />
      </main>
    </div>
  );
}
