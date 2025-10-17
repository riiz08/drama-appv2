import { Metadata } from "next";
import { getDramasWithFilters } from "@/app/actions/drama";
import { generateBrowseTitle } from "@/lib/utils";
import BrowseHeader from "@/components/browse/BrowseHeader";
import BrowseFilters from "@/components/browse/BrowseFilters";
import BrowseGrid from "@/components/browse/BrowseGrid";
import BrowsePagination from "@/components/browse/BrowsePagination";
import { BreadcrumbSchema } from "@/components/schema/BreadcrumbSchema";

// Type for search params
type SearchParams = Promise<{
  page?: string;
  status?: string;
  sort?: string;
  q?: string;
}>;

// Generate metadata for SEO
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const status = params?.status as "ONGOING" | "TAMAT" | undefined;
  const query = params?.q;

  let title = generateBrowseTitle(status);
  let description =
    "Jelajahi koleksi drama Malaysia lengkap dengan subtitle Indonesia.";

  if (query) {
    title = `Hasil Pencarian: ${query} Mangeakkk Drama`;
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
      canonical: "https://mangeakkk.my.id/drama",
    },
  };
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = parseInt(params?.page || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  // Determine sort parameters
  let sortBy: "title" | "releaseDate" | "popular" = "releaseDate";
  let order: "asc" | "desc" = "desc";

  if (params?.sort === "title") {
    sortBy = "title";
    order = "asc";
  } else if (params?.sort === "popular") {
    sortBy = "popular";
    order = "desc";
  } else if (params?.sort === "latest") {
    sortBy = "releaseDate";
    order = "desc";
  }

  // Get dramas with filters - PERBAIKAN: pastikan status masuk ke parameter
  const result = await getDramasWithFilters({
    search: params?.q,
    status: params?.status, // Ini yang tadinya tidak masuk!
    sortBy,
    order,
    limit,
    offset,
  });

  const dramas = result.success ? result.dramas : [];
  const total = result.success ? result.total : 0;
  const hasMore = result.success ? result.hasMore : false;

  return (
    <main className="min-h-screen bg-black">
      <BreadcrumbSchema
        items={[{ name: "Drama", url: "https://mangeakkk.my.id/drama" }]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <BrowseHeader query={params?.q} status={params?.status} total={total} />

        {/* Filters */}
        <BrowseFilters
          currentStatus={params?.status}
          currentSort={params?.sort}
        />

        {/* Results Grid */}
        <BrowseGrid dramas={dramas} query={params?.q} />

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
