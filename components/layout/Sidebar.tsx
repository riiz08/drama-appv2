import { getHomepageData } from "@/app/actions";
import OngoingSection from "@/components/home/OnGoingSection";
import CompletedSection from "@/components/home/CompletedSection";
import SEOContentSection from "@/components/home/SeoContentSections";
import LatestEpisodesListSidebar from "@/components/home/LatestEpisodesListSidebar";
import { unstable_cache } from "next/cache";

interface SidebarProps {
  // Conditional rendering based on page
  showFAQ?: boolean; // true = show FAQ, false = show Latest Episodes
  // Optional: hide specific sections
  hideOngoing?: boolean;
  hideCompleted?: boolean;
}

// Cache sidebar data untuk 1 jam
const getCachedSidebarData = unstable_cache(
  async () => {
    try {
      const homepageData = await getHomepageData();
      return {
        ongoing: homepageData.data?.ongoing || [],
        completed: homepageData.data?.completed || [],
        latestEpisodes: homepageData.data?.latestEpisodes || [],
      };
    } catch (error) {
      console.error("Failed to fetch sidebar data:", error);
      return { ongoing: [], completed: [], latestEpisodes: [] };
    }
  },
  ["sidebar-data"],
  {
    revalidate: 3600, // 1 hour cache
    tags: ["sidebar"],
  }
);

export default async function Sidebar({
  showFAQ = false,
  hideOngoing = false,
  hideCompleted = false,
}: SidebarProps) {
  const { ongoing, completed, latestEpisodes } = await getCachedSidebarData();

  return (
    <div className="space-y-6">
      {/* Ongoing Dramas */}
      {!hideOngoing && ongoing.length > 0 && (
        <OngoingSection dramas={ongoing} />
      )}

      {/* Completed Dramas */}
      {!hideCompleted && completed.length > 0 && (
        <CompletedSection dramas={completed} />
      )}

      {/* Conditional: FAQ atau Latest Episodes */}
      {latestEpisodes.length > 0 && (
        <div className="hidden lg:block">
          <LatestEpisodesListSidebar episodes={latestEpisodes} />
        </div>
      )}
    </div>
  );
}
