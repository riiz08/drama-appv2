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

    const newUrl = `/drama?${params.toString()}`;
    router.push(newUrl);
  };

  const handleStatusChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      handleFilterChange("status", selectedKey as string);
    }
  };

  const handleSortChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      handleFilterChange("sort", selectedKey as string);
    }
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("status");
    params.delete("sort");
    params.delete("page");

    const query = params.get("q");
    if (query) {
      router.push(`/drama?q=${query}`);
    } else {
      router.push("/drama");
    }
  };

  const hasFilters = currentStatus || currentSort;

  return (
    <div
      className="bg-zinc-900 rounded-lg p-4"
      role="search"
      aria-label="Penapis dan pengurutan drama"
    >
      <form className="flex flex-col sm:flex-row gap-4">
        {/* Filter Icon & Label */}
        <div className="flex items-center gap-2 text-white">
          <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
          <span className="font-semibold">Penapis:</span>
        </div>

        {/* Status Filter */}
        <Select
          label="Status"
          placeholder="Semua Status"
          selectedKeys={new Set([currentStatus || "all"])}
          onSelectionChange={handleStatusChange}
          className="max-w-xs"
          classNames={{
            trigger: "bg-zinc-800 border-zinc-700",
          }}
          disallowEmptySelection
          aria-label="Pilih status drama"
        >
          <SelectItem key="all">Semua Status</SelectItem>
          <SelectItem key="ONGOING">Sedang Tayangan</SelectItem>
          <SelectItem key="TAMAT">Sudah Tamat</SelectItem>
        </Select>

        {/* Sort Filter */}
        <Select
          label="Urutan"
          placeholder="Terkini"
          selectedKeys={new Set([currentSort || "latest"])}
          onSelectionChange={handleSortChange}
          className="max-w-xs"
          classNames={{
            trigger: "bg-zinc-800 border-zinc-700",
          }}
          disallowEmptySelection
          aria-label="Pilih urutan paparan"
        >
          <SelectItem key="latest">Terkini</SelectItem>
          <SelectItem key="popular">Popular</SelectItem>
          <SelectItem key="title">Tajuk A-Z</SelectItem>
        </Select>

        {/* Clear Filters Button */}
        {hasFilters && (
          <Button
            variant="shadow"
            color="danger"
            size="md"
            onPress={handleClearFilters}
            startContent={<X className="w-4 h-4" aria-hidden="true" />}
            className="sm:ml-auto"
            aria-label="Kosongkan semua penapis"
          >
            Kosongkan Penapis
          </Button>
        )}
      </form>
    </div>
  );
}
