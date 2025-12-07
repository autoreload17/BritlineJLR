import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // В production используйте .env

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    if (password === ADMIN_PASSWORD) {
      // В production используйте JWT или session
      return NextResponse.json({ success: true }, {
        headers: {
          "Set-Cookie": "admin-auth=true; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400",
        },
      });
    }
    
    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}












