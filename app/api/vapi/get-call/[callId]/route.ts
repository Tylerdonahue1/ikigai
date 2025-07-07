import { type NextRequest, NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

export async function GET(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const vapi = new VAPIServer()
    const call = await vapi.getCall(params.callId)

    return NextResponse.json({ success: true, call })
  } catch (error) {
    console.error("Error getting VAPI call:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
