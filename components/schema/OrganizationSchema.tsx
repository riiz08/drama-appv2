// components/schema/OrganizationSchema.tsx
import { Organization, WithContext } from "schema-dts";

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

export function OrganizationSchema({
  name = "Mangeakkk Drama",
  url = "https://mangeakkk.my.id",
  logo = "https://mangeakkk.my.id/logo/logo.png",
  description = "Nonton drama Malaysia terbaru dan terlengkap full episod. Streaming drama Malaysia gratis dengan kualitas HD.",
  sameAs = [],
}: OrganizationSchemaProps = {}) {
  const schema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: "600",
      height: "60",
    },
    description,
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
