import { type NextRequest, NextResponse } from "next/server"
import { getVapiCall } from "@/lib/vapi-actions"

export async function GET(request: NextRequest, { params }: { params: { callId: string } }) {
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

    console.log("Getting VAPI call:", callId)

    const result = await getVapiCall(callId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        call: result.call,
        message: "Call retrieved successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
        },
        { status: 404 },
      )
    }
  } catch (error: any) {
    console.error("Failed to get call:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get call",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
