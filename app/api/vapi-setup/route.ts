import { NextResponse } from "next/server"
import { VAPIServer } from "@/lib/vapi-server"

const IKIGAI_ASSISTANT_CONFIG = {
  name: "Iki - Ikigai Survey Assistant",
  firstMessage: "Hello I'm Iki, here to help you leverage the Ikigai framework for discovering meaningful work.",
  systemMessage: `You are Iki, a warm and insightful voice assistant specializing in helping people discover their Ikigai through a comprehensive survey process.

Your role is to guide users through a structured 14-section survey that explores:
1. Personal Information (name, email)
2. Core Motivation & Purpose
3. Activities & Interests (with 1-5 rating scales)
4. Personal Strengths & Identity
5. Current Work Situation
6. Future Work Preferences
7. Vision & Dreams
8. Causes & Values
9. Daily Life & Energy
10. Social Recognition & Skills
11. Core Values
12. Career Priorities
13. Skill Development Interests
14. Additional Information

CONVERSATION GUIDELINES:
- Be warm, encouraging, and genuinely curious about their responses
- Ask one question at a time and wait for their response
- For rating questions (1-5 scale), clearly explain the scale
- For multiple choice questions, read all options clearly
- Validate responses and ask for clarification when needed
- Show genuine interest in their answers and provide brief encouraging comments
- Keep the conversation flowing naturally while staying on track
- Use the capture_survey_response function for every meaningful response
- Use navigate_survey to track progress through sections
- Use validate_rating_response for 1-5 scale questions

Remember: You're helping them discover meaningful work through the Ikigai framework - what they love, what they're good at, what the world needs, and what they can be paid for.`,

  model: {
    provider: "openai",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 500,
  },

  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel voice
    speed: 0.9,
    stability: 0.6,
    similarityBoost: 0.8,
  },

  functions: [
    {
      name: "capture_survey_response",
      description: "Captures and stores user responses to survey questions",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            description: "The survey section (e.g., 'personal_info', 'activities_interests')",
          },
          question: {
            type: "string",
            description: "The specific question being answered",
          },
          response: {
            type: "string",
            description: "The user's response",
          },
          responseType: {
            type: "string",
            enum: ["text", "rating", "multiple_choice", "list"],
            description: "Type of response",
          },
          rating: {
            type: "number",
            description: "Rating value for 1-5 scale questions",
          },
          selectedOptions: {
            type: "array",
            items: { type: "string" },
            description: "Selected options for multiple choice questions",
          },
        },
        required: ["section", "question", "response", "responseType"],
      },
    },
    {
      name: "navigate_survey",
      description: "Manages survey progress and section transitions",
      parameters: {
        type: "object",
        properties: {
          currentSection: {
            type: "string",
            description: "Current survey section",
          },
          nextSection: {
            type: "string",
            description: "Next section to move to",
          },
          progress: {
            type: "number",
            description: "Overall completion percentage (0-100)",
          },
          sectionComplete: {
            type: "boolean",
            description: "Whether current section is complete",
          },
        },
        required: ["currentSection", "progress"],
      },
    },
    {
      name: "validate_rating_response",
      description: "Validates 1-5 rating scale responses",
      parameters: {
        type: "object",
        properties: {
          rating: {
            type: "number",
            description: "The rating value to validate",
          },
          question: {
            type: "string",
            description: "The question being rated",
          },
          isValid: {
            type: "boolean",
            description: "Whether the rating is valid (1-5)",
          },
        },
        required: ["rating", "question", "isValid"],
      },
    },
  ],

  maxDurationSeconds: 2400, // 40 minutes for comprehensive survey
  silenceTimeoutSeconds: 30,
  responseDelaySeconds: 0.4,
  llmRequestDelaySeconds: 0.1,
  numWordsToInterruptAssistant: 2,

  recordingEnabled: true,
  endCallOnSilence: false,

  serverUrl: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/vapi/webhook` : undefined,
}

export async function GET() {
  try {
    const vapi = new VAPIServer()

    // Test connection
    const connectionTest = await vapi.testConnection()

    // Check if API key is configured
    const apiKeyConfigured = !!process.env.VAPI_API_KEY

    // Try to get existing assistant (this would need to be stored somewhere)
    // For now, we'll just return the status

    return NextResponse.json({
      apiKeyConfigured,
      connected: connectionTest.connected,
      assistantId: null, // Would be retrieved from storage
      error: connectionTest.error,
    })
  } catch (error) {
    console.error("Error checking VAPI setup:", error)
    return NextResponse.json({
      apiKeyConfigured: !!process.env.VAPI_API_KEY,
      connected: false,
      assistantId: null,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST() {
  try {
    const vapi = new VAPIServer()

    // Create the Ikigai assistant
    const assistant = await vapi.createAssistant(IKIGAI_ASSISTANT_CONFIG)

    // In a real app, you'd store the assistant ID in a database
    // For now, we'll just return it

    return NextResponse.json({
      success: true,
      assistantId: assistant.id,
      assistant,
    })
  } catch (error) {
    console.error("Error creating VAPI assistant:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
