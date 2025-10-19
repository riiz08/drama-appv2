// components/LazyLoader.tsx (NEW FILE)
"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingComponent?: ComponentType
) {
  return dynamic(importFn, {
    loading: LoadingComponent
      ? () => <LoadingComponent />
      : () => (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-96 bg-zinc-900 animate-pulse rounded-lg" />
          </div>
        ),
    ssr: false,
  });
}
