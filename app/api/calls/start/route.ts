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

    // Attempt to contact call-server
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${callServerUrl}/calls/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, force: force ?? true }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, data });
      } else {
        const errData = await res.json().catch(() => null);
        console.warn("[/api/calls/start] Call server returned non-200:", errData);
      }
    } catch (fetchErr: unknown) {
      console.warn("[/api/calls/start] Could not reach call server:", fetchErr);
      // Fallback to browser simulation
    }

    return NextResponse.json({
      success: true,
      message: "Call initialized in demo/browser mode",
      simulated: true,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start call" },
      { status: 500 }
    );
  }
}
