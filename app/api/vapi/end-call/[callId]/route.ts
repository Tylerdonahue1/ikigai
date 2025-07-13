import { type NextRequest, NextResponse } from "next/server"
import { endVapiCall } from "@/lib/vapi-actions"

export async function DELETE(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const { callId } = params

    if (!callId) {
      return NextResponse.json(
        {
          success: false,
          message: "Call ID is required",
        },
        { status: 400 },
      )
    }

    console.log("Ending VAPI call:", callId)

    const result = await endVapiCall(callId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Failed to end call:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to end call",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
