import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Date Formatters
// ============================================

export function formatDate(
  date: Date | string,
  locale: string = "id-ID"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatRelativeTime(
  date: Date | string,
  locale: string = "id-ID"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "baru saja";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;

  return formatDate(d, locale);
}

export function formatYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getFullYear().toString();
}

// ============================================
// String Formatters
// ============================================

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ============================================
// Status Formatters
// ============================================

export function getStatusLabel(status: "ONGOING" | "TAMAT"): string {
  const labels: Record<string, string> = {
    ONGOING: "Sedang Tayang",
    TAMAT: "Selesai",
  };
  return labels[status] || status;
}

export function getStatusColor(status: "ONGOING" | "TAMAT"): string {
  const colors: Record<string, string> = {
    ONGOING: "bg-green-500",
    TAMAT: "bg-blue-500",
  };
  return colors[status] || "bg-gray-500";
}

// ============================================
// SEO Helpers
// ============================================

export function generateMetaTitle(title: string, suffix?: string): string {
  const siteName = suffix || "Mangeakkk";
  return `${title} - ${siteName}`;
}

export function generateMetaDescription(
  description: string,
  maxLength: number = 155
): string {
  if (!description) return "";

  // Remove HTML tags
  const cleanDesc = description.replace(/<[^>]*>/g, "").trim();

  // Truncate if needed
  if (cleanDesc.length <= maxLength) {
    return cleanDesc;
  }

  return cleanDesc.substring(0, maxLength - 3) + "...";
}

export function generateDramaTitle(dramaTitle: string): string {
  return generateMetaTitle(`Tonton ${dramaTitle} Episod Penuh`);
}

export function generateEpisodeTitle(
  dramaTitle: string,
  episodeNum: number
): string {
  return generateMetaTitle(
    `${dramaTitle} Episod ${episodeNum} - Tonton Online`
  );
}

export function generateBrowseTitle(status?: "ONGOING" | "TAMAT"): string {
  if (status === "ONGOING") return generateMetaTitle("Drama Sedang Tayangan");
  if (status === "TAMAT") return generateMetaTitle("Drama Sudah Tamat");
  return generateMetaTitle("Senarai Drama Melayu Terkini");
}

// Generate keywords for drama page
export function generateDramaKeywords(
  dramaTitle: string,
  genre?: string[],
  year?: number
): string[] {
  const keywords = [
    `tonton ${dramaTitle}`,
    `${dramaTitle} episod penuh`,
    `streaming ${dramaTitle} HD`,
    `${dramaTitle} online percuma`,
    "drama melayu",
    "drama malaysia terkini",
  ];

  if (genre && genre.length > 0) {
    keywords.push(...genre.map((g) => `drama ${g.toLowerCase()}`));
  }

  if (year) {
    keywords.push(`drama ${year}`);
  }

  return keywords;
}

// Generate keywords for episode page
export function generateEpisodeKeywords(
  dramaTitle: string,
  episodeNum: number
): string[] {
  return [
    `tonton ${dramaTitle} episod ${episodeNum}`,
    `${dramaTitle} ep ${episodeNum}`,
    `${dramaTitle} episod ${episodeNum} HD`,
    `streaming ${dramaTitle} episod ${episodeNum}`,
    "drama melayu episod penuh",
  ];
}

// ============================================
// URL Helpers
// ============================================

export function getDramaUrl(slug: string): string {
  return `/drama/${slug}`;
}

export function getEpisodeUrl(slug: string): string {
  return `/${slug}`;
}

export function getBrowseUrl(params?: {
  status?: string;
  search?: string;
}): string {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("q", params.search);

  const query = searchParams.toString();
  return `/drama${query ? `?${query}` : ""}`;
}

// ============================================
// Image Helpers
// ============================================

export function getImageUrl(
  path: string,
  size?: "small" | "medium" | "large"
): string {
  // Placeholder implementation
  // You can integrate with image CDN or Next.js Image Optimization
  return path;
}

export function getPlaceholderImage(
  width: number = 300,
  height: number = 400
): string {
  return `https://placehold.co/${width}x${height}/1a1a1a/ffffff?text=No+Image`;
}

// ============================================
// Pagination Helpers
// ============================================

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  delta: number = 2
): number[] {
  const range: number[] = [];
  const rangeWithDots: number[] = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, -1); // -1 represents dots
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push(-1, totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
}

// ============================================
// Validation Helpers
// ============================================

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
