import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL;
    if (!apiUrl) {
      return NextResponse.json({ message: "Missing API URL" }, { status: 500 });
    }

    const body = await req.json();

    let backendRes;
    try {
      backendRes = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (fetchErr) {
      return NextResponse.json(
        { message: "Could not reach backend", detail: fetchErr?.message },
        { status: 502 }
      );
    }

    const rawText = await backendRes.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Backend returned non-JSON:", rawText.slice(0, 200));
      return NextResponse.json(
        { message: "Backend returned invalid response", detail: rawText.slice(0, 200) },
        { status: 502 }
      );
    }

    const response = NextResponse.json(data, { status: backendRes.status });

    let cookieStrings = [];
    try {
      if (typeof backendRes.headers.getSetCookie === "function") {
        cookieStrings = backendRes.headers.getSetCookie();
      } else {
        const raw = backendRes.headers.get("set-cookie");
        if (raw) cookieStrings = raw.split(/,(?=[^ ])/);
      }
    } catch {}

    cookieStrings.filter(Boolean).forEach((cookie) => {
      const rewritten = cookie.replace(/domain=[^;]+;?/gi, "").trim();
      response.headers.append("set-cookie", rewritten);
    });

    return response;
  } catch (err) {
    console.error("login proxy error:", err?.message);
    return NextResponse.json(
      { message: "Internal server error", detail: err?.message },
      { status: 500 }
    );
  }
}