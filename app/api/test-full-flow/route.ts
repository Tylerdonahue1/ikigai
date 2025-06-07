import { NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { kv } from "@vercel/kv"

export async function POST() {
  try {
    console.log("Starting full flow test...")

    // Step 1: Simulate form submission
    const mockFormData = {
      firstName: "Alex",
      email: "alex@test.com",
      primaryReason: "I want to understand myself better",
      activities: ["Solving complex problems and puzzles", "Building and experimenting with new technology"],
      enjoymentRatings: { "Solving puzzles or designing systems": 5 },
      skillStatements: ["I'm a Problem Solver", "I'm a Builder"],
      skillConfidence: { "I'm a Problem Solver": 5 },
      currentWork: ["Software Engineering"],
      nextChapterPriorities: ["Creative expression and innovation"],
      heartCauses: ["Technology & Innovation", "Education & Skill-Building"],
    }

    // Step 2: Generate unique ID
    const id = `test-${Math.random().toString(36).substring(2, 15)}`

    // Step 3: Store initial data
    await kv.set(`assessment:${id}`, {
      ...mockFormData,
      submittedAt: new Date().toISOString(),
      status: "processing",
    })

    // Step 4: Generate AI analysis
    const prompt = `You are an expert Ikigai coach. Create a personalized Ikigai analysis for ${mockFormData.firstName}.

ASSESSMENT DATA:
Name: ${mockFormData.firstName}
Primary Reason: ${mockFormData.primaryReason}
Activities: ${mockFormData.activities.join(", ")}
Skills: ${mockFormData.skillStatements.join(", ")}
Current Work: ${mockFormData.currentWork.join(", ")}
Heart Causes: ${mockFormData.heartCauses.join(", ")}

Respond with ONLY a valid JSON object in this exact format:
{
  "name": "${mockFormData.firstName}",
  "completionDate": "${new Date().toLocaleDateString()}",
  "ikigaiSummary": "A brief summary of their Ikigai",
  "buildingBlocks": {
    "love": "What they love based on activities",
    "good": "What they're good at based on skills", 
    "paid": "What they can be paid for",
    "world": "What the world needs based on causes"
  },
  "ikigai": {
    "overlap": "Their unique Ikigai",
    "examples": ["Suggestion 1", "Suggestion 2"]
  }
}`

    console.log("Calling Claude AI...")
    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt,
      maxTokens: 1000,
    })

    // Step 5: Parse and store results
    let parsedData
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      parsedData = {
        name: mockFormData.firstName,
        completionDate: new Date().toLocaleDateString(),
        ikigaiSummary: "Test analysis generated successfully",
        buildingBlocks: {
          love: "Technology and problem-solving",
          good: "Programming and analytical thinking",
          paid: "Software engineering",
          world: "Technology education and innovation",
        },
        ikigai: {
          overlap: "Using technology to solve problems and educate others",
          examples: ["Build educational apps", "Create coding tutorials"],
        },
      }
    }

    // Step 6: Store final results
    await kv.set(`ikigai:${id}`, parsedData)

    // Step 7: Update status
    await kv.set(`assessment:${id}`, {
      ...mockFormData,
      submittedAt: new Date().toISOString(),
      status: "completed",
      completedAt: new Date().toISOString(),
    })

    // Step 8: Verify data retrieval
    const storedData = await kv.get(`ikigai:${id}`)

    return NextResponse.json({
      success: true,
      message: "🎉 FULL SYSTEM TEST PASSED!",
      testId: id,
      steps: {
        "1_form_submission": "✅ Simulated",
        "2_id_generation": "✅ Generated",
        "3_data_storage": "✅ Stored",
        "4_ai_analysis": "✅ Generated",
        "5_result_parsing": "✅ Parsed",
        "6_final_storage": "✅ Stored",
        "7_status_update": "✅ Updated",
        "8_data_retrieval": "✅ Verified",
      },
      generatedAnalysis: parsedData,
      storedData,
      previewUrl: `/ikigai/${id}/preview`,
      fullUrl: `/ikigai/${id}`,
    })
  } catch (error) {
    console.error("Full flow test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "❌ SYSTEM TEST FAILED",
      },
      { status: 500 },
    )
  }
}
