export interface ConversationState {
  currentSection: string
  currentQuestion: number
  collectedData: Partial<FormData>
  conversationHistory: Message[]
  userPreferences: {
    interface: "chat" | "voice"
    pace: "fast" | "normal" | "slow"
    detailLevel: "brief" | "detailed"
  }
}

export interface Message {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: Date
  metadata?: {
    questionType?: string
    dataCollected?: any
    suggestions?: string[]
  }
}

export interface ConversationSection {
  id: string
  name: string
  description: string
  questions: ConversationQuestion[]
  introMessage: string
  completionMessage: string
}

export interface ConversationQuestion {
  id: string
  type: "open" | "choice" | "rating" | "multi-select"
  prompt: string
  followUpPrompts?: string[]
  validationRules?: ValidationRule[]
  suggestions?: string[]
  maxSelections?: number
}

export interface ValidationRule {
  type: "required" | "minLength" | "maxSelections" | "format"
  value?: any
  message: string
}
