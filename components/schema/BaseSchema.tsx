// components/schema/base-schema.tsx

import { OrganizationSchema } from "./OrganizationSchema";
import { WebsiteSchema } from "./WebsiteSchema";

// Wrapper component untuk digunakan di layout
export function BaseSchema() {
  return (
    <>
      <OrganizationSchema />
      <WebsiteSchema />
    </>
  );
}
