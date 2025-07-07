import { VAPISetup } from "./vapi-setup"

export class VAPIServer {
  private apiKey: string
  private baseUrl = "https://api.vapi.ai"
  private setup: VAPISetup

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || ""
    if (!this.apiKey) {
      throw new Error("VAPI_API_KEY environment variable is required")
    }
    this.setup = new VAPISetup(this.apiKey)
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`

    console.log(`Making VAPI request to: ${url}`)
    console.log(`Using API key: ${this.apiKey.substring(0, 10)}...`)

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`VAPI API error: ${response.status} - ${errorText}`)

      // Parse error response if it's JSON
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      // Check for specific authentication errors
      if (response.status === 401) {
        if (errorData.message?.includes("private key instead of the public key")) {
          throw new Error(
            "Authentication Error: You're using a private key instead of a public key. Please check your VAPI_API_KEY configuration.",
          )
        } else if (errorData.message?.includes("public key instead of the private key")) {
          throw new Error(
            "Authentication Error: You're using a public key instead of a private key. Please check your VAPI_API_KEY configuration.",
          )
        } else {
          throw new Error(
            `Authentication Error: Invalid API key. Please verify your VAPI_API_KEY is correct and active. Details: ${errorData.message}`,
          )
        }
      }

      throw new Error(`VAPI API error: ${response.status} - ${errorData.message || errorText}`)
    }

    return response.json()
  }

  async testConnection() {
    try {
      console.log("Testing VAPI connection...")
      console.log(`API Key format: ${this.apiKey.length} characters, starts with: ${this.apiKey.substring(0, 4)}`)

      // Test with a simple GET request to assistants endpoint
      const result = await this.makeRequest("/assistant?limit=1")
      console.log("VAPI connection test successful")
      return { connected: true, data: result }
    } catch (error) {
      console.error("VAPI connection test failed:", error)
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        isAuthError: error instanceof Error && error.message.includes("Authentication Error"),
      }
    }
  }

  async createIkigaiAssistant() {
    try {
      console.log("Creating Ikigai assistant using VAPISetup...")
      return await this.setup.setupIkigaiAssistant()
    } catch (error) {
      console.error("Failed to create Ikigai assistant:", error)
      throw error
    }
  }

  async listAssistants() {
    try {
      return await this.makeRequest("/assistant")
    } catch (error) {
      console.error("Failed to list assistants:", error)
      throw error
    }
  }

  async getAssistant(assistantId: string) {
    return this.makeRequest(`/assistant/${assistantId}`)
  }

  async createWebCall(config: any) {
    console.log("Creating web call with config:", JSON.stringify(config, null, 2))
    return this.makeRequest("/call/web", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async getCall(callId: string) {
    return this.makeRequest(`/call/${callId}`)
  }

  async endCall(callId: string) {
    return this.makeRequest(`/call/${callId}`, {
      method: "DELETE",
    })
  }

  async getSurveyProgress(callId: string) {
    try {
      const call = await this.getCall(callId)

      // Extract progress from function calls
      const functionCalls = call.functionCalls || []
      const responses = functionCalls.filter((fc: any) => fc.name === "capture_survey_response")

      // Determine current section based on latest response
      const latestResponse = responses[responses.length - 1]
      const currentSection = latestResponse?.parameters?.section || "personal_info"

      return {
        currentSection,
        responses,
        completedSections: [...new Set(responses.map((r: any) => r.parameters.section))],
      }
    } catch (error) {
      console.error("Failed to get survey progress:", error)
      return {
        currentSection: "personal_info",
        responses: [],
        completedSections: [],
      }
    }
  }
}
