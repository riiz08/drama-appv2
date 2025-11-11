"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import DramaFormModal from "./DramaFormModal";
import EpisodeFormModal from "./EpisodeFormModal";

export default function QuickActions() {
  const [isCreateDramaOpen, setIsCreateDramaOpen] = useState(false);
  const [isCreateEpisodeOpen, setIsCreateEpisodeOpen] = useState(false);

  return (
    <>
      {/* Quick Actions */}
      <Card className="bg-zinc-900 border-none">
        <CardBody className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>

          <div className="space-y-3">
            {/* Tambah Drama */}
            <Button
              color="primary"
              fullWidth
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setIsCreateDramaOpen(true)}
            >
              Tambah Drama
            </Button>

            {/* Tambah Episode */}
            <Button
              color="success"
              fullWidth
              startContent={<Plus className="w-4 h-4" />}
              onPress={() => setIsCreateEpisodeOpen(true)}
            >
              Tambah Episode
            </Button>

            {/* Kelola Links */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <Link
                href="/admin/dramas"
                className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-gray-300 hover:text-white group"
              >
                <span className="flex-1 text-sm">Kelola Semua Drama</span>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </Link>

              <Link
                href="/admin/episodes"
                className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-gray-300 hover:text-white group"
              >
                <span className="flex-1 text-sm">Kelola Semua Episode</span>
                <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <DramaFormModal
        isOpen={isCreateDramaOpen}
        onClose={() => setIsCreateDramaOpen(false)}
        mode="create"
      />
      <EpisodeFormModal
        isOpen={isCreateEpisodeOpen}
        onClose={() => setIsCreateEpisodeOpen(false)}
        mode="create"
      />
    </>
  );
}
