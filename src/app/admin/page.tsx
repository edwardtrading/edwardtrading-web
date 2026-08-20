import type { Metadata } from "next";
import { AdminScreen } from "@/app/admin/admin-screen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website Admin",
  description: "Manage Edward Trading website content.",
  robots: { index: false, follow: false }
};

export default function AdminPage({
  searchParams
}: {
  searchParams?: { saved?: string; problem?: string; admin_login?: string };
}) {
  return (
    <AdminScreen
      section="overview"
      savedMessage={searchParams?.saved}
      problemMessage={searchParams?.problem}
      loginSessionStarted={searchParams?.admin_login === "1"}
    />
  );
}
