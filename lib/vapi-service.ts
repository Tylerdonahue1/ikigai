const VAPI_BASE_URL = "https://api.vapi.ai"

export class VAPIService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${VAPI_BASE_URL}${endpoint}`

    console.log(`Making VAPI request to: ${url}`)

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      console.log(`Response status: ${response.status}`)

      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text()
      console.log(`Response text (first 200 chars):`, responseText.substring(0, 200))

      if (!response.ok) {
        // Try to parse as JSON for structured error, fallback to text
        let errorMessage = responseText
        try {
          const errorJson = JSON.parse(responseText)
          errorMessage = errorJson.message || errorJson.error || responseText
        } catch {
          // Keep the original text if it's not JSON
        }

        throw new Error(`VAPI API Error (${response.status}): ${errorMessage}`)
      }

      // Try to parse as JSON
      try {
        return JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        throw new Error(`Invalid JSON response from VAPI: ${responseText.substring(0, 200)}...`)
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(`Network error connecting to VAPI: ${error.message}`)
      }
      throw error
    }
  }

  async testConnection() {
    try {
      console.log("Testing VAPI connection...")

      // Test with the specific assistant ID
      const assistantId = "5542140a-b071-4455-8d43-6a0eb424dbc4"
      const result = await this.makeRequest(`/assistant/${assistantId}`)

      return {
        success: true,
        data: result,
        message: "Connection successful - assistant found",
      }
    } catch (error) {
      console.error("VAPI connection test failed:", error)

      const isAuthError = error.message.includes("401") || error.message.includes("Unauthorized")
      const isNotFoundError = error.message.includes("404") || error.message.includes("Not Found")

      return {
        success: false,
        error: error.message,
        isAuthError,
        isNotFoundError,
        suggestion: isAuthError
          ? "Check your VAPI API key - it may be invalid or expired"
          : isNotFoundError
            ? "Assistant ID not found - check if the assistant exists in your VAPI dashboard"
            : "Check VAPI service status and API documentation",
      }
    }
  }

  async createWebCall(assistantId: string, customer?: any, metadata?: Record<string, any>) {
    console.log("Creating web call for assistant:", assistantId)

    const callConfig = {
      assistantId,
      ...(customer && { customer }),
      ...(metadata && { metadata }),
    }

    console.log("Web call config:", JSON.stringify(callConfig, null, 2))

    try {
      const result = await this.makeRequest("/call/web", {
        method: "POST",
        body: JSON.stringify(callConfig),
      })

      console.log("Web call created successfully:", result)
      return result
    } catch (error) {
      console.error("Failed to create web call:", error)
      throw error
    }
  }

  async getCall(callId: string) {
    try {
      const result = await this.makeRequest(`/call/${callId}`)
      return result
    } catch (error) {
      console.error("Failed to get call:", error)
      throw error
    }
  }

  async endCall(callId: string) {
    try {
      const result = await this.makeRequest(`/call/${callId}`, {
        method: "DELETE",
      })
      return result
    } catch (error) {
      console.error("Failed to end call:", error)
      throw error
    }
  }

  async createChat(assistantId: string, input: string, sessionId?: string, previousChatId?: string) {
    console.log("Creating VAPI chat for assistant:", assistantId)

    const chatConfig = {
      assistantId,
      input,
      stream: false,
      ...(sessionId && { sessionId }),
      ...(previousChatId && { previousChatId }),
    }

    console.log("Chat config:", JSON.stringify(chatConfig, null, 2))

    try {
      const result = await this.makeRequest("/chat", {
        method: "POST",
        body: JSON.stringify(chatConfig),
      })

      console.log("Chat created successfully:", result)
      return result
    } catch (error) {
      console.error("Failed to create chat:", error)
      throw error
    }
  }

  async getChat(chatId: string) {
    try {
      const result = await this.makeRequest(`/chat/${chatId}`)
      return result
    } catch (error) {
      console.error("Failed to get chat:", error)
      throw error
    }
  }

  async listChats(sessionId?: string) {
    try {
      const endpoint = sessionId ? `/chat?sessionId=${sessionId}` : "/chat"
      const result = await this.makeRequest(endpoint)
      return result
    } catch (error) {
      console.error("Failed to list chats:", error)
      throw error
    }
  }
}

export function createVAPIService(): VAPIService {
  const apiKey = process.env.VAPI_API_KEY

  if (!apiKey) {
    throw new Error("VAPI_API_KEY environment variable is required")
  }

  return new VAPIService(apiKey)
}
