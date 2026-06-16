import type { Metadata } from "next";
import { AdminScreen } from "@/app/admin/admin-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin CMS",
  description: "Admin CMS for managing Edward Trading website content."
};

export default function AdminPage({
  searchParams
}: {
  searchParams?: { saved?: string; admin_login?: string };
}) {
  return (
    <AdminScreen
      section="overview"
      savedMessage={searchParams?.saved}
      loginSessionStarted={searchParams?.admin_login === "1"}
    />
  );
}
