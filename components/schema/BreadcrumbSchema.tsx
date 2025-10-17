// components/schema/breadcrumb-schema.tsx
import { BreadcrumbList, WithContext } from "schema-dts";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  // Selalu tambahkan Home sebagai item pertama jika belum ada
  const breadcrumbItems =
    items[0]?.url === "https://mangeakkk.my.id"
      ? items
      : [{ name: "Home", url: "https://mangeakkk.my.id" }, ...items];

  const schema: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
