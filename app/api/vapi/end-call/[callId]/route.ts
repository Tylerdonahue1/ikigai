import { type NextRequest, NextResponse } from "next/server"
import { getVAPIServerClient } from "@/lib/vapi-server"

export async function POST(request: NextRequest, { params }: { params: { callId: string } }) {
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

    console.log("Ending VAPI call:", callId)

    const vapiClient = getVAPIServerClient()
    const call = await vapiClient.endCall(callId)

    console.log("✅ Call ended successfully")

    return NextResponse.json({
      success: true,
      call: {
        id: call.id,
        status: call.status,
        endedAt: call.endedAt,
        duration: call.duration,
      },
      message: "Call ended successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Failed to end call:", error)

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
