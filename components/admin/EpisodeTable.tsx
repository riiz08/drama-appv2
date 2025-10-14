"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Pagination } from "@heroui/pagination";
import { Plus, Pencil, Trash2, PlayCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import EpisodeFormModal from "./EpisodeFormModal";
import DeleteEpisodeModal from "@/components/admin/EpisodeDeleteModal";

type Episode = {
  id: string;
  videoUrl: string;
  dramaId: string;
  episodeNum: number;
  releaseDate: Date;
  slug: string;
  drama: {
    id: string;
    title: string;
    thumbnail: string;
  };
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type Props = {
  episodes: Episode[];
  pagination: PaginationInfo;
};

export default function EpisodeTable({ episodes, pagination }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const handleEdit = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsEditModalOpen(true);
  };

  const handleDelete = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsDeleteModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const columns = [
    { key: "episodeNum", label: "Episode" },
    { key: "drama", label: "Drama" },
    { key: "slug", label: "Slug" },
    { key: "releaseDate", label: "Tanggal Rilis" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <>
      <Card className="bg-zinc-900 border-none">
        <CardBody className="p-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                Semua Episode ({pagination.total})
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Halaman {pagination.page} dari {pagination.totalPages}
              </p>
            </div>
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setIsCreateModalOpen(true)}
            >
              Tambah Episode
            </Button>
          </div>

          {/* Table */}
          {episodes.length === 0 ? (
            <div className="text-center py-12">
              <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Belum ada episode</p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => setIsCreateModalOpen(true)}
              >
                Tambah Episode Pertama
              </Button>
            </div>
          ) : (
            <>
              <Table
                aria-label="Episodes table"
                classNames={{
                  base: "bg-transparent",
                  wrapper: "bg-transparent shadow-none p-0",
                  th: "bg-zinc-800 text-gray-400 font-medium",
                  td: "text-white",
                }}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn
                      key={column.key}
                      className={column.key === "actions" ? "text-right" : ""}
                    >
                      {column.label}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody items={episodes}>
                  {(episode) => (
                    <TableRow
                      key={episode.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50"
                    >
                      <TableCell>
                        <Chip color="primary" variant="flat" size="sm">
                          Episode {episode.episodeNum}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={episode.drama.thumbnail}
                              alt={episode.drama.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium">
                            {episode.drama.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-400">
                          {episode.slug}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(episode.releaseDate).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => handleEdit(episode)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => handleDelete(episode)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    total={pagination.totalPages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    showControls
                    classNames={{
                      wrapper: "gap-2",
                      item: "bg-zinc-800 text-white",
                      cursor: "bg-primary text-white",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <EpisodeFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <EpisodeFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEpisode(null);
        }}
        mode="edit"
        episode={selectedEpisode}
      />

      <DeleteEpisodeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEpisode(null);
        }}
        episode={selectedEpisode}
      />
    </>
  );
}
