"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@heroui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateTotalPages } from "@/lib/utils";

interface BrowsePaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  hasMore: boolean;
}

export default function BrowsePagination({
  currentPage,
  totalItems,
  itemsPerPage,
  hasMore,
}: BrowsePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    router.push(`/browse?${params.toString()}`);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasPrev = currentPage > 1;
  const hasNext = hasMore || currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-4 py-8">
      {/* Previous Button */}
      <Button
        isDisabled={!hasPrev}
        onPress={() => handlePageChange(currentPage - 1)}
        variant="bordered"
        size="lg"
        startContent={<ChevronLeft className="w-5 h-5" />}
        className="border-zinc-700 text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        Sebelumnya
      </Button>

      {/* Page Info */}
      <div className="px-4 py-2 bg-zinc-900 rounded-lg">
        <p className="text-white font-medium">
          Halaman <span className="text-red-500">{currentPage}</span> dari{" "}
          {totalPages}
        </p>
      </div>

      {/* Next Button */}
      <Button
        isDisabled={!hasNext}
        onPress={() => handlePageChange(currentPage + 1)}
        color="danger"
        size="lg"
        endContent={<ChevronRight className="w-5 h-5" />}
        className="disabled:opacity-50"
      >
        Selanjutnya
      </Button>
    </div>
  );
}
