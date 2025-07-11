import { NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"
import { VAPIAssistantBuilder } from "@/lib/vapi-assistant-config"

export async function GET() {
  try {
    console.log("=== Testing VAPI Assistant Creation ===")

    const vapi = new VAPIServer()

    // First test connection
    const connectionTest = await vapi.testConnection()
    if (!connectionTest.connected) {
      return NextResponse.json(
        {
          success: false,
          error: "VAPI connection failed",
          details: connectionTest.error,
        },
        { status: 500 },
      )
    }

    console.log("✅ Connection test passed")

    // Try to list existing assistants first
    console.log("📋 Listing existing assistants...")
    const existingAssistants = await vapi.listAssistants()
    console.log(`Found ${existingAssistants.length} existing assistants`)

    return NextResponse.json({
      success: true,
      message: "VAPI test completed successfully",
      connectionStatus: "connected",
      existingAssistants: existingAssistants.length,
      assistants: existingAssistants.slice(0, 3), // Show first 3 for debugging
    })
  } catch (error) {
    console.error("❌ Test assistant error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Check VAPI API key and service status",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("=== Creating Test Assistant ===")

    const vapi = new VAPIServer()

    // Create minimal test assistant
    const testConfig = VAPIAssistantBuilder.createMinimalTestAssistant()
    console.log("🤖 Creating test assistant with config:", testConfig)

    const result = await vapi.createAssistant(testConfig)
    console.log("✅ Test assistant created:", result)

    return NextResponse.json({
      success: true,
      message: "Test assistant created successfully",
      assistantId: result.id,
      assistant: result,
    })
  } catch (error) {
    console.error("❌ Failed to create test assistant:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        suggestion: "Check VAPI API key permissions and configuration",
      },
      { status: 500 },
    )
  }
}
