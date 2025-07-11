import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function POST(request: NextRequest) {
  try {
    console.log("=== VAPI Webhook Called ===")

    const body = await request.json()
    console.log("Webhook payload:", JSON.stringify(body, null, 2))

    // Handle different webhook events from your assistant
    const { type, call, message } = body

    switch (type) {
      case "function-call":
        return await handleFunctionCall(body)
      case "call-start":
        return await handleCallStart(body)
      case "call-end":
        return await handleCallEnd(body)
      case "transcript":
        return await handleTranscript(body)
      default:
        console.log("❓ Unknown webhook type:", type)
        return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("❌ Webhook error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function handleFunctionCall(body: any) {
  console.log("🔧 Function call received")

  const { call, message } = body
  const functionCall = message?.functionCall

  if (!functionCall) {
    console.log("No function call data found")
    return NextResponse.json({ success: true })
  }

  console.log("Function details:", {
    name: functionCall.name,
    parameters: functionCall.parameters,
    callId: call?.id,
  })

  try {
    switch (functionCall.name) {
      case "capture_survey_response":
        return await captureSurveyResponse(functionCall.parameters, call?.id)
      case "navigate_survey":
        return await navigateSurvey(functionCall.parameters, call?.id)
      default:
        console.log("Unknown function:", functionCall.name)
        return NextResponse.json({
          success: true,
          message: "Function call received",
        })
    }
  } catch (error) {
    console.error("Function call processing error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}

async function captureSurveyResponse(parameters: any, callId: string) {
  const { section, question, response, insights } = parameters

  console.log("📝 Capturing survey response:", {
    section,
    question: question?.substring(0, 100),
    response: response?.substring(0, 100),
    insights,
    callId,
  })

  try {
    // Store in Redis with the call ID as key
    const key = `ikigai_survey:${callId}`
    const existingData = (await kv.get(key)) || { responses: [], callId, startedAt: new Date().toISOString() }

    const responseData = {
      section,
      question,
      response,
      insights,
      timestamp: new Date().toISOString(),
    }

    existingData.responses.push(responseData)
    existingData.lastUpdated = new Date().toISOString()

    await kv.set(key, existingData)

    console.log(`✅ Response stored for call ${callId}. Total responses: ${existingData.responses.length}`)

    return NextResponse.json({
      success: true,
      message: "Response captured successfully",
      totalResponses: existingData.responses.length,
    })
  } catch (error) {
    console.error("Failed to store survey response:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to store response",
    })
  }
}

async function navigateSurvey(parameters: any, callId: string) {
  const { action, currentSection } = parameters

  console.log("🧭 Survey navigation:", { action, currentSection, callId })

  // You can add logic here to track survey progress
  // For now, just acknowledge the navigation

  return NextResponse.json({
    success: true,
    message: "Navigation acknowledged",
    action,
    currentSection,
  })
}

async function handleCallStart(body: any) {
  const { call } = body
  console.log("📞 Call started:", call?.id)

  // Initialize survey data
  if (call?.id) {
    const key = `ikigai_survey:${call.id}`
    await kv.set(key, {
      callId: call.id,
      startedAt: new Date().toISOString(),
      responses: [],
      status: "started",
    })
  }

  return NextResponse.json({ success: true })
}

async function handleCallEnd(body: any) {
  const { call } = body
  console.log("📞 Call ended:", call?.id)

  // Mark survey as completed
  if (call?.id) {
    try {
      const key = `ikigai_survey:${call.id}`
      const surveyData = await kv.get(key)

      if (surveyData) {
        surveyData.endedAt = new Date().toISOString()
        surveyData.status = "completed"
        await kv.set(key, surveyData)

        console.log(`✅ Survey completed for call ${call.id} with ${surveyData.responses?.length || 0} responses`)

        // Here you could trigger processing of the completed survey
        // e.g., generate Ikigai diagram, send email, etc.
      }
    } catch (error) {
      console.error("Error updating survey completion:", error)
    }
  }

  return NextResponse.json({ success: true })
}

async function handleTranscript(body: any) {
  const { call, message } = body
  console.log("📝 Transcript received for call:", call?.id)

  // You could store transcripts if needed
  // For now, just acknowledge

  return NextResponse.json({ success: true })
}

export async function GET() {
  return NextResponse.json({
    message: "VAPI Webhook endpoint is active",
    assistantId: "5542140a-b071-4455-8d43-6a0eb424dbc4",
    timestamp: new Date().toISOString(),
  })
}
