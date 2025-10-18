"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@heroui/button";

interface DramaSynopsisProps {
  description: string;
}

export default function DramaSynopsis({ description }: DramaSynopsisProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowToggle = description.length > 300;

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 id="synopsis-heading" className="text-2xl font-bold text-white">
        Sinopsis
      </h2>

      {/* Description */}
      <article className="bg-zinc-900 rounded-lg p-6">
        <p
          className={`text-gray-300 leading-relaxed ${
            !isExpanded && shouldShowToggle ? "line-clamp-4" : ""
          }`}
          aria-label="Sinopsis drama"
        >
          {description}
        </p>

        {/* Toggle Button */}
        {shouldShowToggle && (
          <Button
            variant="light"
            size="sm"
            onPress={() => setIsExpanded(!isExpanded)}
            endContent={
              isExpanded ? (
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              )
            }
            className="text-red-500 hover:text-red-400 mt-3"
            aria-expanded={isExpanded}
            aria-controls="synopsis-content"
            aria-label={isExpanded ? "Tampilkan kurang" : "Baca selanjutnya"}
          >
            {isExpanded ? "Tampilkan Kurang" : "Baca Selanjutnya"}
          </Button>
        )}
      </article>
    </div>
  );
}
