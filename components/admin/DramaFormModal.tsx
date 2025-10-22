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
import { addToast } from "@heroui/toast";
import { createDrama, updateDrama } from "@/app/actions/drama/mutations";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Plus, X } from "lucide-react";
import type { CreateDramaWithRelationsInput } from "@/app/actions/drama/mutations";

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

type CastItem = { name: string; character: string };
type CrewItem = { name: string };
type NovelAuthorItem = { name: string; novelTitle: string };
type NetworkItem = { name: string };

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

  // Relations state
  const [casts, setCasts] = useState<CastItem[]>([]);
  const [directors, setDirectors] = useState<CrewItem[]>([]);
  const [writers, setWriters] = useState<CrewItem[]>([]);
  const [novelAuthors, setNovelAuthors] = useState<NovelAuthorItem[]>([]);
  const [networks, setNetworks] = useState<NetworkItem[]>([]);
  const [production, setProduction] = useState("");

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
        // Reset relations
        setCasts([]);
        setDirectors([]);
        setWriters([]);
        setNovelAuthors([]);
        setNetworks([]);
        setProduction("");
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

  // Cast handlers
  const addCast = () => setCasts([...casts, { name: "", character: "" }]);
  const removeCast = (index: number) =>
    setCasts(casts.filter((_, i) => i !== index));
  const updateCast = (index: number, field: keyof CastItem, value: string) => {
    const updated = [...casts];
    updated[index][field] = value;
    setCasts(updated);
  };

  // Director handlers
  const addDirector = () => setDirectors([...directors, { name: "" }]);
  const removeDirector = (index: number) =>
    setDirectors(directors.filter((_, i) => i !== index));
  const updateDirector = (index: number, value: string) => {
    const updated = [...directors];
    updated[index].name = value;
    setDirectors(updated);
  };

  // Writer handlers
  const addWriter = () => setWriters([...writers, { name: "" }]);
  const removeWriter = (index: number) =>
    setWriters(writers.filter((_, i) => i !== index));
  const updateWriter = (index: number, value: string) => {
    const updated = [...writers];
    updated[index].name = value;
    setWriters(updated);
  };

  // Novel Author handlers
  const addNovelAuthor = () =>
    setNovelAuthors([...novelAuthors, { name: "", novelTitle: "" }]);
  const removeNovelAuthor = (index: number) =>
    setNovelAuthors(novelAuthors.filter((_, i) => i !== index));
  const updateNovelAuthor = (
    index: number,
    field: keyof NovelAuthorItem,
    value: string
  ) => {
    const updated = [...novelAuthors];
    updated[index][field] = value;
    setNovelAuthors(updated);
  };

  // Network handlers
  const addNetwork = () => setNetworks([...networks, { name: "" }]);
  const removeNetwork = (index: number) =>
    setNetworks(networks.filter((_, i) => i !== index));
  const updateNetwork = (index: number, value: string) => {
    const updated = [...networks];
    updated[index].name = value;
    setNetworks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData: CreateDramaWithRelationsInput = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        thumbnail: formData.thumbnail,
        status: formData.status as "ONGOING" | "TAMAT",
        releaseDate: formData.releaseDate,
        isPopular: formData.isPopular,
        totalEpisode: formData.totalEpisode
          ? parseInt(formData.totalEpisode)
          : undefined,
        airTime: formData.airTime || undefined,
        // Relations - filter empty values
        casts: casts.filter((c) => c.name.trim()),
        directors: directors.filter((d) => d.name.trim()),
        writers: writers.filter((w) => w.name.trim()),
        novelAuthors: novelAuthors.filter((n) => n.name.trim()),
        networks: networks.filter((n) => n.name.trim()),
        production: production.trim() ? { name: production.trim() } : undefined,
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
      size="3xl"
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

          <ModalBody className="gap-6">
            {/* Basic Info Section */}
            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardBody className="gap-4">
                <h3 className="text-lg font-semibold text-white">
                  Maklumat Asas
                </h3>

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

                <Input
                  label="Slug (URL)"
                  placeholder="judul-drama"
                  value={formData.slug}
                  isDisabled
                  description="Auto-generated dari judul"
                  isRequired
                  classNames={{
                    label: "text-white",
                    input: "text-white",
                    inputWrapper: "bg-zinc-800 border-zinc-700",
                    description: "text-gray-400",
                  }}
                />

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

                <Input
                  label="Thumbnail URL"
                  placeholder="https://cdn.mangeakkk.my.id/slug/slug.webp"
                  value={formData.thumbnail}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, thumbnail: value }))
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

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Total Episode"
                    placeholder="16"
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

                  <Input
                    label="Jadwal Tayang"
                    placeholder="Setiap Sabtu & Minggu"
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
                </div>

                <Switch
                  isSelected={formData.isPopular}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, isPopular: value }))
                  }
                  classNames={{ wrapper: "bg-zinc-700" }}
                >
                  <span className="text-white">
                    Tandai sebagai Drama Popular
                  </span>
                </Switch>
              </CardBody>
            </Card>

            {/* Cast Section */}
            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardBody className="gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Pelakon</h3>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={addCast}
                    startContent={<Plus className="w-4 h-4" />}
                  >
                    Tambah
                  </Button>
                </div>
                {casts.map((cast, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Nama pelakon"
                      value={cast.name}
                      onValueChange={(value) =>
                        updateCast(index, "name", value)
                      }
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-zinc-800 border-zinc-700",
                      }}
                    />
                    <Input
                      placeholder="Watak"
                      value={cast.character}
                      onValueChange={(value) =>
                        updateCast(index, "character", value)
                      }
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-zinc-800 border-zinc-700",
                      }}
                    />
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onPress={() => removeCast(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {casts.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Tiada pelakon ditambah
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Production & Network */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-zinc-900/50 border border-zinc-800">
                <CardBody className="gap-4">
                  <h3 className="text-lg font-semibold text-white">Produksi</h3>
                  <Input
                    placeholder="Nama syarikat produksi"
                    value={production}
                    onValueChange={setProduction}
                    classNames={{
                      input: "text-white",
                      inputWrapper: "bg-zinc-800 border-zinc-700",
                    }}
                  />
                </CardBody>
              </Card>

              <Card className="bg-zinc-900/50 border border-zinc-800">
                <CardBody className="gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                      Rangkaian
                    </h3>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={addNetwork}
                      startContent={<Plus className="w-4 h-4" />}
                    >
                      Tambah
                    </Button>
                  </div>
                  {networks.map((network, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Nama rangkaian"
                        value={network.name}
                        onValueChange={(value) => updateNetwork(index, value)}
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-zinc-800 border-zinc-700",
                        }}
                      />
                      <Button
                        isIconOnly
                        color="danger"
                        variant="flat"
                        onPress={() => removeNetwork(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {networks.length === 0 && (
                    <p className="text-sm text-gray-500">Tiada rangkaian</p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Directors & Writers */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-zinc-900/50 border border-zinc-800">
                <CardBody className="gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                      Pengarah
                    </h3>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={addDirector}
                      startContent={<Plus className="w-4 h-4" />}
                    >
                      Tambah
                    </Button>
                  </div>
                  {directors.map((director, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Nama pengarah"
                        value={director.name}
                        onValueChange={(value) => updateDirector(index, value)}
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-zinc-800 border-zinc-700",
                        }}
                      />
                      <Button
                        isIconOnly
                        color="danger"
                        variant="flat"
                        onPress={() => removeDirector(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {directors.length === 0 && (
                    <p className="text-sm text-gray-500">Tiada pengarah</p>
                  )}
                </CardBody>
              </Card>

              <Card className="bg-zinc-900/50 border border-zinc-800">
                <CardBody className="gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                      Penulis
                    </h3>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={addWriter}
                      startContent={<Plus className="w-4 h-4" />}
                    >
                      Tambah
                    </Button>
                  </div>
                  {writers.map((writer, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Nama penulis"
                        value={writer.name}
                        onValueChange={(value) => updateWriter(index, value)}
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-zinc-800 border-zinc-700",
                        }}
                      />
                      <Button
                        isIconOnly
                        color="danger"
                        variant="flat"
                        onPress={() => removeWriter(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {writers.length === 0 && (
                    <p className="text-sm text-gray-500">Tiada penulis</p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Novel Authors */}
            <Card className="bg-zinc-900/50 border border-zinc-800">
              <CardBody className="gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">
                    Novel Asal
                  </h3>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={addNovelAuthor}
                    startContent={<Plus className="w-4 h-4" />}
                  >
                    Tambah
                  </Button>
                </div>
                {novelAuthors.map((author, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Nama pengarang"
                      value={author.name}
                      onValueChange={(value) =>
                        updateNovelAuthor(index, "name", value)
                      }
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-zinc-800 border-zinc-700",
                      }}
                    />
                    <Input
                      placeholder="Judul novel"
                      value={author.novelTitle}
                      onValueChange={(value) =>
                        updateNovelAuthor(index, "novelTitle", value)
                      }
                      classNames={{
                        input: "text-white",
                        inputWrapper: "bg-zinc-800 border-zinc-700",
                      }}
                    />
                    <Button
                      isIconOnly
                      color="danger"
                      variant="flat"
                      onPress={() => removeNovelAuthor(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {novelAuthors.length === 0 && (
                  <p className="text-sm text-gray-500">Tiada novel asal</p>
                )}
              </CardBody>
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
