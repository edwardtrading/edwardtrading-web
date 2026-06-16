"use client";

import { useEffect } from "react";

const adminSessionKey = "edward_trading_admin_session_active";

export function AdminSessionGuard({
  loginSessionStarted
}: {
  loginSessionStarted: boolean;
}) {
  useEffect(() => {
    if (loginSessionStarted) {
      sessionStorage.setItem(adminSessionKey, "1");
      const url = new URL(window.location.href);
      url.searchParams.delete("admin_login");
      window.history.replaceState(null, "", url.toString());
      return;
    }

    if (sessionStorage.getItem(adminSessionKey) === "1") {
      return;
    }

    fetch("/admin/session/end", {
      method: "POST",
      keepalive: true
    }).finally(() => {
      window.location.reload();
    });
  }, [loginSessionStarted]);

  return null;
}
