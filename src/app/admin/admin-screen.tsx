import { Database, LogOut } from "lucide-react";
import {
  AdminWorkspace,
  type AdminSection
} from "@/components/admin/admin-form";
import { loginAdmin, logoutAdmin, isAdminLoggedIn } from "@/app/admin/actions";
import { getAdminDashboardData } from "@/lib/cms-data";
import { hasDatabaseConfig } from "@/lib/database";

const loginInputClass =
  "min-h-10 w-full border border-gray-400 bg-white px-2 text-sm outline-none focus:border-black";

export async function AdminScreen({
  section,
  savedMessage
}: {
  section: AdminSection;
  savedMessage?: string;
}) {
  const configured = hasDatabaseConfig();
  const hasPassword = Boolean(process.env.ADMIN_PASSWORD);
  const loggedIn = await isAdminLoggedIn();
  const dashboard = loggedIn ? await getAdminDashboardData() : null;

  if (!loggedIn) {
    return (
      <section className="min-h-[calc(100svh-80px)] bg-white py-12">
        <div className="mx-auto w-full max-w-sm px-4">
          <form action={loginAdmin} className="border border-gray-400 p-5">
            <h1 className="mb-5 text-xl font-bold text-black">Admin Login</h1>
            {!configured || !hasPassword ? (
              <div className="mb-4 border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
                Admin access is not configured yet.
              </div>
            ) : null}
            <label className="mb-4 block text-sm font-semibold text-black">
              Email
              <input
                name="email"
                type="email"
                required
                className={`${loginInputClass} mt-1`}
              />
            </label>
            <label className="mb-5 block text-sm font-semibold text-black">
              Password
              <input
                name="password"
                type="password"
                required
                disabled={!hasPassword}
                className={`${loginInputClass} mt-1 disabled:bg-gray-100`}
              />
            </label>
            <button
              type="submit"
              disabled={!hasPassword}
              className="min-h-10 border border-black bg-gray-200 px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Login
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100svh-80px)] bg-light-gray py-8 md:py-12">
      <div className="container-page">
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-charcoal/10 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              <Database aria-hidden className="h-4 w-4" />
              Content Management
            </p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold text-charcoal md:text-4xl">
              Edward Trading Admin
            </h1>
          </div>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-charcoal/10 bg-white px-4 text-sm font-semibold text-charcoal transition hover:border-primary hover:text-primary"
            >
              <LogOut aria-hidden className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>

        {!configured ? (
          <div className="mb-6 rounded-lg border border-primary/20 bg-white p-5 text-sm leading-7 text-slate shadow-sm">
            Add database credentials to enable editing and inquiry storage.
          </div>
        ) : null}

        <AdminWorkspace
          data={dashboard!}
          disabled={!configured}
          section={section}
          savedMessage={savedMessage}
        />
      </div>
    </section>
  );
}
