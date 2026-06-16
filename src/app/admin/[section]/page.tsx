import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminScreen } from "@/app/admin/admin-screen";
import type { AdminSection } from "@/components/admin/admin-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin CMS",
  description: "Admin CMS for managing Edward Trading website content."
};

const sections = new Set<AdminSection>([
  "home",
  "about",
  "pages",
  "resources",
  "solutions",
  "industries",
  "partner-companies",
  "contact",
  "categories",
  "products",
  "companies",
  "team",
  "inquiries",
  "access"
]);

export default function AdminSectionPage({
  params,
  searchParams
}: {
  params: { section: string };
  searchParams?: { saved?: string; admin_login?: string };
}) {
  if (!sections.has(params.section as AdminSection)) {
    notFound();
  }

  return (
    <AdminScreen
      section={params.section as AdminSection}
      savedMessage={searchParams?.saved}
      loginSessionStarted={searchParams?.admin_login === "1"}
    />
  );
}
