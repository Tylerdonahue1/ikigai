import { VAPIAssistantBuilder } from "./vapi-assistant-config"

export interface VAPICallConfig {
  phoneNumber?: string
  assistantId?: string
  customer?: {
    number?: string
    name?: string
    email?: string
  }
  metadata?: Record<string, any>
}

export interface VAPIWebCallConfig {
  assistant?: any
  assistantId?: string
  customer?: {
    name?: string
    email?: string
  }
  metadata?: Record<string, any>
}

export class VAPIService {
  private apiKey: string
  private baseUrl = "https://api.vapi.ai"
  private assistantId?: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createAssistant(): Promise<string> {
    const assistantConfig = VAPIAssistantBuilder.createIkigaiAssistant()

    const response = await fetch(`${this.baseUrl}/assistant`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assistantConfig),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create assistant: ${error}`)
    }

    const assistant = await response.json()
    this.assistantId = assistant.id
    return assistant.id
  }

  async updateAssistant(assistantId: string, updates: Partial<any>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/assistant/${assistantId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to update assistant: ${error}`)
    }
  }

  async createWebCall(config: VAPIWebCallConfig): Promise<{ webCallUrl: string; callId: string }> {
    const callConfig = {
      type: "webCall",
      assistantId: config.assistantId || this.assistantId,
      assistant: config.assistant,
      customer: config.customer,
      metadata: {
        ...config.metadata,
        source: "ikigai-survey",
        timestamp: new Date().toISOString(),
      },
    }

    const response = await fetch(`${this.baseUrl}/call/web`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callConfig),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create web call: ${error}`)
    }

    const result = await response.json()
    return {
      webCallUrl: result.webCallUrl,
      callId: result.id,
    }
  }

  async createPhoneCall(config: VAPICallConfig): Promise<{ callId: string }> {
    const callConfig = {
      type: "outboundPhoneCall",
      phoneNumber: config.phoneNumber,
      assistantId: config.assistantId || this.assistantId,
      customer: config.customer,
      metadata: {
        ...config.metadata,
        source: "ikigai-survey",
        timestamp: new Date().toISOString(),
      },
    }

    const response = await fetch(`${this.baseUrl}/call`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callConfig),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create phone call: ${error}`)
    }

    const result = await response.json()
    return { callId: result.id }
  }

  async getCall(callId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to get call: ${error}`)
    }

    return response.json()
  }

  async endCall(callId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/call/${callId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to end call: ${error}`)
    }
  }

  async listAssistants(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/assistant`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to list assistants: ${error}`)
    }

    return response.json()
  }

  async deleteAssistant(assistantId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/assistant/${assistantId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete assistant: ${error}`)
    }
  }

  async getSurveyProgress(callId: string): Promise<any> {
    try {
      const call = await this.getCall(callId)

      // Extract survey progress from function calls
      const functionCalls = call.functionCalls || []
      const surveyResponses = functionCalls.filter((fc: any) => fc.name === "capture_survey_response")

      const progress = {
        totalSections: 14,
        completedSections: new Set(surveyResponses.map((sr: any) => sr.parameters.section)).size,
        responses: surveyResponses,
        currentSection:
          surveyResponses.length > 0 ? surveyResponses[surveyResponses.length - 1].parameters.section : "personal_info",
      }

      return progress
    } catch (error) {
      console.error("Error getting survey progress:", error)
      return { totalSections: 14, completedSections: 0, responses: [], currentSection: "personal_info" }
    }
  }
}
