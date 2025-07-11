import { type NextRequest, NextResponse } from "next/server"
import { getVAPIServerClient, IKIGAI_ASSISTANT_ID } from "@/lib/vapi-server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metadata = {} } = body

    console.log("Creating VAPI web call...")
    console.log("Assistant ID:", IKIGAI_ASSISTANT_ID)
    console.log("Metadata:", metadata)

    const vapiClient = getVAPIServerClient()

    // Create a web call using the pre-created assistant
    const call = await vapiClient.createWebCall(IKIGAI_ASSISTANT_ID, {
      ...metadata,
      type: "web",
      timestamp: new Date().toISOString(),
    })

    console.log("✅ Web call created successfully")
    console.log("Call ID:", call.id)

    return NextResponse.json({
      success: true,
      call: {
        id: call.id,
        assistantId: call.assistantId,
        status: call.status,
        createdAt: call.createdAt,
        metadata: call.metadata,
      },
      message: "Web call created successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Failed to create web call:", error)

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
