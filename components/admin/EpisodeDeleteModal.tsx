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
import { deleteEpisode } from "@/app/actions/episode/mutations";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

type Episode = {
  id: string;
  episodeNum: number;
  drama: {
    title: string;
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode | null;
};

export default function DeleteEpisodeModal({
  isOpen,
  onClose,
  episode,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!episode) return;

    setIsLoading(true);

    try {
      const result = await deleteEpisode(episode.id);

      if (result.success) {
        addToast({
          title: "Berhasil!",
          description: "Episode berhasil dihapus",
        });
        onClose();
        router.refresh();
      } else {
        addToast({
          title: "Gagal!",
          description: result.error || "Gagal menghapus episode",
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

  if (!episode) return null;

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
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white">Hapus Episode</h2>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          <div className="space-y-4">
            <p className="text-gray-300">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-semibold text-white">
                Episode {episode.episodeNum}
              </span>{" "}
              dari drama{" "}
              <span className="font-semibold text-white">
                "{episode.drama.title}"
              </span>
              ?
            </p>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                ⚠️ Video dan data episode akan terhapus permanent
              </p>
            </div>

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
