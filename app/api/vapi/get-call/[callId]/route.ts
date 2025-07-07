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

    console.log("Getting call details for:", callId)

    const vapi = new VAPIServer()
    const call = await vapi.getCall(callId)

    return NextResponse.json({
      success: true,
      call,
    })
  } catch (error) {
    console.error("Error getting call:", error)

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
