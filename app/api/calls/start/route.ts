import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { callId } = await req.json();

    if (!callId) {
      return NextResponse.json({ error: "callId is required" }, { status: 400 });
    }

    const callServerUrl =
      process.env.CALL_SERVER_URL ||
      process.env.NEXT_PUBLIC_CALL_SERVER_URL ||
      "http://localhost:3001";

    // Attempt to contact call-server
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${callServerUrl}/calls/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, data });
      }
    } catch {
      // Call server not running or unreachable, fallback to browser simulation
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
