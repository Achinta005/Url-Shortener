import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API_URL}/auth/verify-callback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });

    // Forward cookies (access_token + refresh_token) set by NestJS
    const cookies =
      typeof backendRes.headers.getSetCookie === "function"
        ? backendRes.headers.getSetCookie()
        : (backendRes.headers.get("set-cookie") ?? "").split(/,(?=[^ ])/);

    cookies.filter(Boolean).forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });

    return response;
  } catch (err) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}