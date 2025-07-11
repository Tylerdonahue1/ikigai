import { type NextRequest, NextResponse } from "next/server"
import { createVAPIService } from "@/lib/vapi-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    console.log("📋 Listing chats", sessionId ? `for session: ${sessionId}` : "")

    const vapi = createVAPIService()
    const result = await vapi.listChats(sessionId || undefined)

    console.log("✅ Chats retrieved successfully")

    return NextResponse.json({
      success: true,
      chats: result,
      sessionId,
    })
  } catch (error) {
    console.error("❌ Failed to list chats:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
