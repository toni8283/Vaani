import { NextResponse } from "next/server";
import { VOICES } from "@/lib/voices";

export async function GET() {
  const callServerUrl =
    process.env.CALL_SERVER_URL ||
    (process.env.NEXT_PUBLIC_CALL_SERVER_WS_URL
      ? process.env.NEXT_PUBLIC_CALL_SERVER_WS_URL.replace(/^ws/, "http")
      : "http://localhost:8080");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${callServerUrl}/voices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CALL_SERVER_SECRET
          ? { "x-api-secret": process.env.CALL_SERVER_SECRET }
          : {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
      if (Array.isArray(data?.voices) && data.voices.length > 0) {
        return NextResponse.json(data.voices);
      }
    }
  } catch (err) {
    // If call server fails, fall back to static list
  }

  return NextResponse.json(VOICES);
}
