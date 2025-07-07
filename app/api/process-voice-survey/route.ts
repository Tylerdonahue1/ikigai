import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function POST(request: Request) {
  try {
    const { email, surveyData, conversation, callId } = await request.json()

    // Generate a unique assessment ID
    const assessmentId = Math.random().toString(36).substring(2, 15)

    // Convert voice survey data to form format
    const formData = convertVoiceSurveyToFormFormat(surveyData, conversation)

    // Store the initial assessment data
    await kv.set(`assessment:${assessmentId}`, {
      ...formData,
      email,
      submittedAt: new Date().toISOString(),
      status: "processing",
      source: "voice_survey",
      callId,
    })

    // Process with Claude AI in the background
    processVoiceSurveyWithClaude(formData, assessmentId, conversation).catch(console.error)

    return NextResponse.json({ success: true, assessmentId })
  } catch (error) {
    console.error("Error processing voice survey:", error)
    return NextResponse.json({ success: false, error: "Failed to process survey" }, { status: 500 })
  }
}

function convertVoiceSurveyToFormFormat(surveyData: any, conversation: any[]): any {
  // Map voice survey data to the expected form format
  const formData: any = {
    firstName: surveyData.firstName || "",
    lastName: surveyData.lastName || "",
    email: surveyData.email || "",
    primaryReason: surveyData.primaryReason || "",

    // Activities and interests
    activities: Array.isArray(surveyData.activities) ? surveyData.activities : [],
    activityRatings: surveyData.activityRatings || {},
    additionalInterests: surveyData.additionalInterests || "",

    // Strengths and identity
    skillStatements: Array.isArray(surveyData.strengthStatements) ? surveyData.strengthStatements : [],
    skillDescription: surveyData.skillDescription || "",
    additionalSkills: surveyData.additionalSkills || "",

    // Work information
    currentWork: surveyData.currentWork || "",
    futureWorkPreferences: Array.isArray(surveyData.futureWorkPreferences) ? surveyData.futureWorkPreferences : [],

    // Vision and dreams
    threeYearVision: surveyData.threeYearVision || "",
    burningQuestion: surveyData.burningQuestion || "",

    // Causes and values
    heartCauses: Array.isArray(surveyData.causes) ? surveyData.causes : [],
    additionalCauses: surveyData.additionalCauses || "",
    coreValues: Array.isArray(surveyData.coreValues) ? surveyData.coreValues : [],

    // Energy and recognition
    energizingActivities: surveyData.energizingActivities || "",
    freeAfternoon: surveyData.freeAfternoon || "",
    loseTrackTime: surveyData.loseTrackTime || "",
    socialRecognition: surveyData.socialRecognition || "",

    // Career priorities and development
    careerPriorities: surveyData.careerPriorities || "",
    skillDevelopment: surveyData.skillDevelopment || "",

    // Additional information
    additionalInfo: surveyData.additionalInfo || "",
  }

  // Extract additional context from conversation
  const conversationText = conversation
    .filter((msg) => msg.role === "user")
    .map((msg) => msg.content)
    .join(" ")

  // Add conversation context for richer analysis
  formData.conversationContext = conversationText
  formData.voiceSurveyData = surveyData
  formData.fullConversation = conversation

  return formData
}

async function processVoiceSurveyWithClaude(formData: any, assessmentId: string, conversation: any[]) {
  try {
    // Create enhanced prompt that includes voice survey context
    const prompt = createVoiceSurveyIkigaiPrompt(formData, conversation)

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

    console.log(`Voice survey Ikigai analysis completed for ID: ${assessmentId}`)
  } catch (error) {
    console.error("Error processing voice survey with Claude:", error)

    // Update status to error
    await kv.set(`assessment:${assessmentId}`, {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

function createVoiceSurveyIkigaiPrompt(formData: any, conversation: any[]): string {
  const conversationTranscript = conversation
    .map((msg) => `${msg.role === "user" ? "User" : "Iki"}: ${msg.content}`)
    .join("\n")

  return `You are an expert Ikigai coach and life purpose analyst. Based on the following comprehensive voice survey conversation and extracted data, create a detailed, personalized Ikigai analysis.

VOICE SURVEY CONVERSATION TRANSCRIPT:
${conversationTranscript}

COMPREHENSIVE SURVEY DATA:
Personal Information:
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}
- Primary Reason: ${formData.primaryReason}

Activities & Interests:
- Selected Activities: ${formData.activities?.join(", ") || "None specified"}
- Activity Ratings: ${JSON.stringify(formData.activityRatings) || "None provided"}
- Additional Interests: ${formData.additionalInterests || "None specified"}

Strengths & Identity:
- Strength Statements: ${formData.skillStatements?.join(", ") || "None specified"}
- Skill Description: ${formData.skillDescription || "None specified"}
- Additional Skills: ${formData.additionalSkills || "None specified"}

Work Information:
- Current Work: ${formData.currentWork || "None specified"}
- Future Work Preferences: ${formData.futureWorkPreferences?.join(", ") || "None specified"}

Vision & Dreams:
- 3-Year Vision: ${formData.threeYearVision || "None specified"}
- Burning Question: ${formData.burningQuestion || "None specified"}

Causes & Values:
- Heart Causes: ${formData.heartCauses?.join(", ") || "None specified"}
- Additional Causes: ${formData.additionalCauses || "None specified"}
- Core Values: ${formData.coreValues?.join(", ") || "None specified"}

Daily Life & Energy:
- Energizing Activities: ${formData.energizingActivities || "None specified"}
- Free Afternoon Preferences: ${formData.freeAfternoon || "None specified"}
- Lose Track of Time: ${formData.loseTrackTime || "None specified"}
- Social Recognition: ${formData.socialRecognition || "None specified"}

Career & Development:
- Career Priorities: ${formData.careerPriorities || "None specified"}
- Skill Development Interests: ${formData.skillDevelopment || "None specified"}

Additional Information: ${formData.additionalInfo || "None provided"}

VOICE SURVEY INSIGHTS:
${JSON.stringify(formData.voiceSurveyData, null, 2)}

Please provide a comprehensive Ikigai analysis that takes into account the full breadth of the survey data and the nuanced insights from the voice conversation. Pay special attention to:
- The comprehensive nature of the survey responses
- Patterns across different sections of the survey
- The depth of information provided through voice interaction
- Connections between different aspects of their responses
- The natural flow and authenticity of their voice responses

Return your analysis in the following JSON format:

{
  "name": "${formData.firstName} ${formData.lastName}",
  "completionDate": "${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} ${new Date().toLocaleTimeString("en-US")}",
  "ikigaiSummary": "A compelling 2-3 sentence summary incorporating insights from the comprehensive voice survey",
  "buildingBlocks": {
    "love": "Detailed analysis based on activities, interests, and energy responses",
    "good": "Skills analysis including strengths, recognition, and abilities discussed",
    "paid": "Career potential based on current work, future preferences, and skill development",
    "world": "Impact desires based on causes, values, and vision for making a difference"
  },
  "passion": {
    "overlap": "Deep analysis of love/skills intersection with comprehensive survey insights",
    "examples": ["4-5 specific examples based on survey responses and conversation insights"]
  },
  "mission": {
    "overlap": "Love/world needs intersection with values and causes from survey",
    "examples": ["4-5 specific examples reflecting survey passion and purpose"]
  },
  "vocation": {
    "overlap": "World needs/paid intersection with career priorities and development interests",
    "examples": ["4-5 specific examples based on survey career aspirations"]
  },
  "profession": {
    "overlap": "Skills/paid intersection with strengths and work preferences from survey",
    "examples": ["4-5 specific examples reflecting survey capabilities and goals"]
  },
  "ikigai": {
    "overlap": "Comprehensive center analysis incorporating all survey sections and voice insights",
    "examples": ["5-6 specific suggestions reflecting the complete survey context"]
  },
  "ikigaiIcons": [
    {
      "name": "Real person's name",
      "description": "Brief description",
      "matchReason": "Why they match based on comprehensive survey insights",
      "relevantWork": "Specific work examples",
      "keyInsight": "Key lesson from this person"
    }
  ],
  "emergingPatterns": "Analysis incorporating patterns across all survey sections and voice insights",
  "suggestedResources": ["5-6 specific resources based on comprehensive survey interests and goals"],
  "voiceSurveyInsights": "Special section highlighting unique insights gained from the comprehensive voice survey format and the depth of information collected"
}

Make this deeply personal and insightful, using the rich, comprehensive context from the voice survey to create a more nuanced and meaningful analysis than would be possible from limited form data alone. The analysis should reflect the thoroughness of the 14-section survey and the authentic voice interaction.`
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

    // Ensure all required fields with voice survey-specific enhancements
    return {
      id: Math.random().toString(36).substring(2, 15),
      name: parsed.name || `${formData.firstName} ${formData.lastName}` || "Anonymous User",
      completionDate: parsed.completionDate || new Date().toLocaleDateString(),
      ikigaiSummary: parsed.ikigaiSummary || "Your comprehensive voice survey Ikigai analysis has been completed.",
      buildingBlocks: {
        love: parsed.buildingBlocks?.love || "Analysis of your interests and passions from the comprehensive survey.",
        good: parsed.buildingBlocks?.good || "Analysis of your skills and abilities from the survey responses.",
        paid: parsed.buildingBlocks?.paid || "Analysis of your earning potential from career and skill data.",
        world: parsed.buildingBlocks?.world || "Analysis of your potential impact from values and causes discussed.",
      },
      passion: {
        overlap:
          parsed.passion?.overlap || "The intersection of what you love and what you're good at from your survey.",
        examples: Array.isArray(parsed.passion?.examples) ? parsed.passion.examples : [],
      },
      mission: {
        overlap:
          parsed.mission?.overlap || "The intersection of what you love and what the world needs from your survey.",
        examples: Array.isArray(parsed.mission?.examples) ? parsed.mission.examples : [],
      },
      vocation: {
        overlap:
          parsed.vocation?.overlap ||
          "The intersection of what the world needs and what you can be paid for from your survey.",
        examples: Array.isArray(parsed.vocation?.examples) ? parsed.vocation.examples : [],
      },
      profession: {
        overlap:
          parsed.profession?.overlap ||
          "The intersection of what you're good at and what you can be paid for from your survey.",
        examples: Array.isArray(parsed.profession?.examples) ? parsed.profession.examples : [],
      },
      ikigai: {
        overlap: parsed.ikigai?.overlap || "Your unique purpose discovered through the comprehensive voice survey.",
        examples: Array.isArray(parsed.ikigai?.examples) ? parsed.ikigai.examples : [],
      },
      ikigaiIcons: Array.isArray(parsed.ikigaiIcons) ? parsed.ikigaiIcons : [],
      emergingPatterns:
        parsed.emergingPatterns || "Patterns discovered through your comprehensive voice survey responses.",
      suggestedResources: Array.isArray(parsed.suggestedResources) ? parsed.suggestedResources : [],
      voiceSurveyInsights:
        parsed.voiceSurveyInsights ||
        "Unique insights gained from the comprehensive voice survey format and thorough data collection.",
      source: "voice_survey",
    }
  } catch (error) {
    console.error("Error parsing Claude response:", error)
    console.error("Raw response:", text)

    // Return fallback structure for voice survey
    return {
      id: Math.random().toString(36).substring(2, 15),
      name: `${formData.firstName} ${formData.lastName}` || "Anonymous User",
      completionDate: new Date().toLocaleDateString(),
      ikigaiSummary: "Your comprehensive voice survey Ikigai analysis has been generated from your detailed responses.",
      buildingBlocks: {
        love: "Your interests and passions explored through the comprehensive survey.",
        good: "Your skills and abilities identified through detailed survey responses.",
        paid: "Your career opportunities discovered through work and skill exploration.",
        world: "Your potential impact identified through values and causes discussion.",
      },
      passion: {
        overlap: "The intersection of your interests and abilities from comprehensive survey data.",
        examples: [],
      },
      mission: { overlap: "The intersection of your passions and impact goals from survey responses.", examples: [] },
      vocation: {
        overlap: "The intersection of your impact goals and career potential from survey data.",
        examples: [],
      },
      profession: {
        overlap: "The intersection of your abilities and career opportunities from survey responses.",
        examples: [],
      },
      ikigai: {
        overlap: "Your unique purpose discovered through the comprehensive voice survey process.",
        examples: [],
      },
      ikigaiIcons: [],
      emergingPatterns: "Your comprehensive survey revealed detailed patterns about your purpose and direction.",
      suggestedResources: [],
      voiceSurveyInsights:
        "The comprehensive voice survey format provided deep insights into your authentic self through detailed exploration of all Ikigai dimensions.",
      source: "voice_survey",
    }
  }
}
