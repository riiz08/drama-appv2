"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import { createEpisode, updateEpisode } from "@/app/actions/episode/mutations";
import { getAllDramas } from "@/app/actions/drama";
import { checkEpisodeExists } from "@/app/actions/episode"; // Add this action
import { useRouter } from "next/navigation";

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
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  episode?: Episode | null;
};

export default function EpisodeFormModal({
  isOpen,
  onClose,
  mode,
  episode,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dramas, setDramas] = useState<any[]>([]);
  const [loadingDramas, setLoadingDramas] = useState(false);
  const [episodeError, setEpisodeError] = useState<string>("");

  const [formData, setFormData] = useState({
    videoUrl: "",
    dramaId: "",
    episodeNum: "",
    releaseDate: "",
    slug: "",
  });

  // Fetch dramas for select dropdown
  useEffect(() => {
    if (isOpen && mode === "create") {
      fetchDramas();
    }
  }, [isOpen, mode]);

  const fetchDramas = async () => {
    setLoadingDramas(true);
    try {
      const result = await getAllDramas({ status: "ONGOING" });
      if (result.success) {
        setDramas(result.dramas || []);
      }
    } catch (error) {
      console.error("Failed to fetch dramas:", error);
    } finally {
      setLoadingDramas(false);
    }
  };

  // Reset form when modal opens/closes or episode changes
  useEffect(() => {
    if (isOpen) {
      setEpisodeError(""); // Reset error
      if (mode === "edit" && episode) {
        setFormData({
          videoUrl: episode.videoUrl,
          dramaId: episode.dramaId,
          episodeNum: episode.episodeNum.toString(),
          releaseDate: new Date(episode.releaseDate)
            .toISOString()
            .split("T")[0],
          slug: episode.slug,
        });
      } else {
        // Reset for create mode
        setFormData({
          videoUrl: "",
          dramaId: "",
          episodeNum: "",
          releaseDate: "",
          slug: "",
        });
      }
    }
  }, [isOpen, mode, episode]);

  // Auto generate slug and video URL from drama and episode number
  const generateUrls = (dramaId: string, episodeNum: string) => {
    const drama = dramas.find((d) => d.id === dramaId);
    if (drama && episodeNum) {
      const slug = `${drama.slug}-episode-${episodeNum}`;
      const videoUrl = `https://cdn.mangeakkk.my.id/${drama.slug}/${episodeNum}/index.m3u8`;
      setFormData((prev) => ({
        ...prev,
        slug,
        videoUrl,
      }));
    }
  };

  const handleDramaChange = (value: string) => {
    setFormData((prev) => ({ ...prev, dramaId: value }));
    setEpisodeError(""); // Clear error when drama changes
    if (formData.episodeNum) {
      generateUrls(value, formData.episodeNum);
      checkDuplicateEpisode(value, formData.episodeNum);
    }
  };

  const handleEpisodeNumChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, episodeNum: value }));
    setEpisodeError(""); // Clear error

    if (formData.dramaId && value) {
      generateUrls(formData.dramaId, value);
      await checkDuplicateEpisode(formData.dramaId, value);
    }
  };

  // Check if episode already exists
  const checkDuplicateEpisode = async (dramaId: string, episodeNum: string) => {
    if (!dramaId || !episodeNum) return;

    try {
      const result = await checkEpisodeExists(dramaId, parseInt(episodeNum));

      // If in edit mode, ignore if it's the same episode being edited
      if (
        mode === "edit" &&
        episode &&
        result.exists &&
        result.episodeId === episode.id
      ) {
        setEpisodeError("");
        return;
      }

      if (result.exists) {
        const drama = dramas.find((d) => d.id === dramaId);
        setEpisodeError(
          `Episod ${episodeNum} untuk ${drama?.title || "drama ini"} sudah ada!`
        );
      } else {
        setEpisodeError("");
      }
    } catch (error) {
      console.error("Failed to check episode:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate if episode already exists
    if (episodeError) {
      addToast({
        title: "Gagal!",
        description: episodeError,
      });
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        videoUrl: formData.videoUrl,
        dramaId: formData.dramaId,
        episodeNum: parseInt(formData.episodeNum),
        releaseDate: formData.releaseDate,
        slug: formData.slug,
      };

      let result;
      if (mode === "edit" && episode) {
        result = await updateEpisode(episode.id, submitData);
      } else {
        result = await createEpisode(submitData);
      }

      if (result.success) {
        addToast({
          title: "Berjaya!",
          description:
            mode === "edit"
              ? "Episod berjaya dikemaskini!"
              : "Episod berjaya ditambah!",
        });
        onClose();
        router.refresh();
      } else {
        addToast({
          title: "Gagal!",
          description: result.error || "Terjadi kesalahan",
        });
      }
    } catch (error) {
      addToast({
        title: "Error!",
        description: "Terjadi kesalahan tidak dijangka",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent className="overflow-y-scroll">
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">
              {mode === "edit" ? "Edit Episod" : "Tambah Episod Baru"}
            </h2>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-4">
              {/* Drama Select - Only for create mode */}
              {mode === "create" && (
                <Select
                  label="Pilih Drama"
                  placeholder="Pilih drama"
                  selectedKeys={formData.dramaId ? [formData.dramaId] : []}
                  onChange={(e) => handleDramaChange(e.target.value)}
                  isRequired
                  isLoading={loadingDramas}
                  classNames={{
                    label: "text-white",
                    trigger: "bg-zinc-800 border-zinc-700",
                    value: "text-white",
                  }}
                >
                  {dramas.map((drama) => (
                    <SelectItem key={drama.id}>{drama.title}</SelectItem>
                  ))}
                </Select>
              )}

              {/* Show drama name in edit mode */}
              {mode === "edit" && episode && (
                <Input
                  label="Drama"
                  value={episode.drama.title}
                  isReadOnly
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                    inputWrapper: "bg-zinc-800 border-zinc-700",
                  }}
                />
              )}

              {/* Episode Number */}
              <Input
                type="number"
                label="Nombor Episod"
                placeholder="Contoh: 1"
                value={formData.episodeNum}
                onValueChange={handleEpisodeNumChange}
                isRequired
                min={1}
                isInvalid={!!episodeError}
                errorMessage={episodeError}
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: episodeError
                    ? "bg-zinc-800 border-red-500"
                    : "bg-zinc-800 border-zinc-700",
                }}
              />

              {/* Video URL */}
              <Input
                label="Video URL"
                placeholder="https://cdn.mangeakkk.my.id/slug/episode/index.m3u8"
                value={formData.videoUrl}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, videoUrl: value }))
                }
                isDisabled
                description="Auto-generated, boleh edit manual"
                isRequired
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                  description: "text-gray-400",
                }}
              />

              {/* Slug */}
              <Input
                label="Slug (URL)"
                placeholder="drama-title-episode-1"
                value={formData.slug}
                isDisabled
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, slug: value }))
                }
                description="Auto-generated, boleh edit manual"
                isRequired
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                  description: "text-gray-400",
                }}
              />

              {/* Release Date */}
              <Input
                type="date"
                label="Tarikh Tayangan"
                value={formData.releaseDate}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, releaseDate: value }))
                }
                isRequired
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                }}
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              color="danger"
              variant="flat"
              onPress={onClose}
              isDisabled={isLoading}
            >
              Batal
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
              isDisabled={!!episodeError}
            >
              {mode === "edit" ? "Kemaskini" : "Tambah"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
