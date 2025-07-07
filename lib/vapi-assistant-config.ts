export interface VAPIAssistantConfig {
  name: string
  model: {
    provider: string
    model: string
    temperature: number
    maxTokens: number
    systemMessage: string
  }
  voice: {
    provider: string
    voiceId: string
    stability?: number
    similarityBoost?: number
    style?: number
    speed?: number
  }
  firstMessage: string
  functions: VAPIFunction[]
  endCallMessage: string
  recordingEnabled: boolean
  hipaaEnabled: boolean
  clientMessages: string[]
  serverMessages: string[]
  silenceTimeoutSeconds: number
  maxDurationSeconds: number
  backgroundSound?: string
  backchannelingEnabled: boolean
  backgroundDenoisingEnabled: boolean
}

export interface VAPIFunction {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
}

export class VAPIAssistantBuilder {
  static createIkigaiAssistant(): VAPIAssistantConfig {
    return {
      name: "Iki - Ikigai Discovery Assistant",
      model: {
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 500,
        systemMessage: this.getSystemMessage(),
      },
      voice: {
        provider: "eleven-labs",
        voiceId: "rachel", // Warm, professional female voice
        stability: 0.6,
        similarityBoost: 0.8,
        style: 0.3,
        speed: 0.9,
      },
      firstMessage: "Hello I'm Iki, here to help you leverage the Ikigai framework for discovering meaningful work.",
      functions: this.getFunctions(),
      endCallMessage:
        "Thank you for exploring your Ikigai with me today. Your personalized report will be ready shortly. Have a wonderful day!",
      recordingEnabled: true,
      hipaaEnabled: false,
      clientMessages: ["conversation-started", "speech-started", "speech-ended", "function-call", "hang", "transcript"],
      serverMessages: ["conversation-started", "conversation-ended", "function-call", "hang", "speech-update"],
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 2400, // 40 minutes max for comprehensive survey
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true,
    }
  }

  private static getSystemMessage(): string {
    return `You are Iki, an expert Ikigai discovery assistant. Your role is to guide users through a comprehensive survey to help them discover meaningful work by exploring the intersection of what they love, what they're good at, what the world needs, and what they can be paid for.

CONVERSATION PRINCIPLES:
1. Be warm, encouraging, and professional
2. Ask ONE question at a time and wait for complete answers
3. Use their name once you know it to personalize the conversation
4. For rating scale questions (1-5), clearly explain the scale
5. For multiple choice questions, read all options clearly
6. Acknowledge their responses warmly before moving to the next question
7. Keep the conversation natural and flowing
8. Show genuine interest in their responses

SURVEY STRUCTURE (follow this exact order):

1. PERSONAL INFORMATION
   - First Name
   - Last Name  
   - Email

2. CORE MOTIVATION & PURPOSE
   - "What's your primary reason for exploring your Ikigai right now?"

3. ACTIVITIES & INTERESTS
   - "Which activities resonate with you the most? I'll read you some options and you can pick up to 5:"
   Then ask for ratings (1-5 scale) for each selected activity:
   - Organizing or leading community events
   - Expressing yourself creatively (art, storytelling, design)
   - Solving puzzles or designing systems
   - Starting businesses or creating new inventions
   - Supporting others' growth and healing
   - Physical challenges, sports, or adventurous activities
   - Being in nature or building sustainable lifestyles
   - Learning deeply and sharing knowledge with others
   - Immersive worlds like gaming, anime, or fandom communities
   - Mindfulness, inner reflection, and spiritual exploration
   - Working with your hands, DIY projects/home improvement
   - "Anything else you want to add about your interests?"

4. PERSONAL STRENGTHS & IDENTITY
   - "Which of these statements do you think others would agree describe you well? Pick up to 4:"
   - I'm a Builder - Enjoys making things with hands or tools
   - I'm a Problem Solver - Loves figuring out how to make things better
   - I'm a Strategist - Sees big picture and organizes toward it
   - I'm a Creator - Expresses self through writing, design, or content
   - I'm a Connector - Persuades, sells, or brings people together
   - I'm a Visionary - Generates bold ideas and builds from scratch
   - I'm a Thinker - Goes deep into research, learning, or teaching
   - I'm a Healer - Helps others grow, feel seen, or improve well-being
   - I'm a Systems Person - Builds, codes, or optimizes backend systems
   - I'm a Performer - Leads from front, teaches, speaks, or entertains
   - I'm a Marketer - Matches right products/services with people who benefit
   - "How else would you describe your skills?"
   - "Any other skills you want to add?"

5. CURRENT WORK SITUATION
   - "What best describes the kind of work you currently do or most recently did?"

6. FUTURE WORK PREFERENCES
   - "What's most important to you in your next chapter? Pick up to 3:"
   - Independent work - Working solo with focus and autonomy
   - Collaborative work - Generating ideas and solving problems with others
   - Creative work - Designing, imagining, storytelling, or making something new
   - Operational work - Managing logistics, systems, or keeping things running smoothly
   - Leadership - Guiding teams, setting direction, or being responsible for outcomes
   - Relational work - Interacting with people, building relationships, or supporting others
   - Hands-on work - Physically building, experimenting, or working with materials/tools
   - Analytical work - Making sense of data, patterns, or solving logical problems
   - Performance work - Presenting, persuading, or being in front of an audience

7. VISION & DREAMS
   - "If everything went right, what would your work life look like in 3 years?"
   - "What burning question or personal dream do you keep coming back to?"

8. CAUSES & VALUES
   - "Which of these causes most resonate with your heart?"
   - Environmental Sustainability & Climate Action
   - Health & Wellness
   - Education & Skill-Building
   - Social Justice & Equity
   - Economic Development & Entrepreneurship
   - Arts, Culture & Creativity
   - Technology & Innovation
   - Animal Welfare & Wildlife Conservation
   - "Any other causes you'd like to support?"

9. DAILY LIFE & ENERGY
   - "Which activities or hobbies make you feel excited, energized, or fulfilled?"
   - "If you had a free afternoon, what would you love to spend your time learning about, exploring, or doing?"
   - "What else makes you lose track of time?"

10. SOCIAL RECOGNITION & SKILLS
    - "What do people usually come to you for help with, or compliment you on?"

11. CORE VALUES
    - "List up to three core values or principles you try to live by"

12. CAREER PRIORITIES
    - "When thinking about your career or a new project, which of these matter most to you right now?"

13. SKILL DEVELOPMENT INTERESTS
    - Ask about interest in: Emotional intelligence, Financial literacy, DIY/Home Improvement, Relationship building, Product design, Sales

14. ADDITIONAL INFORMATION
    - "Anything else you want to add about your goals, career, or the kind of life you want to build?"

IMPORTANT GUIDELINES:
- Use the capture_survey_response function after each meaningful answer
- Use navigate_survey to move between sections
- For rating questions, ensure you get a number from 1-5
- For multiple choice, ensure they understand all options
- Keep responses under 50 words to maintain conversation flow
- Be patient and encouraging throughout the process

Remember: This is a comprehensive survey to discover their Ikigai. Take your time and make it meaningful.`
  }

  private static getFunctions(): VAPIFunction[] {
    return [
      {
        name: "capture_survey_response",
        description: "Capture and store user responses for the Ikigai survey",
        parameters: {
          type: "object",
          properties: {
            section: {
              type: "string",
              enum: [
                "personal_info",
                "core_motivation",
                "activities_interests",
                "strengths_identity",
                "current_work",
                "future_work",
                "vision_dreams",
                "causes_values",
                "daily_energy",
                "social_recognition",
                "core_values",
                "career_priorities",
                "skill_development",
                "additional_info",
              ],
              description: "The current section of the survey",
            },
            questionType: {
              type: "string",
              enum: [
                "firstName",
                "lastName",
                "email",
                "primaryReason",
                "activities",
                "activityRatings",
                "additionalInterests",
                "strengthStatements",
                "skillDescription",
                "additionalSkills",
                "currentWork",
                "futureWorkPreferences",
                "threeYearVision",
                "burningQuestion",
                "causes",
                "additionalCauses",
                "energizingActivities",
                "freeAfternoon",
                "loseTrackTime",
                "socialRecognition",
                "coreValues",
                "careerPriorities",
                "skillDevelopment",
                "additionalInfo",
              ],
              description: "The specific question being answered",
            },
            response: {
              type: "string",
              description: "The user's response to the question",
            },
            extractedData: {
              type: "object",
              description: "Structured data extracted from the response",
              properties: {
                selectedOptions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Selected options from multiple choice questions",
                },
                ratings: {
                  type: "object",
                  description: "Rating values for scale questions (1-5)",
                },
                values: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of values, activities, skills, etc. mentioned",
                },
                details: {
                  type: "string",
                  description: "Additional context or details",
                },
              },
            },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Confidence level in the extracted data (0-1)",
            },
            needsFollowUp: {
              type: "boolean",
              description: "Whether this response needs clarification or follow-up",
            },
          },
          required: ["section", "questionType", "response", "extractedData", "confidence"],
        },
      },
      {
        name: "navigate_survey",
        description: "Navigate through the survey flow",
        parameters: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["next_section", "repeat_question", "clarify_response", "complete_survey"],
              description: "The navigation action to take",
            },
            currentSection: {
              type: "string",
              description: "Current section of the survey",
            },
            nextSection: {
              type: "string",
              description: "Next section to move to",
            },
            reason: {
              type: "string",
              description: "Reason for the navigation action",
            },
          },
          required: ["action"],
        },
      },
      {
        name: "validate_rating_response",
        description: "Validate rating scale responses (1-5)",
        parameters: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "The question being rated",
            },
            response: {
              type: "string",
              description: "User's response",
            },
            extractedRating: {
              type: "number",
              minimum: 1,
              maximum: 5,
              description: "Extracted rating value",
            },
            isValid: {
              type: "boolean",
              description: "Whether the rating is valid",
            },
            needsClarification: {
              type: "boolean",
              description: "Whether clarification is needed",
            },
          },
          required: ["question", "response", "isValid"],
        },
      },
    ]
  }
}
