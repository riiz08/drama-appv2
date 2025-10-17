import { WebSite, WithContext } from "schema-dts";

// components/schema/website-schema.tsx
interface WebsiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export function WebsiteSchema({
  name = "Mangeakkk Drama",
  url = "https://mangeakkk.my.id",
  description = "Nonton drama Malaysia terbaru dan terlengkap full episod. Streaming drama Malaysia gratis dengan kualitas HD. Update episode terbaru setiap hari!",
}: WebsiteSchemaProps = {}) {
  const schema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    publisher: {
      "@type": "Organization",
      name,
      logo: {
        "@type": "ImageObject",
        url: "https://mangeakkk.my.id/logo/logo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
