import { type NextRequest, NextResponse } from "next/server"
import { getVAPIServerClient } from "@/lib/vapi-server"

export async function GET(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const { callId } = params

    if (!callId) {
      return NextResponse.json(
        {
          success: false,
          error: "Call ID is required",
        },
        { status: 400 },
      )
    }

    console.log("Getting VAPI call:", callId)

    const vapiClient = getVAPIServerClient()
    const call = await vapiClient.getCall(callId)

    console.log("✅ Call retrieved successfully")

    return NextResponse.json({
      success: true,
      call: {
        id: call.id,
        assistantId: call.assistantId,
        status: call.status,
        createdAt: call.createdAt,
        endedAt: call.endedAt,
        duration: call.duration,
        metadata: call.metadata,
        transcript: call.transcript,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Failed to get call:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
