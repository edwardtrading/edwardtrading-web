import { NextResponse } from "next/server";

const adminCookieName = "edward_trading_admin";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(adminCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/admin"
  });

  return response;
}
