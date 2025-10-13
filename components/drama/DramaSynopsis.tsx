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
    <section className="space-y-4">
      {/* Section Title */}
      <h2 className="text-2xl font-bold text-white">Sinopsis</h2>

      {/* Description */}
      <div className="bg-zinc-900 rounded-lg p-6">
        <p
          className={`text-gray-300 leading-relaxed ${
            !isExpanded && shouldShowToggle ? "line-clamp-4" : ""
          }`}
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
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )
            }
            className="text-red-500 hover:text-red-400 mt-3"
          >
            {isExpanded ? "Tampilkan Lebih Sedikit" : "Selengkapnya"}
          </Button>
        )}
      </div>
    </section>
  );
}
