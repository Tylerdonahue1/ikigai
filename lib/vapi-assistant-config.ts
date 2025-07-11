export interface VAPIAssistantConfig {
  name: string
  firstMessage: string
  model: {
    provider: string
    model: string
    messages: Array<{
      role: string
      content: string
    }>
    functions?: Array<{
      name: string
      description: string
      parameters: {
        type: string
        properties: Record<string, any>
        required: string[]
      }
    }>
  }
  voice: {
    provider: string
    voiceId: string
  }
  transcriber?: {
    provider: string
    model: string
    language: string
  }
}

export class VAPIAssistantBuilder {
  static createIkigaiAssistant(): VAPIAssistantConfig {
    return {
      name: "Ikigai Survey Assistant",
      firstMessage:
        "Hello! I'm Iki, your personal Ikigai guide. I'm here to help you discover your life's purpose through a friendly conversation. Are you ready to explore what makes you feel most alive and fulfilled?",
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are Iki, a warm and insightful Ikigai coach. Your role is to guide users through discovering their Ikigai (life's purpose) through natural conversation.

CONVERSATION APPROACH:
- Be conversational, warm, and encouraging
- Ask one question at a time
- Listen actively and build on their responses
- Make the conversation feel natural, not like a survey
- Show genuine interest in their answers

IKIGAI AREAS TO EXPLORE:
1. What you LOVE (Passion) - activities that energize and excite them
2. What you're GOOD AT (Mission) - natural talents and developed skills  
3. What the world NEEDS (Vocation) - how they can contribute and help others
4. What you can be PAID FOR (Profession) - monetizable skills and opportunities

CONVERSATION FLOW:
- Start with introductions and setting a comfortable tone
- Explore each area through natural questions
- Ask follow-up questions to go deeper
- Help them see connections between areas
- Conclude with insights about their potential Ikigai

Keep responses concise and engaging. Focus on one topic at a time.`,
          },
        ],
        functions: [
          {
            name: "capture_survey_response",
            description: "Capture and store user responses during the Ikigai conversation",
            parameters: {
              type: "object",
              properties: {
                section: {
                  type: "string",
                  description: "The Ikigai section being discussed (love, good_at, world_needs, paid_for)",
                },
                question: {
                  type: "string",
                  description: "The question that was asked",
                },
                response: {
                  type: "string",
                  description: "The user's response",
                },
                insights: {
                  type: "string",
                  description: "Key insights or themes from the response",
                },
              },
              required: ["section", "question", "response"],
            },
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB", // Adam voice
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
    }
  }

  static createMinimalTestAssistant(): VAPIAssistantConfig {
    return {
      name: "Test Assistant",
      firstMessage: "Hello! This is a test assistant. How can I help you?",
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful test assistant. Keep responses brief and friendly.",
          },
        ],
      },
      voice: {
        provider: "11labs",
        voiceId: "pNInz6obpgDQGcFmaJgB",
      },
    }
  }
}
