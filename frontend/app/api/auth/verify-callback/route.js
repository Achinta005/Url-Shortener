import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const apiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL;
    if (!apiUrl) {
      console.error("Missing NEXT_PUBLIC_SERVER_API_URL");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const backendRes = await fetch(`${apiUrl}/auth/verify-callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    const response = NextResponse.json(data, { status: backendRes.status });

    let cookieStrings = [];
    try {
      if (typeof backendRes.headers.getSetCookie === "function") {
        cookieStrings = backendRes.headers.getSetCookie();
      } else {
        const raw = backendRes.headers.get("set-cookie");
        if (raw) cookieStrings = raw.split(/,(?=[^ ])/);  // fixed: was missing closing )
      }
    } catch (cookieErr) {
      console.warn("Could not forward cookies:", cookieErr?.message);
    }

    cookieStrings.filter(Boolean).forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });

    return response;
  } catch (err) {
    console.error("verify-callback proxy error:", err?.message, err?.stack);
    return NextResponse.json(
      { message: "Internal server error", detail: err?.message },
      { status: 500 }
    );
  }
}