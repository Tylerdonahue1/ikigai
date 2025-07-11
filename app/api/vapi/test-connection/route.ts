import { type NextRequest, NextResponse } from "next/server"
import { getVAPIServerClient, IKIGAI_ASSISTANT_ID } from "@/lib/vapi-server"

export async function GET(request: NextRequest) {
  try {
    console.log("Testing VAPI connection...")

    const vapiClient = getVAPIServerClient()

    // Test connection by fetching the specific assistant
    console.log("Fetching assistant:", IKIGAI_ASSISTANT_ID)
    const assistant = await vapiClient.getAssistant(IKIGAI_ASSISTANT_ID)

    console.log("✅ Successfully connected to VAPI")
    console.log("Assistant details:", {
      id: assistant.id,
      name: assistant.name,
      model: assistant.model?.provider,
      voice: assistant.voice?.provider,
    })

    return NextResponse.json({
      success: true,
      message: "VAPI connection successful",
      assistant: {
        id: assistant.id,
        name: assistant.name,
        model: assistant.model?.provider,
        voice: assistant.voice?.provider,
        createdAt: assistant.createdAt,
        updatedAt: assistant.updatedAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ VAPI connection failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
