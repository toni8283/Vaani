import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { callId, force } = await req.json();

    if (!callId) {
      return NextResponse.json({ error: "callId is required" }, { status: 400 });
    }

    const callServerUrl =
      process.env.CALL_SERVER_URL ||
      process.env.NEXT_PUBLIC_CALL_SERVER_URL ||
      "http://localhost:8080";

    const apiSecret = process.env.CALL_SERVER_SECRET || "";

    // Attempt to contact call-server
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${callServerUrl}/calls/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": apiSecret,
        },
        body: JSON.stringify({ callId, force: force ?? true }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, data });
      } else {
        const errData = await res.json().catch(() => null);
        console.warn("[/api/calls/start] Call server returned error:", errData);
        return NextResponse.json(
          {
            error:
              errData?.error ||
              "That call didn't go through. Nothing was said, and nobody was bothered. Want to try again?",
          },
          { status: res.status || 500 }
        );
      }
    } catch (fetchErr: unknown) {
      console.warn("[/api/calls/start] Could not reach call server:", fetchErr);
      return NextResponse.json(
        {
          error:
            "Something went wrong on our side. Your notes are safe. Please try again.",
        },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          "Something went wrong on our side. Your notes are safe. Please try again.",
      },
      { status: 500 }
    );
  }
}

