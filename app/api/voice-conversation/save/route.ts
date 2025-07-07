import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { sessionId, userEmail, conversationLog, collectedData, currentSection, currentQuestion, lastUpdated } = data

    // Store conversation state in KV
    await kv.set(`voice-session:${sessionId}`, {
      userEmail,
      conversationLog,
      collectedData,
      currentSection,
      currentQuestion,
      lastUpdated,
      createdAt: new Date().toISOString(),
    })

    // Also store a reference by email for easy lookup
    const userSessions = (await kv.get(`user-sessions:${userEmail}`)) || []
    if (!userSessions.includes(sessionId)) {
      userSessions.push(sessionId)
      await kv.set(`user-sessions:${userEmail}`, userSessions)
    }

    return NextResponse.json({ success: true, sessionId })
  } catch (error) {
    console.error("Error saving voice conversation:", error)
    return NextResponse.json({ success: false, error: "Failed to save conversation" }, { status: 500 })
  }
}
