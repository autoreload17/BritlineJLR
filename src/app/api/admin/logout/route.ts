import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ success: true }, {
    headers: {
      "Set-Cookie": "admin-auth=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
    },
  });
}












