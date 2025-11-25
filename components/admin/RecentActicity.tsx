// file: components/admin/RecentActivity.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Activity = {
  type: "drama" | "episode";
  title: string;
  time: Date;
};

type Props = {
  activities: Activity[];
};

export default function RecentActivity({ activities }: Props) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-400">Belum ada aktivitas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3 text-gray-400">
          <div
            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              activity.type === "drama"
                ? "bg-blue-500"
                : activity.type === "episode"
                  ? "bg-green-500"
                  : "bg-purple-500"
            }`}
          />
          <div>
            <p className="text-gray-300">{activity.title}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.time), {
                addSuffix: true,
                locale: idLocale,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
