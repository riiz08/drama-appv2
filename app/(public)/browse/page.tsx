import { Metadata } from "next";
import { getDramasWithFilters } from "@/app/actions/drama";
import { generateBrowseTitle } from "@/lib/utils";
import BrowseHeader from "@/components/browse/BrowseHeader";
import BrowseFilters from "@/components/browse/BrowseFilters";
import BrowseGrid from "@/components/browse/BrowseGrid";
import BrowsePagination from "@/components/browse/BrowsePagination";

// Generate metadata for SEO
export async function generateMetadata({
  searchParams,
}: any): Promise<Metadata> {
  const status = searchParams?.status as "ONGOING" | "TAMAT" | undefined;
  const query = searchParams?.q;

  let title = generateBrowseTitle(status);
  let description =
    "Jelajahi koleksi drama Malaysia lengkap dengan subtitle Indonesia.";

  if (query) {
    title = `Hasil Pencarian: ${query} | Mangeakkk Drama`;
    description = `Hasil pencarian untuk "${query}". Nonton drama Malaysia sub Indo terlengkap.`;
  } else if (status === "ONGOING") {
    description =
      "Daftar drama Malaysia yang sedang tayang. Update episode terbaru setiap hari.";
  } else if (status === "TAMAT") {
    description =
      "Daftar drama Malaysia yang sudah selesai tayang. Tonton semua episode lengkap.";
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    alternates: {
      canonical: "https://mangeakkk.my.id/browse",
    },
  };
}

export default async function BrowsePage({ searchParams }: any) {
  const page = parseInt(searchParams?.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get dramas with filters
  const result = await getDramasWithFilters({
    search: searchParams?.q,
    status: searchParams?.status,
    sortBy: searchParams?.sort === "title" ? "title" : "releaseDate",
    order:
      searchParams?.sort === "popular"
        ? "desc"
        : searchParams?.sort === "title"
          ? "asc"
          : "desc",
    limit,
    offset,
  });

  const dramas = result.success ? result.dramas : [];
  const total = result.success ? result.total : 0;
  const hasMore = result.success ? result.hasMore : false;

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <BrowseHeader
          query={searchParams?.q}
          status={searchParams?.status}
          total={total}
        />

        {/* Filters */}
        <BrowseFilters
          currentStatus={searchParams?.status}
          currentSort={searchParams?.sort}
        />

        {/* Results Grid */}
        <BrowseGrid dramas={dramas} query={searchParams?.q} />

        {/* Pagination */}
        {total > limit && (
          <BrowsePagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            hasMore={hasMore}
          />
        )}
      </div>
    </main>
  );
}
