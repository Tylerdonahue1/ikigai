"use server"

import { VAPI_API_KEY } from "./vapi-server"

export async function createVAPICall(assistantId: string, metadata?: any) {
  try {
    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId,
        metadata,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create call: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating VAPI call:", error)
    throw error
  }
}

export async function getVAPICall(callId: string) {
  try {
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get call: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error getting VAPI call:", error)
    throw error
  }
}

export async function endVAPICall(callId: string) {
  try {
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "ended",
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to end call: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error ending VAPI call:", error)
    throw error
  }
}
