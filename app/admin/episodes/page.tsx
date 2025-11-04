import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import EpisodeTable from "@/components/admin/EpisodeTable";
import { getAllEpisodes } from "@/app/actions/episode/queries";

export const dynamic = "force-dynamic";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Kelola Episode | Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EpisodesPage({
  params,
}: {
  params: Promise<{ searchParams: number }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  const { searchParams } = await params;

  const currentPage = Number(searchParams) || 1;

  // Fetch episodes with pagination
  const result = await getAllEpisodes(currentPage, 20);
  const episodes = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-black">
      <AdminHeader user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Kelola Episode</h1>
          <p className="text-gray-400">
            Manage semua episode drama yang ada di website
          </p>
        </div>

        {/* Episode Table */}
        <EpisodeTable episodes={episodes} pagination={result.pagination} />
      </main>
    </div>
  );
}
