export interface VAPIConfig {
  apiKey: string
  assistantId?: string
  model?: string
  voice?: {
    provider: string
    voiceId: string
  }
}

export interface VAPICall {
  id: string
  status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended"
  transcript?: VAPIMessage[]
  summary?: string
  recordingUrl?: string
}

export interface VAPIMessage {
  role: "assistant" | "user" | "system"
  message: string
  timestamp: string
  secondsFromStart?: number
}

export class VAPIClient {
  private apiKey: string
  private baseUrl = "https://api.vapi.ai"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createCall(config: {
    phoneNumber?: string
    assistantId?: string
    assistant?: any
    customer?: {
      number?: string
      name?: string
      email?: string
    }
  }): Promise<VAPICall> {
    const response = await fetch(`${this.baseUrl}/call`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      throw new Error(`VAPI API error: ${response.statusText}`)
    }

    return response.json()
  }

  async createWebCall(config: {
    assistant: any
    customer?: {
      name?: string
      email?: string
    }
  }): Promise<{ webCallUrl: string; callId: string }> {
    const response = await fetch(`${this.baseUrl}/call/web`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(config),
    })

    if (!response.ok) {
      throw new Error(`VAPI API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getCall(callId: string): Promise<VAPICall> {
    const response = await fetch(`${this.baseUrl}/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`VAPI API error: ${response.statusText}`)
    }

    return response.json()
  }

  async endCall(callId: string): Promise<void> {
    await fetch(`${this.baseUrl}/call/${callId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })
  }

  createAssistant(formData: any, currentSection: string, currentQuestion: number) {
    return {
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 500,
      },
      voice: {
        provider: "eleven-labs",
        voiceId: "rachel", // You can customize this
        stability: 0.5,
        similarityBoost: 0.8,
        style: 0.2,
      },
      firstMessage: this.getFirstMessage(currentSection, currentQuestion),
      systemMessage: this.getSystemMessage(formData, currentSection, currentQuestion),
      functions: [
        {
          name: "capture_response",
          description: "Capture and validate user responses to Ikigai assessment questions",
          parameters: {
            type: "object",
            properties: {
              questionId: {
                type: "string",
                description: "The ID of the current question being answered",
              },
              response: {
                type: "string",
                description: "The user's response to the question",
              },
              isComplete: {
                type: "boolean",
                description: "Whether the response is complete and ready to move to next question",
              },
              needsClarification: {
                type: "boolean",
                description: "Whether the response needs clarification",
              },
            },
            required: ["questionId", "response", "isComplete"],
          },
        },
        {
          name: "navigate_conversation",
          description: "Navigate to different parts of the assessment",
          parameters: {
            type: "object",
            properties: {
              action: {
                type: "string",
                enum: ["next_question", "previous_question", "repeat_question", "jump_to_section"],
                description: "The navigation action to take",
              },
              sectionId: {
                type: "string",
                description: "Section ID when jumping to a specific section",
              },
            },
            required: ["action"],
          },
        },
      ],
    }
  }

  private getFirstMessage(currentSection: string, currentQuestion: number): string {
    if (currentSection === "welcome" && currentQuestion === 0) {
      return "Hi there! I'm excited to help you discover your Ikigai - your reason for being. I see you've already provided your email, so let's dive right in. What's your first name? I'd love to know what to call you during our conversation."
    }

    return "Welcome back! Let's continue with your Ikigai assessment. I'll pick up right where we left off."
  }

  private getSystemMessage(formData: any, currentSection: string, currentQuestion: number): string {
    return `You are an empathetic Ikigai coach conducting a voice-based assessment to help users discover their life purpose. 

CURRENT CONTEXT:
- Section: ${currentSection}
- Question: ${currentQuestion}
- User's name: ${formData.firstName || "Not provided yet"}
- Email: ${formData.email}

CONVERSATION GUIDELINES:
1. Be warm, encouraging, and genuinely interested in their responses
2. Ask one question at a time and wait for complete answers
3. Use their name when you know it to personalize the conversation
4. If responses are unclear, ask gentle follow-up questions
5. Acknowledge their answers before moving to the next question
6. Keep questions conversational and natural, not robotic
7. Use the capture_response function after each meaningful answer
8. Guide them through the assessment structure naturally

ASSESSMENT STRUCTURE:
- Welcome & Basic Info (name, primary reason)
- Interests & Activities (what they love)
- Skills & Abilities (what they're good at)
- Career & Goals (what they can be paid for)
- Impact & Causes (what the world needs)

Remember: This is a meaningful conversation about their life purpose, not just data collection. Make it feel personal and insightful.`
  }
}
