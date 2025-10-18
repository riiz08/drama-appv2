import { Metadata } from "next";
import { getDramasWithFilters } from "@/app/actions/drama";
import BrowseHeader from "@/components/browse/BrowseHeader";
import BrowseFilters from "@/components/browse/BrowseFilters";
import BrowseGrid from "@/components/browse/BrowseGrid";
import BrowsePagination from "@/components/browse/BrowsePagination";
import { BreadcrumbSchema } from "@/components/schema/BreadcrumbSchema";

// Generate static params for all episodes
export async function generateStaticParams() {
  return [];
}

export const revalidate = 259200;

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
  const status = params?.status;
  const query = params?.q;

  let title = "Senarai Drama Melayu Terkini - Episod Penuh HD";
  let description =
    "Terokai koleksi drama Melayu lengkap dengan kualiti HD. Tonton episod penuh percuma tanpa iklan.";
  let canonical = "https://mangeakkk.my.id/drama";

  // Search results page
  if (query) {
    title = `Carian: ${query} | Mangeakkk Drama`;
    description = `Hasil carian untuk "${query}". Tonton drama Melayu terlengkap secara percuma dengan kualiti HD.`;
    canonical = `https://mangeakkk.my.id/drama?q=${encodeURIComponent(query)}`;
  }
  // Ongoing dramas
  else if (status === "ONGOING") {
    title = "Drama Melayu Sedang Tayangan - Kemaskini Setiap Hari";
    description =
      "Senarai drama Melayu yang sedang ditayangkan. Kemaskini episod terkini setiap hari. Tonton sekarang secara percuma!";
    canonical = "https://mangeakkk.my.id/drama?status=ONGOING";
  }
  // Completed dramas
  else if (status === "TAMAT") {
    title = "Drama Melayu Sudah Tamat - Episod Lengkap";
    description =
      "Senarai drama Melayu yang sudah tamat. Tonton semua episod lengkap dari mula hingga akhir secara percuma.";
    canonical = "https://mangeakkk.my.id/drama?status=TAMAT";
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Helper function untuk generate title (optional)
function generateBrowseTitle(status?: "ONGOING" | "TAMAT"): string {
  if (status === "ONGOING") {
    return "Drama Melayu Sedang Tayangan";
  }
  if (status === "TAMAT") {
    return "Drama Melayu Sudah Tamat";
  }
  return "Senarai Drama Melayu Terkini";
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
