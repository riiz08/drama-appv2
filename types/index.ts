import { SVGProps } from "react";
import { Drama, Episode, Status } from "@/app/generated/prisma";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// ============================================
// Relation Types (NEW)
// ============================================

export interface CastInput {
  name: string;
  character?: string;
}

export interface DirectorInput {
  name: string;
}

export interface WriterInput {
  name: string;
}

export interface NovelAuthorInput {
  name: string;
  novelTitle?: string;
}

export interface NetworkInput {
  name: string;
}

export interface ProductionInput {
  name: string;
}

// Types for returned data from queries
export interface CastWithCharacter {
  id: string;
  character: string | null;
  cast: {
    id: string;
    name: string;
  };
}

export interface DirectorData {
  id: string;
  director: {
    id: string;
    name: string;
  };
}

export interface WriterData {
  id: string;
  writer: {
    id: string;
    name: string;
  };
}

export interface NovelAuthorData {
  id: string;
  novelTitle: string | null;
  novelAuthor: {
    id: string;
    name: string;
  };
}

export interface NetworkData {
  id: string;
  network: {
    id: string;
    name: string;
  };
}

export interface ProductionData {
  id: string;
  name: string;
}

// ============================================
// Drama Types
// ============================================

export interface CreateDramaInput {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  status: Status | "ONGOING" | "TAMAT";
  releaseDate: string | Date;
  totalEpisode?: number;
  airTime?: string;
  isPopular?: boolean;

  // Relations (NEW)
  casts?: CastInput[];
  directors?: DirectorInput[];
  writers?: WriterInput[];
  novelAuthors?: NovelAuthorInput[];
  networks?: NetworkInput[];
  production?: ProductionInput;
}

export interface UpdateDramaInput extends Partial<CreateDramaInput> {
  id: string;
}

export interface DramaWithEpisodes extends Drama {
  episodes: Episode[];
  _count?: {
    episodes: number;
  };
}

// Drama with full relations (for detail page)
export interface DramaWithFullRelations extends Drama {
  episodes: {
    id: string;
    episodeNum: number;
    slug: string;
    releaseDate: Date;
    videoUrl: string;
  }[];
  casts: CastWithCharacter[];
  directors: DirectorData[];
  writers: WriterData[];
  novelAuthors: NovelAuthorData[];
  networks: NetworkData[];
  production: ProductionData | null;
  _count: {
    episodes: number;
  };
}

export interface DramaCard {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  releaseDate: Date;
  status: Status;
  totalEpisode: number | null;
  description?: string;
  isPopular?: boolean;
  production?: {
    id: string;
    name: string;
  };
  networks?: NetworkData[];
}

export interface DramaFilters {
  status?: Status;
  search?: string;
  sortBy?: "title" | "releaseDate" | "popular";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// ============================================
// Episode Types
// ============================================

export interface CreateEpisodeInput {
  videoUrl: string;
  dramaId: string;
  episodeNum: number;
  releaseDate: string | Date;
  slug: string;
}

export interface UpdateEpisodeInput extends Partial<CreateEpisodeInput> {
  id: string;
}

export interface EpisodeWithDrama extends Episode {
  drama: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    description: string;
    status: Status;
    totalEpisode: number | null;
    airTime: string | null;
    production: ProductionData | null;
  };
}

export interface EpisodeCard extends Episode {
  drama: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    status: Status;
  };
}

export interface AdjacentEpisodes {
  prev: {
    id: string;
    slug: string;
    episodeNum: number;
  } | null;
  next: {
    id: string;
    slug: string;
    episodeNum: number;
  } | null;
}

// ============================================
// Homepage Types
// ============================================

export interface HomepageData {
  featured: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    description: string;
    releaseDate: Date;
    status: Status;
    totalEpisode: number | null;
    airTime: string | null;
  } | null;
  popular: DramaCard[];
  ongoing: DramaCard[];
  completed: DramaCard[];
  latestEpisodes: EpisodeCard[];
}

export interface SiteStats {
  totalDramas: number;
  totalEpisodes: number;
  ongoingCount: number;
  completedCount: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  hasMore: boolean;
  error?: string;
}

// ============================================
// SEO & Metadata Types
// ============================================

export interface DramaMetadata {
  title: string;
  description: string;
  image: string;
  releaseDate: Date;
  status: Status;
  totalEpisodes: number;
  lastUpdated: Date;
}

export interface EpisodeMetadata {
  title: string;
  description: string;
  image: string;
  releaseDate: Date;
  lastUpdated: Date;
}

export interface SitemapItem {
  slug: string;
  lastModified: Date;
}

// ============================================
// Search & Filter Types
// ============================================

export interface SearchOptions {
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

// ============================================
// Utility Types
// ============================================

export type StatusType = "ONGOING" | "TAMAT";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  orderBy?: string;
  order?: "asc" | "desc";
}

// ============================================
// Form Types (NEW - for UI components)
// ============================================

export interface DramaFormData {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  status: StatusType;
  releaseDate: Date;
  totalEpisode?: number;
  airTime?: string;
  isPopular: boolean;

  // Relations
  casts: CastInput[];
  directors: DirectorInput[];
  writers: WriterInput[];
  novelAuthors: NovelAuthorInput[];
  networks: NetworkInput[];
  production?: ProductionInput;
}

export interface EpisodeFormData {
  videoUrl: string;
  dramaId: string;
  episodeNum: number;
  releaseDate: Date;
  slug: string;
}
