import { type NextRequest, NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

export async function DELETE(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const vapi = new VAPIServer()
    await vapi.endCall(params.callId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error ending VAPI call:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
