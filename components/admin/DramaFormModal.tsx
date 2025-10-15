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
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { addToast, Toast } from "@heroui/toast";
import { createDrama, updateDrama } from "@/app/actions/drama/mutations";
import { useRouter } from "next/navigation";
import { CreateDramaInput } from "@/types";
import { Card } from "@heroui/card";

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
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  drama?: Drama | null;
};

export default function DramaFormModal({
  isOpen,
  onClose,
  mode,
  drama,
}: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    status: "ONGOING" as "ONGOING" | "TAMAT",
    releaseDate: "",
    isPopular: false,
    totalEpisode: "",
    airTime: "",
  });

  // Reset form when modal opens/closes or drama changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && drama) {
        setFormData({
          title: drama.title,
          slug: drama.slug,
          description: drama.description,
          thumbnail: drama.thumbnail,
          status: drama.status,
          releaseDate: new Date(drama.releaseDate).toISOString().split("T")[0],
          isPopular: drama.isPopular,
          totalEpisode: drama.totalEpisode?.toString() || "",
          airTime: drama.airTime || "",
        });
      } else {
        // Reset for create mode
        setFormData({
          title: "",
          slug: "",
          description: "",
          thumbnail: "",
          status: "ONGOING",
          releaseDate: "",
          isPopular: false,
          totalEpisode: "",
          airTime: "",
        });
      }
    }
  }, [isOpen, mode, drama]);

  // Auto generate slug and thumbnail from title
  const handleTitleChange = (value: string) => {
    const newSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newThumbnail = newSlug
      ? `https://cdn.mangeakkk.my.id/${newSlug}/${newSlug}.webp`
      : "";

    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: newSlug,
      thumbnail: newThumbnail,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData: CreateDramaInput = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        thumbnail: formData.thumbnail,
        status: formData.status,
        releaseDate: formData.releaseDate,
        isPopular: formData.isPopular,
        totalEpisode: formData.totalEpisode
          ? parseInt(formData.totalEpisode)
          : undefined,
        airTime: formData.airTime || undefined,
      };

      let result;
      if (mode === "edit" && drama) {
        result = await updateDrama(drama.id, submitData);
      } else {
        result = await createDrama(submitData);
      }

      if (result.success) {
        addToast({
          title: "Berhasil!",
          description:
            mode === "edit"
              ? "Drama berhasil diupdate!"
              : "Drama berhasil ditambahkan!",
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
        description: "Terjadi kesalahan tidak terduga",
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
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="overflow-y-scroll">
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">
              {mode === "edit" ? "Edit Drama" : "Tambah Drama Baru"}
            </h2>
          </ModalHeader>

          <ModalBody>
            <Card className="space-y-4">
              {/* Title */}
              <Input
                label="Judul Drama"
                placeholder="Masukkan judul drama"
                value={formData.title}
                onValueChange={handleTitleChange}
                isRequired
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                }}
              />

              {/* Slug */}
              <Input
                label="Slug (URL)"
                placeholder="judul-drama"
                value={formData.slug}
                isDisabled
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, slug: value }))
                }
                description="Auto-generated dari judul"
                isRequired
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                  description: "text-gray-400",
                }}
              />

              {/* Description */}
              <Textarea
                label="Deskripsi"
                placeholder="Masukkan deskripsi drama"
                value={formData.description}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, description: value }))
                }
                minRows={3}
                isRequired
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                }}
              />

              {/* Thumbnail URL */}
              <Input
                label="Thumbnail URL"
                placeholder="https://cdn.mangeakkk.my.id/slug/slug.webp"
                value={formData.thumbnail}
                isDisabled
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, thumbnail: value }))
                }
                description="Auto-generated dari slug, bisa diedit manual"
                isRequired
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                  description: "text-gray-400",
                }}
              />

              {/* Status */}
              <Select
                label="Status"
                placeholder="Pilih status"
                selectedKeys={[formData.status]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "ONGOING" | "TAMAT",
                  }))
                }
                isRequired
                classNames={{
                  label: "text-white",
                  trigger: "bg-zinc-800 border-zinc-700",
                  value: "text-white",
                }}
              >
                <SelectItem key="ONGOING">ONGOING</SelectItem>
                <SelectItem key="TAMAT">TAMAT</SelectItem>
              </Select>

              {/* Release Date */}
              <Input
                type="date"
                label="Tanggal Rilis"
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

              {/* Total Episode */}
              <Input
                type="number"
                label="Total Episode (Opsional)"
                placeholder="Contoh: 16"
                value={formData.totalEpisode}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, totalEpisode: value }))
                }
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                }}
              />

              {/* Air Time */}
              <Input
                label="Jadwal Tayang (Opsional)"
                placeholder="Contoh: Setiap Sabtu & Minggu"
                value={formData.airTime}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, airTime: value }))
                }
                classNames={{
                  label: "text-white",
                  input: "text-white",
                  inputWrapper: "bg-zinc-800 border-zinc-700",
                }}
              />

              {/* Is Popular Switch */}
              <Switch
                isSelected={formData.isPopular}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, isPopular: value }))
                }
                classNames={{
                  wrapper: "bg-zinc-700",
                }}
              >
                <span className="text-white">Tandai sebagai Drama Popular</span>
              </Switch>
            </Card>
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
            <Button color="primary" type="submit" isLoading={isLoading}>
              {mode === "edit" ? "Update" : "Tambah"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
