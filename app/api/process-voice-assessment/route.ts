import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function POST(request: Request) {
  try {
    const { email, ikigaiData, conversation, callId } = await request.json()

    // Generate a unique assessment ID
    const assessmentId = Math.random().toString(36).substring(2, 15)

    // Convert voice conversation data to form format
    const formData = convertVoiceDataToFormFormat(ikigaiData, conversation)

    // Store the initial assessment data
    await kv.set(`assessment:${assessmentId}`, {
      ...formData,
      email,
      submittedAt: new Date().toISOString(),
      status: "processing",
      source: "voice",
      callId,
    })

    // Process with Claude AI in the background
    processVoiceAssessmentWithClaude(formData, assessmentId, conversation).catch(console.error)

    return NextResponse.json({ success: true, assessmentId })
  } catch (error) {
    console.error("Error processing voice assessment:", error)
    return NextResponse.json({ success: false, error: "Failed to process assessment" }, { status: 500 })
  }
}

function convertVoiceDataToFormFormat(ikigaiData: any, conversation: any[]): any {
  // Extract structured data from the voice conversation
  const formData: any = {
    firstName: ikigaiData.firstName || "",
    email: ikigaiData.email || "",
    primaryReason: ikigaiData.primaryReason || "",
    activities: Array.isArray(ikigaiData.interests) ? ikigaiData.interests : [],
    skillStatements: Array.isArray(ikigaiData.skills) ? ikigaiData.skills : [],
    currentWork: Array.isArray(ikigaiData.currentWork) ? ikigaiData.currentWork : [],
    heartCauses: Array.isArray(ikigaiData.causes) ? ikigaiData.causes : [],
  }

  // Extract additional data from conversation context
  const conversationText = conversation
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content)
    .join(" ")

  // Add conversation context for richer analysis
  formData.conversationContext = conversationText
  formData.voiceInteractionData = ikigaiData

  return formData
}

async function processVoiceAssessmentWithClaude(formData: any, assessmentId: string, conversation: any[]) {
  try {
    // Create enhanced prompt that includes voice conversation context
    const prompt = createVoiceIkigaiPrompt(formData, conversation)

    // Generate the Ikigai analysis using Claude
    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt,
      maxTokens: 4000,
    })

    // Parse the response and structure it
    const ikigaiAnalysis = parseClaudeResponse(text, formData)

    // Store the complete analysis
    await kv.set(`ikigai:${assessmentId}`, ikigaiAnalysis)

    // Update status to completed
    await kv.set(`assessment:${assessmentId}`, {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "completed",
      completedAt: new Date().toISOString(),
    })

    console.log(`Voice Ikigai analysis completed for ID: ${assessmentId}`)
  } catch (error) {
    console.error("Error processing voice assessment with Claude:", error)

    // Update status to error
    await kv.set(`assessment:${assessmentId}`, {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

function createVoiceIkigaiPrompt(formData: any, conversation: any[]): string {
  const conversationTranscript = conversation
    .map((msg) => `${msg.role === "user" ? "User" : "Maya"}: ${msg.content}`)
    .join("\n")

  return `You are an expert Ikigai coach and life purpose analyst. Based on the following voice conversation and extracted data, create a comprehensive, personalized Ikigai analysis.

VOICE CONVERSATION TRANSCRIPT:
${conversationTranscript}

EXTRACTED STRUCTURED DATA:
Name: ${formData.firstName}
Email: ${formData.email}
Primary Reason: ${formData.primaryReason}
Interests/Activities: ${formData.activities?.join(", ") || "None specified"}
Skills: ${formData.skillStatements?.join(", ") || "None specified"}
Current Work: ${formData.currentWork?.join(", ") || "None specified"}
Heart Causes: ${formData.heartCauses?.join(", ") || "None specified"}

VOICE INTERACTION INSIGHTS:
${JSON.stringify(formData.voiceInteractionData, null, 2)}

Please provide a comprehensive Ikigai analysis that takes into account both the structured data and the nuanced insights from the voice conversation. Pay special attention to:
- The emotional tone and passion in their voice responses
- Hesitations or excitement when discussing certain topics
- Spontaneous insights that emerged during conversation
- The natural flow of their thoughts and associations

Return your analysis in the following JSON format:

{
  "name": "${formData.firstName}",
  "completionDate": "${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} ${new Date().toLocaleTimeString("en-US")}",
  "ikigaiSummary": "A compelling 2-3 sentence summary incorporating insights from the voice conversation",
  "buildingBlocks": {
    "love": "Detailed analysis based on conversation tone and content",
    "good": "Skills analysis including confidence and enthusiasm expressed",
    "paid": "Career potential based on current work and aspirations discussed",
    "world": "Impact desires based on causes and passion expressed in conversation"
  },
  "passion": {
    "overlap": "Deep analysis of love/skills intersection with voice insights",
    "examples": ["3-4 specific examples based on conversation insights"]
  },
  "mission": {
    "overlap": "Love/world needs intersection with emotional resonance from voice",
    "examples": ["3-4 specific examples reflecting conversation passion"]
  },
  "vocation": {
    "overlap": "World needs/paid intersection with practical insights from conversation",
    "examples": ["3-4 specific examples based on discussed aspirations"]
  },
  "profession": {
    "overlap": "Skills/paid intersection with confidence expressed in conversation",
    "examples": ["3-4 specific examples reflecting discussed capabilities"]
  },
  "ikigai": {
    "overlap": "Comprehensive center analysis incorporating voice conversation insights",
    "examples": ["4-5 specific suggestions reflecting the full conversation context"]
  },
  "ikigaiIcons": [
    {
      "name": "Real person's name",
      "description": "Brief description",
      "matchReason": "Why they match based on conversation insights",
      "relevantWork": "Specific work examples",
      "keyInsight": "Key lesson from this person"
    }
  ],
  "emergingPatterns": "Analysis incorporating voice conversation patterns and insights",
  "suggestedResources": ["4-5 specific resources based on conversation interests"],
  "voiceInsights": "Special section highlighting unique insights gained from the voice conversation format"
}

Make this deeply personal and insightful, using the rich context from the voice conversation to create a more nuanced and meaningful analysis than would be possible from form data alone.`
}

function parseClaudeResponse(text: string, formData: any): any {
  try {
    // Clean and parse the response
    let cleanedText = text.trim()
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    const jsonStart = cleanedText.indexOf("{")
    const jsonEnd = cleanedText.lastIndexOf("}") + 1

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No JSON object found in response")
    }

    const jsonString = cleanedText.substring(jsonStart, jsonEnd)
    const parsed = JSON.parse(jsonString)

    // Ensure all required fields with voice-specific enhancements
    return {
      id: Math.random().toString(36).substring(2, 15),
      name: parsed.name || formData.firstName || "Anonymous User",
      completionDate: parsed.completionDate || new Date().toLocaleDateString(),
      ikigaiSummary: parsed.ikigaiSummary || "Your voice-based Ikigai analysis has been completed.",
      buildingBlocks: {
        love: parsed.buildingBlocks?.love || "Analysis of your interests and passions from our conversation.",
        good: parsed.buildingBlocks?.good || "Analysis of your skills and abilities discussed.",
        paid: parsed.buildingBlocks?.paid || "Analysis of your earning potential from our conversation.",
        world: parsed.buildingBlocks?.world || "Analysis of your potential impact discussed.",
      },
      passion: {
        overlap: parsed.passion?.overlap || "The intersection of what you love and what you're good at.",
        examples: Array.isArray(parsed.passion?.examples) ? parsed.passion.examples : [],
      },
      mission: {
        overlap: parsed.mission?.overlap || "The intersection of what you love and what the world needs.",
        examples: Array.isArray(parsed.mission?.examples) ? parsed.mission.examples : [],
      },
      vocation: {
        overlap: parsed.vocation?.overlap || "The intersection of what the world needs and what you can be paid for.",
        examples: Array.isArray(parsed.vocation?.examples) ? parsed.vocation.examples : [],
      },
      profession: {
        overlap: parsed.profession?.overlap || "The intersection of what you're good at and what you can be paid for.",
        examples: Array.isArray(parsed.profession?.examples) ? parsed.profession.examples : [],
      },
      ikigai: {
        overlap: parsed.ikigai?.overlap || "Your unique purpose discovered through our voice conversation.",
        examples: Array.isArray(parsed.ikigai?.examples) ? parsed.ikigai.examples : [],
      },
      ikigaiIcons: Array.isArray(parsed.ikigaiIcons) ? parsed.ikigaiIcons : [],
      emergingPatterns: parsed.emergingPatterns || "Patterns discovered through our voice conversation.",
      suggestedResources: Array.isArray(parsed.suggestedResources) ? parsed.suggestedResources : [],
      voiceInsights: parsed.voiceInsights || "Unique insights gained from our voice conversation format.",
      source: "voice",
    }
  } catch (error) {
    console.error("Error parsing Claude response:", error)
    console.error("Raw response:", text)

    // Return fallback structure for voice assessment
    return {
      id: Math.random().toString(36).substring(2, 15),
      name: formData.firstName || "Anonymous User",
      completionDate: new Date().toLocaleDateString(),
      ikigaiSummary: "Your voice-based Ikigai analysis has been generated from our conversation.",
      buildingBlocks: {
        love: "Your interests and passions discussed in our conversation.",
        good: "Your skills and abilities shared during our talk.",
        paid: "Your career opportunities identified from our discussion.",
        world: "Your potential impact explored in our conversation.",
      },
      passion: { overlap: "The intersection of your interests and abilities from our conversation.", examples: [] },
      mission: { overlap: "The intersection of your passions and impact goals from our talk.", examples: [] },
      vocation: { overlap: "The intersection of your impact goals and career potential discussed.", examples: [] },
      profession: { overlap: "The intersection of your abilities and career opportunities.", examples: [] },
      ikigai: { overlap: "Your unique purpose discovered through our voice conversation.", examples: [] },
      ikigaiIcons: [],
      emergingPatterns: "Your conversation revealed unique patterns about your purpose and direction.",
      suggestedResources: [],
      voiceInsights: "The voice conversation format provided deeper insights into your authentic self.",
      source: "voice",
    }
  }
}
