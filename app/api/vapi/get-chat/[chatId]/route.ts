import { type NextRequest, NextResponse } from "next/server"
import { createVAPIService } from "@/lib/vapi-service"

export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = params

    console.log("📖 Getting chat:", chatId)

    const vapi = createVAPIService()
    const result = await vapi.getChat(chatId)

    console.log("✅ Chat retrieved successfully")

    return NextResponse.json({
      success: true,
      chatId,
      chat: result,
    })
  } catch (error) {
    console.error("❌ Failed to get chat:", error)

    return NextResponse.json(
      {
        success: false,
        chatId: params.chatId,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
