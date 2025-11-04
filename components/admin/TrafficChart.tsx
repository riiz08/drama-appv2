// file: components/admin/TrafficChart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - nanti ganti dengan real data
const mockTrafficData = [
  { date: "Sen", views: 1240 },
  { date: "Sel", views: 1580 },
  { date: "Rab", views: 1890 },
  { date: "Kam", views: 2100 },
  { date: "Jum", views: 2450 },
  { date: "Sab", views: 2890 },
  { date: "Min", views: 3120 },
];

export default function TrafficChart() {
  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Total Views</p>
          <p className="text-2xl font-bold text-white">15.3K</p>
          <p className="text-xs text-green-500">+12.5% dari minggu lalu</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Avg. Daily</p>
          <p className="text-2xl font-bold text-white">2.2K</p>
          <p className="text-xs text-blue-500">+8.3% dari rata-rata</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Peak Day</p>
          <p className="text-2xl font-bold text-white">3.1K</p>
          <p className="text-xs text-gray-400">Minggu</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockTrafficData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              stroke="#71717a"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#71717a" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-500 mt-4">
        📊 Data mock - akan diganti dengan real analytics
      </p>
    </div>
  );
}
