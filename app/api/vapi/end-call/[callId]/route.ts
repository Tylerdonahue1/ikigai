import { type NextRequest, NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

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

    console.log("Ending call:", callId)

    const vapi = new VAPIServer()
    const result = await vapi.endCall(callId)

    console.log("Successfully ended call:", callId)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Error ending call:", error)

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

export async function DELETE(request: NextRequest, { params }: { params: { callId: string } }) {
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

    console.log("Ending call via DELETE:", callId)

    const vapi = new VAPIServer()
    const result = await vapi.endCall(callId)

    console.log("Successfully ended call:", callId)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("Error ending call:", error)

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
