import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const callId = params?.id;
    if (!callId) {
      return NextResponse.json({ error: "Missing call ID" }, { status: 400 });
    }

    // 1. Authenticate user session
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify call ownership
    const { data: call, error: callErr } = await supabase
      .from("calls")
      .select("id, user_id, status")
      .eq("id", callId)
      .single();

    if (callErr || !call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    if (call.user_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this call" },
        { status: 403 }
      );
    }

    // 3. Call call-server with secret (server-side only)
    const callServerUrl =
      process.env.CALL_SERVER_URL || "http://localhost:8080";
    const apiSecret = process.env.CALL_SERVER_SECRET || "";

    try {
      const res = await fetch(`${callServerUrl}/calls/${callId}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": apiSecret,
        },
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, ...data });
      } else {
        const errData = await res.json().catch(() => null);
        console.warn(
          "[/api/calls/[id]/summarize] Call server returned non-200:",
          errData
        );
      }
    } catch (fetchErr: unknown) {
      console.warn(
        "[/api/calls/[id]/summarize] Could not reach call server:",
        fetchErr
      );
    }

    // Fallback: reset needs_summary flag if server was unreachable so polling detects retry
    await supabase
      .from("calls")
      .update({
        needs_summary: false,
      })
      .eq("id", callId);

    return NextResponse.json({
      success: true,
      callId,
      message: "Summarization requested",
    });
  } catch (err: unknown) {
    console.error("[/api/calls/[id]/summarize] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to trigger summarization" },
      { status: 500 }
    );
  }
}
