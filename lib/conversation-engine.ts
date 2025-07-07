import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import type { ConversationState, ConversationSection, ConversationQuestion } from "./types" // Assuming types are declared in a separate file

export class ConversationEngine {
  private state: ConversationState
  private sections: ConversationSection[]

  constructor(initialState: ConversationState) {
    this.state = initialState
    this.sections = this.initializeSections()
  }

  async processUserInput(input: string): Promise<{
    response: string
    suggestions?: string[]
    isComplete: boolean
    nextAction?: string
  }> {
    // Update conversation history
    this.addMessage("user", input)

    // Extract and validate data from user input
    const extractedData = await this.extractDataFromInput(input)

    // Update collected data
    this.updateCollectedData(extractedData)

    // Generate contextual response
    const response = await this.generateResponse(input, extractedData)

    // Determine next steps
    const nextAction = this.determineNextAction()

    this.addMessage("assistant", response.content)

    return {
      response: response.content,
      suggestions: response.suggestions,
      isComplete: this.isAssessmentComplete(),
      nextAction,
    }
  }

  private async extractDataFromInput(input: string): Promise<any> {
    const currentQuestion = this.getCurrentQuestion()

    const prompt = `
    Extract structured data from this user response for an Ikigai assessment.
    
    Current Question Context: ${currentQuestion?.prompt}
    Question Type: ${currentQuestion?.type}
    User Response: "${input}"
    
    Return a JSON object with the extracted data that matches the question type.
    For choice questions, return the selected option(s).
    For rating questions, return the numeric rating.
    For open questions, return the cleaned text response.
    
    Response format:
    {
      "extractedValue": "the main value",
      "confidence": 0.95,
      "needsClarification": false,
      "clarificationQuestion": "optional follow-up question"
    }
    `

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt,
      maxTokens: 300,
    })

    try {
      return JSON.parse(text)
    } catch {
      return { extractedValue: input, confidence: 0.5, needsClarification: true }
    }
  }

  private async generateResponse(
    userInput: string,
    extractedData: any,
  ): Promise<{
    content: string
    suggestions?: string[]
  }> {
    const currentSection = this.getCurrentSection()
    const currentQuestion = this.getCurrentQuestion()
    const progress = this.getProgress()

    const prompt = `
    You are an empathetic Ikigai coach conducting a conversational assessment. 
    
    Context:
    - Current section: ${currentSection?.name}
    - Current question: ${currentQuestion?.prompt}
    - User's response: "${userInput}"
    - Extracted data: ${JSON.stringify(extractedData)}
    - Progress: ${progress.completed}/${progress.total} questions
    
    Conversation history (last 3 messages):
    ${this.getRecentHistory()}
    
    Generate a natural, encouraging response that:
    1. Acknowledges their input warmly
    2. Asks the next logical question or provides transition
    3. Maintains conversational flow
    4. Shows progress when appropriate
    
    Keep responses concise but personal. Use their name when available.
    
    Return JSON:
    {
      "content": "your response",
      "suggestions": ["optional", "quick", "reply", "options"]
    }
    `

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt,
      maxTokens: 400,
    })

    try {
      return JSON.parse(text)
    } catch {
      return { content: text }
    }
  }

  private initializeSections(): ConversationSection[] {
    return [
      {
        id: "welcome",
        name: "Getting to Know You",
        description: "Basic information and motivation",
        introMessage:
          "Hi there! I'm excited to help you discover your Ikigai - your reason for being. Let's start with getting to know you better.",
        completionMessage: "Great! Now I have a good sense of who you are and why you're here.",
        questions: [
          {
            id: "firstName",
            type: "open",
            prompt: "What's your first name? I'd love to know what to call you!",
            validationRules: [
              { type: "required", message: "I need to know your name to personalize our conversation." },
            ],
          },
          {
            id: "email",
            type: "open",
            prompt: "What's your email address? I'll use this to send you your personalized Ikigai report.",
            validationRules: [
              { type: "required", message: "I need your email to send your report." },
              { type: "format", value: "email", message: "Please provide a valid email address." },
            ],
          },
          {
            id: "primaryReason",
            type: "choice",
            prompt: "What brings you to explore your Ikigai today?",
            suggestions: [
              "I'm trying to figure out what to do with my life",
              "I want to make a career pivot",
              "I'm looking to turn my passion into income",
              "I'm happy in my career but want more meaning",
              "I just want to understand myself better",
            ],
          },
        ],
      },
      {
        id: "interests",
        name: "What You Love",
        description: "Exploring passions and interests",
        introMessage: "Now let's dive into what makes you come alive - your interests and passions!",
        completionMessage: "I'm getting a clear picture of what energizes and excites you!",
        questions: [
          {
            id: "activities",
            type: "multi-select",
            prompt:
              "Tell me about activities that really resonate with you. What do you find yourself drawn to? You can mention up to 5 things that excite you most.",
            maxSelections: 5,
            suggestions: [
              "Creating music or art",
              "Solving complex problems",
              "Building with technology",
              "Helping others grow",
              "Exploring nature",
              "Starting new ventures",
            ],
          },
        ],
      },
      // Additional sections would follow the same pattern...
    ]
  }

  // Helper methods
  private addMessage(role: "user" | "assistant", content: string) {
    this.state.conversationHistory.push({
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    })
  }

  private getCurrentSection(): ConversationSection | undefined {
    return this.sections.find((s) => s.id === this.state.currentSection)
  }

  private getCurrentQuestion(): ConversationQuestion | undefined {
    const section = this.getCurrentSection()
    return section?.questions[this.state.currentQuestion]
  }

  private getProgress() {
    const totalQuestions = this.sections.reduce((sum, section) => sum + section.questions.length, 0)
    const completedQuestions = this.calculateCompletedQuestions()
    return { completed: completedQuestions, total: totalQuestions }
  }

  private calculateCompletedQuestions(): number {
    // Logic to count completed questions based on collected data
    return Object.keys(this.state.collectedData).length
  }

  private getRecentHistory(): string {
    return this.state.conversationHistory
      .slice(-6)
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n")
  }

  private updateCollectedData(extractedData: any) {
    const currentQuestion = this.getCurrentQuestion()
    if (currentQuestion && extractedData.extractedValue) {
      this.state.collectedData[currentQuestion.id] = extractedData.extractedValue
    }
  }

  private determineNextAction(): string {
    // Logic to determine if we should move to next question, section, or complete
    const currentSection = this.getCurrentSection()
    const currentQuestionIndex = this.state.currentQuestion

    if (!currentSection) return "complete"

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      return "nextQuestion"
    } else {
      return "nextSection"
    }
  }

  private isAssessmentComplete(): boolean {
    return this.state.currentSection === "complete"
  }
}
