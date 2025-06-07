import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Check the assessment status
    const assessment = await kv.get(`assessment:${id}`)

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    // Check if Ikigai analysis is complete
    const ikigaiData = await kv.get(`ikigai:${id}`)

    return NextResponse.json({
      status: (assessment as any).status,
      hasResults: !!ikigaiData,
      assessment,
    })
  } catch (error) {
    console.error("Error checking processing status:", error)
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 })
  }
}
