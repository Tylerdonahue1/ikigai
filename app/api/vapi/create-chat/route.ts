import { type NextRequest, NextResponse } from "next/server"
import { createVAPIService } from "@/lib/vapi-service"

// Your pre-created assistant ID
const IKIGAI_ASSISTANT_ID = "5542140a-b071-4455-8d43-6a0eb424dbc4"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Creating VAPI Chat ===")

    const body = await request.json()
    const { input, sessionId, previousChatId } = body

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          error: "Input message is required",
        },
        { status: 400 },
      )
    }

    console.log("💬 Creating chat with assistant:", IKIGAI_ASSISTANT_ID)
    console.log("📝 Input:", input.substring(0, 100) + "...")

    const vapi = createVAPIService()
    const result = await vapi.createChat(IKIGAI_ASSISTANT_ID, input, sessionId, previousChatId)

    console.log("✅ Chat created successfully:", result.id)

    return NextResponse.json({
      success: true,
      chatId: result.id,
      assistantId: IKIGAI_ASSISTANT_ID,
      chat: result,
    })
  } catch (error) {
    console.error("❌ Failed to create chat:", error)

    return NextResponse.json(
      {
        success: false,
        assistantId: IKIGAI_ASSISTANT_ID,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
