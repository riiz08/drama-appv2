"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { deleteDrama } from "@/app/actions/drama/mutations";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

type Drama = {
  id: string;
  title: string;
  episodes?: any[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  drama: Drama | null;
};

export default function DeleteDramaModal({ isOpen, onClose, drama }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!drama) return;

    setIsLoading(true);

    try {
      const result = await deleteDrama(drama.id);

      if (result.success) {
        addToast({
          title: "Berhasil!",
          description: "Drama berhasil dihapus",
        });
        onClose();
        router.refresh();
      } else {
        addToast({
          title: "Gagal!",
          description: result.error || "Gagal menghapus drama",
        });
      }
    } catch (error) {
      addToast({
        title: "Error!",
        description: "Terjadi kesalahan tidak terduga",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!drama) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      classNames={{
        base: "bg-zinc-900",
        header: "border-b border-zinc-800",
        footer: "border-t border-zinc-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Hapus Drama</h2>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          <div className="space-y-4">
            <p className="text-gray-300">
              Apakah Anda yakin ingin menghapus drama{" "}
              <span className="font-semibold text-white">"{drama.title}"</span>?
            </p>

            {drama.episodes && drama.episodes.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">
                  ⚠️ Drama ini memiliki {drama.episodes.length} episode yang
                  akan ikut terhapus!
                </p>
              </div>
            )}

            <p className="text-sm text-gray-400">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="default"
            variant="flat"
            onPress={onClose}
            isDisabled={isLoading}
          >
            Batal
          </Button>
          <Button color="danger" onPress={handleDelete} isLoading={isLoading}>
            Ya, Hapus
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
