// VAPI Server-side utilities
// This file contains server-only VAPI operations

export const VAPI_API_KEY = process.env.VAPI_API_KEY
export const IKIGAI_ASSISTANT_ID = "5542140a-b071-4455-8d43-6a0eb424dbc4"

if (!VAPI_API_KEY) {
  console.warn("VAPI_API_KEY environment variable is not set")
}

export class VAPIServerClient {
  private apiKey: string
  private baseUrl = "https://api.vapi.ai"

  constructor(apiKey: string) {
    this.apiKey = apiKey
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
      const errorText = await response.text()
      throw new Error(`VAPI API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async getAssistant(assistantId: string) {
    return this.makeRequest(`/assistant/${assistantId}`)
  }

  async createCall(assistantId: string, options: any = {}) {
    return this.makeRequest("/call", {
      method: "POST",
      body: JSON.stringify({
        assistantId,
        ...options,
      }),
    })
  }

  async getCall(callId: string) {
    return this.makeRequest(`/call/${callId}`)
  }

  async endCall(callId: string) {
    return this.makeRequest(`/call/${callId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "ended",
      }),
    })
  }

  async createWebCall(assistantId: string, metadata: any = {}) {
    return this.makeRequest("/call/web", {
      method: "POST",
      body: JSON.stringify({
        assistantId,
        metadata,
      }),
    })
  }
}

// Singleton instance for server-side operations
let vapiServerClient: VAPIServerClient | null = null

export function getVAPIServerClient(): VAPIServerClient {
  if (!vapiServerClient && VAPI_API_KEY) {
    vapiServerClient = new VAPIServerClient(VAPI_API_KEY)
  }

  if (!vapiServerClient) {
    throw new Error("VAPI_API_KEY is required for server operations")
  }

  return vapiServerClient
}
