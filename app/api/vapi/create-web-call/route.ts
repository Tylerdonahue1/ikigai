import { type NextRequest, NextResponse } from "next/server"
import { createVapiWebCall } from "@/lib/vapi-actions"
import { IKIGAI_ASSISTANT_ID } from "@/lib/vapi-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assistantId = IKIGAI_ASSISTANT_ID, metadata } = body

    console.log("Creating VAPI web call with assistant:", assistantId)

    const result = await createVapiWebCall(assistantId, metadata)

    if (result.success) {
      return NextResponse.json({
        success: true,
        callId: result.callId,
        call: result.call,
        message: "Web call created successfully",
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
    console.error("Failed to create web call:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create web call",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
