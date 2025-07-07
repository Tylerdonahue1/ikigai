import { type NextRequest, NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

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

    console.log("Getting survey progress for call:", callId)

    const vapi = new VAPIServer()
    const progress = await vapi.getSurveyProgress(callId)

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    console.error("Error getting survey progress:", error)

    const isAuthError = error instanceof Error && error.message.includes("Authentication Error")

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        isAuthError,
      },
      { status: isAuthError ? 401 : 500 },
    )
  }
}
