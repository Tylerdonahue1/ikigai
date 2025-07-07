export class VAPIServer {
  private apiKey: string
  private baseUrl = "https://api.vapi.ai"

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || ""
    if (!this.apiKey) {
      throw new Error("VAPI_API_KEY environment variable is required")
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`VAPI API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async createAssistant(config: any) {
    return this.makeRequest("/assistant", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async getAssistant(assistantId: string) {
    return this.makeRequest(`/assistant/${assistantId}`)
  }

  async createWebCall(config: any) {
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

  async listCalls(limit = 100) {
    return this.makeRequest(`/call?limit=${limit}`)
  }

  async testConnection() {
    try {
      await this.makeRequest("/assistant?limit=1")
      return { connected: true }
    } catch (error) {
      return { connected: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }
}
