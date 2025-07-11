import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET(request: NextRequest, { params }: { params: { callId: string } }) {
  try {
    const { callId } = params

    console.log("📊 Retrieving survey results for call:", callId)

    const key = `ikigai_survey:${callId}`
    const surveyData = await kv.get(key)

    if (!surveyData) {
      return NextResponse.json(
        {
          success: false,
          error: "Survey data not found",
          callId,
        },
        { status: 404 },
      )
    }

    console.log(`✅ Found survey data with ${surveyData.responses?.length || 0} responses`)

    return NextResponse.json({
      success: true,
      callId,
      surveyData,
      summary: {
        totalResponses: surveyData.responses?.length || 0,
        sections: [...new Set(surveyData.responses?.map((r: any) => r.section) || [])],
        duration: surveyData.endedAt
          ? new Date(surveyData.endedAt).getTime() - new Date(surveyData.startedAt).getTime()
          : null,
        status: surveyData.status || "unknown",
      },
    })
  } catch (error) {
    console.error("Error retrieving survey results:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
