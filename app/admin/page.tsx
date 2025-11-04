//file app/admin/page.tsx

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSiteStats } from "@/app/actions/homepage";
import { Card, CardBody } from "@heroui/card";
import {
  Tv,
  PlayCircle,
  TrendingUp,
  CheckCircle,
  Plus,
  ExternalLink,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import TrafficChart from "@/components/admin/TrafficChart";
import TopDramasList from "@/components/admin/TopDramaList";

export const dynamic = "force-dynamic";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Dashboard Admin | Mangeakkk Drama",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboard() {
  const session = await auth();

  if (!session) {
    redirect("/admin/login");
  }

  // Get statistics
  const statsResult = await getSiteStats();
  const stats = statsResult.success ? statsResult.stats : null;

  const statCards = [
    {
      title: "Total Drama",
      value: stats?.totalDramas || 0,
      icon: Tv,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Episode",
      value: stats?.totalEpisodes || 0,
      icon: PlayCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Sedang Tayang",
      value: stats?.ongoingCount || 0,
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Selesai",
      value: stats?.completedCount || 0,
      icon: CheckCircle,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <AdminHeader user={session.user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Selamat datang, {session.user?.name || "Admin"}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-zinc-900 border-none">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column - Analytics (70%) */}
          <div className="xl:col-span-8 space-y-6">
            {/* Traffic Chart */}
            <Card className="bg-zinc-900 border-none">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Traffic Overview
                </h2>
                <TrafficChart />
              </CardBody>
            </Card>

            {/* Top Dramas */}
            <Card className="bg-zinc-900 border-none">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Drama Terpopuler
                </h2>
                <TopDramasList />
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Quick Actions (30%) */}
          <div className="xl:col-span-4 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-zinc-900 border-none">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <a
                    href="/admin/dramas/create"
                    className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors group"
                  >
                    <Plus className="w-5 h-5 text-white" />
                    <span className="text-white font-medium flex-1">
                      Tambah Drama
                    </span>
                  </a>

                  <a
                    href="/admin/episodes/create"
                    className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors group"
                  >
                    <Plus className="w-5 h-5 text-white" />
                    <span className="text-white font-medium flex-1">
                      Tambah Episode
                    </span>
                  </a>

                  <div className="pt-3 border-t border-zinc-800 space-y-2">
                    <a
                      href="/admin/dramas"
                      className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-gray-300 hover:text-white group"
                    >
                      <span className="flex-1 text-sm">Kelola Semua Drama</span>
                      <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </a>

                    <a
                      href="/admin/episodes"
                      className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-gray-300 hover:text-white group"
                    >
                      <span className="flex-1 text-sm">
                        Kelola Semua Episode
                      </span>
                      <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </a>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity (Optional) */}
            <Card className="bg-zinc-900 border-none">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Aktivitas Terbaru
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">Drama baru ditambahkan</p>
                      <p className="text-xs text-gray-500">2 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">Episode baru di-upload</p>
                      <p className="text-xs text-gray-500">5 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300">Drama selesai tayang</p>
                      <p className="text-xs text-gray-500">1 hari yang lalu</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
