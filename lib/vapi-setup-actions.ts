"use server"

import { VAPIServer } from "./vapi-server"

// Server action to test VAPI connection
export async function testVapiConnection() {
  try {
    const vapiServer = new VAPIServer()
    const assistant = await vapiServer.getAssistant("5542140a-b071-4455-8d43-6a0eb424dbc4")

    return {
      success: true,
      message: "VAPI connection successful",
      assistant: {
        id: assistant.id,
        name: assistant.name,
        model: assistant.model,
      },
    }
  } catch (error: any) {
    console.error("VAPI connection test failed:", error)
    return {
      success: false,
      message: error.message || "VAPI connection failed",
      error: error.toString(),
    }
  }
}

// Server action to create VAPI assistant
export async function createVapiAssistant(assistantConfig: any) {
  try {
    const vapiServer = new VAPIServer()

    // This would create a new assistant - implement based on your needs
    const assistant = await vapiServer.createCall(assistantConfig)

    return {
      success: true,
      message: "VAPI assistant created successfully",
      assistant,
    }
  } catch (error: any) {
    console.error("VAPI assistant creation failed:", error)
    return {
      success: false,
      message: error.message || "VAPI assistant creation failed",
      error: error.toString(),
    }
  }
}
