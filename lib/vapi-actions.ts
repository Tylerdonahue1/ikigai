"use server"

import { VapiService } from "./vapi-server"

// Server action to test VAPI connection
export async function testVapiConnection() {
  try {
    const vapiService = new VapiService()
    const assistant = await vapiService.getAssistant("5542140a-b071-4455-8d43-6a0eb424dbc4")

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

// Server action to create a web call
export async function createVapiWebCall(assistantId: string, metadata?: Record<string, any>) {
  try {
    const vapiService = new VapiService()
    const call = await vapiService.createCall({
      assistantId,
      type: "webCall",
      metadata,
    })

    return {
      success: true,
      callId: call.id,
      call,
    }
  } catch (error: any) {
    console.error("Failed to create VAPI web call:", error)
    return {
      success: false,
      message: error.message || "Failed to create web call",
      error: error.toString(),
    }
  }
}

// Server action to get call details
export async function getVapiCall(callId: string) {
  try {
    const vapiService = new VapiService()
    const call = await vapiService.getCall(callId)

    return {
      success: true,
      call,
    }
  } catch (error: any) {
    console.error("Failed to get VAPI call:", error)
    return {
      success: false,
      message: error.message || "Failed to get call",
      error: error.toString(),
    }
  }
}

// Server action to end a call
export async function endVapiCall(callId: string) {
  try {
    const vapiService = new VapiService()
    await vapiService.endCall(callId)

    return {
      success: true,
      message: "Call ended successfully",
    }
  } catch (error: any) {
    console.error("Failed to end VAPI call:", error)
    return {
      success: false,
      message: error.message || "Failed to end call",
      error: error.toString(),
    }
  }
}
