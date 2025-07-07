import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params

    const sessionData = await kv.get(`voice-session:${sessionId}`)

    if (!sessionData) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, ...sessionData })
  } catch (error) {
    console.error("Error loading voice conversation:", error)
    return NextResponse.json({ success: false, error: "Failed to load conversation" }, { status: 500 })
  }
}
