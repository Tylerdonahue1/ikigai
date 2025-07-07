import { type NextRequest, NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

export async function POST(request: NextRequest) {
  try {
    const vapi = new VAPIServer()
    const config = await request.json()

    const assistant = await vapi.createAssistant(config)

    return NextResponse.json({ success: true, assistant })
  } catch (error) {
    console.error("Error creating VAPI assistant:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
