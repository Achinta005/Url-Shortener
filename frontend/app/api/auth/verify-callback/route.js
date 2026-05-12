import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const apiUrl = process.env.NEXT_PUBLIC_SERVER_API_URL;
    if (!apiUrl) {
      console.error("Missing NEXT_PUBLIC_SERVER_API_URL");
      return NextResponse.json(
        { message: "Server configuration error: missing API URL" },
        { status: 500 }
      );
    }

    let backendRes;
    try {
      backendRes = await fetch(`${apiUrl}/auth/verify-callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (fetchErr) {
      console.error("Fetch to backend failed:", fetchErr?.message);
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

    // Forward + rewrite cookies from server.achinta.me → shortly.achinta.me
    let cookieStrings = [];
    try {
      if (typeof backendRes.headers.getSetCookie === "function") {
        cookieStrings = backendRes.headers.getSetCookie();
      } else {
        const raw = backendRes.headers.get("set-cookie");
        if (raw) cookieStrings = raw.split(/,(?=[^ ])/);
      }
    } catch (cookieErr) {
      console.warn("Could not read cookies:", cookieErr?.message);
    }

    cookieStrings.filter(Boolean).forEach((cookie) => {
      // Rewrite domain so cookie lands on the frontend's domain
      const rewritten = cookie
        .replace(/domain=[^;]+;?/gi, "")  // strip backend domain
        .trim();
      response.headers.append("set-cookie", rewritten);
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