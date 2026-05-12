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

    console.log("verify-callback → hitting:", `${apiUrl}/auth/verify-callback`);

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

    // Safe JSON parse — backend might return HTML on 502/404
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