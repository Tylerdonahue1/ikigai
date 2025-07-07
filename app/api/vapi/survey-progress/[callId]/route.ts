import { type NextRequest, NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

export async function GET(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const { callId } = params

    if (!callId) {
      return NextResponse.json({ success: false, error: "Call ID is required" }, { status: 400 })
    }

    const vapiServer = new VAPIServer()
    const progress = await vapiServer.getSurveyProgress(callId)

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error("Error getting survey progress:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
