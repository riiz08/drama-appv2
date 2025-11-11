"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Search, X } from "lucide-react";
import { searchDramas } from "@/app/actions/drama";
import { getDramaUrl } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const result = await searchDramas(query, { limit: 6 });
        if (result.success) {
          setResults(result.dramas);
        }
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const handleViewAll = () => {
    router.push(`/browse?q=${encodeURIComponent(query)}`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="top"
      backdrop="blur"
      classNames={{
        base: "bg-zinc-900 border border-zinc-800",
        header: "border-b border-zinc-800",
        body: "py-4",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <Input
                isRequired
                isClearable={false}
                ref={inputRef}
                type="text"
                placeholder="Cari drama Malaysia..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                startContent={<Search className="w-5 h-5 text-gray-400" />}
                endContent={
                  isLoading ? <Spinner size="sm" color="default" /> : null
                }
                classNames={{
                  input: "text-white",
                  inputWrapper:
                    "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 mt-6",
                }}
              />
            </ModalHeader>

            <ModalBody>
              {/* Search Results */}
              {results.length > 0 && (
                <div className="space-y-2 flex flex-col gap-2">
                  {results.map((drama) => (
                    <Link
                      key={drama.id}
                      prefetch={false}
                      href={getDramaUrl(drama.slug)}
                      onClick={onClose}
                    >
                      <Card
                        isPressable
                        className="bg-zinc-800 hover:bg-zinc-700 transition-colors border-none"
                        fullWidth
                      >
                        <CardBody className="flex flex-row gap-3 p-3">
                          <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                            <Image
                              src={drama.thumbnail}
                              alt={drama.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-sm line-clamp-1">
                              {drama.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Chip
                                size="sm"
                                color={
                                  drama.status === "ONGOING"
                                    ? "success"
                                    : "primary"
                                }
                                variant="flat"
                                className="text-xs"
                              >
                                {drama.status === "ONGOING"
                                  ? "Sedang Tayang"
                                  : "Selesai"}
                              </Chip>
                              {drama.totalEpisode && (
                                <span className="text-xs text-gray-400">
                                  {drama.totalEpisode} EP
                                </span>
                              )}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Link>
                  ))}

                  {/* View All Button */}
                  <button
                    onClick={handleViewAll}
                    className="w-full py-3 text-center text-sm text-red-500 hover:text-red-400 font-medium bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    Lihat Semua Hasil
                  </button>
                </div>
              )}

              {/* No Results */}
              {query.trim().length >= 2 &&
                !isLoading &&
                results.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-gray-400">
                      Tidak ada hasil untuk "{query}"
                    </p>
                  </div>
                )}

              {/* Search Tips */}
              {query.trim().length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-gray-400 text-sm">
                    Ketik minimal 2 karakter untuk mencari drama
                  </p>
                </div>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
