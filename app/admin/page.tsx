//file app/admin/page.tsx

import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSiteStats } from "@/app/actions/homepage";
import { Card, CardBody } from "@heroui/card";
import { Tv, PlayCircle, TrendingUp, CheckCircle } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import TrafficChart from "@/components/admin/TrafficChart";
import { getTopDramas, getRecentActivities } from "@/app/actions/dashboard";
import TopDramasList from "@/components/admin/TopDramaList";
import RecentActivity from "@/components/admin/RecentActicity";
import QuickActions from "@/components/admin/QuickActions";

export const dynamic = "force-static";
export const revalidate = 86400;

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

  // Get dashboard data
  const [topDramasResult, recentActivitiesResult] = await Promise.all([
    getTopDramas(5),
    getRecentActivities(5),
  ]);

  const topDramas = topDramasResult.success ? topDramasResult.dramas : [];
  const recentActivities = recentActivitiesResult.success
    ? recentActivitiesResult.activities
    : [];

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
                <TopDramasList dramas={topDramas} />
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Quick Actions (30%) */}
          <div className="xl:col-span-4 space-y-6">
            <QuickActions />

            {/* Recent Activity */}
            <Card className="bg-zinc-900 border-none">
              <CardBody className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Aktivitas Terbaru
                </h2>
                <RecentActivity activities={recentActivities} />
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
