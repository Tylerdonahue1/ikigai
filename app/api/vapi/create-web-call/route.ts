import { type NextRequest, NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assistantId, customer, metadata } = body

    if (!assistantId) {
      return NextResponse.json(
        {
          success: false,
          error: "Assistant ID is required",
        },
        { status: 400 },
      )
    }

    console.log("Creating web call for assistant:", assistantId)

    const vapi = new VAPIServer()

    const webCallConfig = {
      assistantId,
      customer: customer || {},
      metadata: metadata || {},
    }

    const webCall = await vapi.createWebCall(webCallConfig)

    console.log("Successfully created web call:", webCall.id)

    return NextResponse.json({
      success: true,
      callId: webCall.id,
      webCallUrl: webCall.webCallUrl,
      call: webCall,
    })
  } catch (error) {
    console.error("Error creating web call:", error)

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
