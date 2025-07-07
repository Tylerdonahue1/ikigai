import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

    const sessions = []

    if (email) {
      // Get sessions for specific email
      const userSessions = (await kv.get(`user-sessions:${email}`)) || []

      for (const sessionId of userSessions) {
        const sessionData = await kv.get(`voice-session:${sessionId}`)
        if (sessionData) {
          sessions.push({
            sessionId,
            ...sessionData,
            conversationLength: sessionData.conversationLog?.length || 0,
            completionPercentage: calculateCompletionPercentage(sessionData.collectedData),
            isComplete: isAssessmentComplete(sessionData.collectedData),
          })
        }
      }
    } else {
      // Get all sessions (admin view)
      const keys = await kv.keys("voice-session:*")

      for (const key of keys) {
        const sessionData = await kv.get(key)
        if (sessionData) {
          const sessionId = key.replace("voice-session:", "")
          sessions.push({
            sessionId,
            ...sessionData,
            conversationLength: sessionData.conversationLog?.length || 0,
            completionPercentage: calculateCompletionPercentage(sessionData.collectedData),
            isComplete: isAssessmentComplete(sessionData.collectedData),
          })
        }
      }
    }

    // Sort by last updated
    sessions.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())

    return NextResponse.json({ success: true, sessions })
  } catch (error) {
    console.error("Error listing voice conversations:", error)
    return NextResponse.json({ success: false, error: "Failed to list conversations" }, { status: 500 })
  }
}

function calculateCompletionPercentage(collectedData: any): number {
  const requiredFields = [
    "firstName",
    "email",
    "primaryReason",
    "activities",
    "skillStatements",
    "currentWork",
    "nextChapterPriorities",
    "heartCauses",
  ]

  const completedFields = requiredFields.filter(
    (field) => collectedData[field] && (Array.isArray(collectedData[field]) ? collectedData[field].length > 0 : true),
  )

  return Math.round((completedFields.length / requiredFields.length) * 100)
}

function isAssessmentComplete(collectedData: any): boolean {
  return calculateCompletionPercentage(collectedData) >= 80
}
