// components/schema/website-schema.tsx
import { WebSite, WithContext } from "schema-dts";

interface WebsiteSchemaProps {
  name?: string;
  url?: string;
  description?: string;
}

export function WebsiteSchema({
  name = "Mangeakkk Drama",
  url = "https://mangeakkk.my.id",
  description = "Tonton drama Melayu terkini dan terlengkap episod penuh. Streaming drama Malaysia percuma dengan kualiti HD. Kemaskini episod terkini setiap hari!",
}: WebsiteSchemaProps = {}) {
  const schema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    inLanguage: "ms-MY",
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
