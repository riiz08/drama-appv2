"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@heroui/button";

interface BrowseFiltersProps {
  currentStatus?: string;
  currentSort?: string;
}

export default function BrowseFilters({
  currentStatus,
  currentSort,
}: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filter changes
    params.delete("page");

    router.push(`/browse?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("sort");
    params.delete("page");

    const query = params.get("q");
    if (query) {
      router.push(`/browse?q=${query}`);
    } else {
      router.push("/browse");
    }
  };

  const hasFilters = currentStatus || currentSort;

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Icon & Label */}
        <div className="flex items-center gap-2 text-white">
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-semibold">Filter:</span>
        </div>

        {/* Status Filter */}
        <Select
          label="Status"
          placeholder="Semua Status"
          selectedKeys={currentStatus ? [currentStatus] : ["all"]}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="max-w-xs"
          classNames={{
            trigger: "bg-zinc-800 border-zinc-700",
          }}
        >
          <SelectItem key="all">Semua Status</SelectItem>
          <SelectItem key="ONGOING">Sedang Tayang</SelectItem>
          <SelectItem key="TAMAT">Selesai</SelectItem>
        </Select>

        {/* Sort Filter */}
        <Select
          label="Urutkan"
          placeholder="Terbaru"
          selectedKeys={currentSort ? [currentSort] : ["latest"]}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="max-w-xs"
          classNames={{
            trigger: "bg-zinc-800 border-zinc-700",
          }}
        >
          <SelectItem key="latest">Terbaru</SelectItem>
          <SelectItem key="popular">Populer</SelectItem>
          <SelectItem key="title">Judul A-Z</SelectItem>
        </Select>

        {/* Clear Filters Button */}
        {hasFilters && (
          <Button
            variant="flat"
            color="danger"
            onPress={handleClearFilters}
            startContent={<X className="w-4 h-4" />}
            className="sm:ml-auto"
          >
            Reset Filter
          </Button>
        )}
      </div>
    </div>
  );
}
