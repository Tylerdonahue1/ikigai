// VAPI Server-side utilities
// This handles all server-side VAPI operations

export const IKIGAI_ASSISTANT_ID = "5542140a-b071-4455-8d43-6a0eb424dbc4"

export interface VapiCallConfig {
  assistantId: string
  type?: "webCall" | "inboundPhoneCall" | "outboundPhoneCall"
  metadata?: Record<string, any>
  customer?: {
    number?: string
    name?: string
    email?: string
  }
}

export interface VapiAssistant {
  id: string
  name: string
  model: {
    provider: string
    model: string
    temperature?: number
  }
  voice: {
    provider: string
    voiceId: string
  }
  transcriber?: {
    provider: string
    model?: string
    language?: string
  }
}

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
      const errorText = await response.text()
      throw new Error(`VAPI API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async getAssistant(assistantId: string): Promise<VapiAssistant> {
    return this.makeRequest(`/assistant/${assistantId}`)
  }

  async listAssistants(): Promise<VapiAssistant[]> {
    return this.makeRequest("/assistant")
  }

  async createCall(config: VapiCallConfig) {
    return this.makeRequest("/call", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async getCall(callId: string) {
    return this.makeRequest(`/call/${callId}`)
  }

  async listCalls() {
    return this.makeRequest("/call")
  }

  async endCall(callId: string) {
    return this.makeRequest(`/call/${callId}`, {
      method: "DELETE",
    })
  }

  async updateCall(callId: string, updates: Partial<VapiCallConfig>) {
    return this.makeRequest(`/call/${callId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }
}

export class VapiService {
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
      const errorText = await response.text()
      throw new Error(`VAPI API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  async getAssistant(assistantId: string): Promise<VapiAssistant> {
    return this.makeRequest(`/assistant/${assistantId}`)
  }

  async listAssistants(): Promise<VapiAssistant[]> {
    return this.makeRequest("/assistant")
  }

  async createCall(config: VapiCallConfig) {
    return this.makeRequest("/call", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }

  async getCall(callId: string) {
    return this.makeRequest(`/call/${callId}`)
  }

  async listCalls() {
    return this.makeRequest("/call")
  }

  async endCall(callId: string) {
    return this.makeRequest(`/call/${callId}`, {
      method: "DELETE",
    })
  }

  async updateCall(callId: string, updates: Partial<VapiCallConfig>) {
    return this.makeRequest(`/call/${callId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }
}

// Helper function to create a VAPI service instance
export function createVapiService(): VapiService {
  return new VapiService()
}

// Helper function to create a VAPI server instance
export function createVAPIServer(): VAPIServer {
  return new VAPIServer()
}
