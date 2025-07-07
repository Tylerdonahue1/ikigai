import { NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

export async function GET() {
  try {
    console.log("Checking for existing VAPI assistants...")

    const vapi = new VAPIServer()
    const assistants = await vapi.listAssistants()

    // Look for existing Ikigai assistant
    const ikigaiAssistant = assistants.data?.find(
      (assistant: any) =>
        assistant.name?.toLowerCase().includes("ikigai") || assistant.name?.toLowerCase().includes("iki"),
    )

    if (ikigaiAssistant) {
      console.log("Found existing Ikigai assistant:", ikigaiAssistant.id)
      return NextResponse.json({
        success: true,
        assistantId: ikigaiAssistant.id,
        message: "Using existing Ikigai assistant",
        assistant: ikigaiAssistant,
      })
    }

    return NextResponse.json({
      success: false,
      message: "No existing Ikigai assistant found",
      assistantCount: assistants.data?.length || 0,
    })
  } catch (error) {
    console.error("Error checking assistants:", error)

    const isAuthError = error instanceof Error && error.message.includes("Authentication Error")

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        isAuthError,
        suggestion: isAuthError
          ? "Please verify your VAPI API key type and permissions"
          : "Please check your VAPI configuration and try again",
      },
      { status: isAuthError ? 401 : 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("Creating new VAPI Ikigai assistant...")

    const vapi = new VAPIServer()
    const assistant = await vapi.createIkigaiAssistant()

    console.log("Successfully created Ikigai assistant:", assistant.id)

    return NextResponse.json({
      success: true,
      assistantId: assistant.id,
      message: "Successfully created Ikigai assistant",
      assistant,
    })
  } catch (error) {
    console.error("Error creating assistant:", error)

    const isAuthError = error instanceof Error && error.message.includes("Authentication Error")

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        isAuthError,
        suggestion: isAuthError
          ? "Please verify your VAPI API key type and permissions"
          : "Please check your VAPI configuration and try again",
      },
      { status: isAuthError ? 401 : 500 },
    )
  }
}
