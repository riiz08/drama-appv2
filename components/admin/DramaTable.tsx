"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import DramaFormModal from "@/components/admin/DramaFormModal";
import DeleteDramaModal from "@/components/admin/DeleteDramaModal";
import { getDramaById } from "@/app/actions/drama/queries";
import { addToast } from "@heroui/toast";

type Drama = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  status: "ONGOING" | "TAMAT";
  releaseDate: Date;
  isPopular: boolean;
  totalEpisode: number | null;
  airTime: string | null;
  episodes: any[];
};

type Props = {
  dramas: Drama[];
};

export default function DramaTable({ dramas }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState<Drama | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  // FIXED: Fetch drama with full relations before opening edit modal
  const handleEdit = async (drama: Drama) => {
    setIsLoadingEdit(true);
    try {
      // Fetch drama with all relations
      const { success, drama: fullDrama } = await getDramaById(drama.id);

      if (success && fullDrama) {
        console.log("Fetched drama with relations:", fullDrama);
        setSelectedDrama(fullDrama as any);
        setIsEditModalOpen(true);
      } else {
        addToast({
          title: "Gagal!",
          description: "Tidak dapat memuat data drama",
        });
      }
    } catch (error) {
      console.error("Error fetching drama:", error);
      addToast({
        title: "Error!",
        description: "Terjadi kesalahan saat memuat data",
      });
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleDelete = (drama: Drama) => {
    setSelectedDrama(drama);
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <Card className="bg-zinc-900 border-none">
        <CardBody className="p-6">
          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              Semua Drama ({dramas.length})
            </h2>
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setIsCreateModalOpen(true)}
            >
              Tambah Drama
            </Button>
          </div>

          {/* Table */}
          {dramas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">Belum ada drama</p>
              <Button
                color="primary"
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => setIsCreateModalOpen(true)}
              >
                Tambah Drama Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Thumbnail
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Judul
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Episode
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">
                      Popular
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dramas.map((drama) => (
                    <tr
                      key={drama.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="relative w-16 h-24 rounded overflow-hidden">
                          <Image
                            src={drama.thumbnail}
                            alt={drama.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">
                            {drama.title}
                          </p>
                          <p className="text-sm text-gray-400 line-clamp-1">
                            {drama.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Chip
                          size="sm"
                          color={
                            drama.status === "ONGOING" ? "success" : "default"
                          }
                          variant="flat"
                        >
                          {drama.status}
                        </Chip>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white">
                          {drama.episodes.length}
                          {drama.totalEpisode && `/${drama.totalEpisode}`}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <Chip
                          size="sm"
                          color={drama.isPopular ? "warning" : "default"}
                          variant="flat"
                        >
                          {drama.isPopular ? "Ya" : "Tidak"}
                        </Chip>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => handleEdit(drama)}
                            isLoading={isLoadingEdit}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="danger"
                            onPress={() => handleDelete(drama)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modals */}
      <DramaFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <DramaFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDrama(null);
        }}
        mode="edit"
        drama={selectedDrama}
      />

      <DeleteDramaModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDrama(null);
        }}
        drama={selectedDrama}
      />
    </>
  );
}
