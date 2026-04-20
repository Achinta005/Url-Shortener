import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });

    let cookies = [];
    if (typeof backendRes.headers.getSetCookie === "function") {
      cookies = backendRes.headers.getSetCookie();
    } else {
      const raw = backendRes.headers.get("set-cookie");
      if (raw) cookies = raw.split(/,(?=[^ ])/);
    }

    cookies.forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });

    return response;

  } catch (err) {
    console.error("[/api/auth/login] Error:", err);
    return NextResponse.json(
      { message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}