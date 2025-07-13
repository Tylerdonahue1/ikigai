// VAPI API Response Types
export interface VAPICallResponse {
  id: string
  type: "webCall" | "inboundPhoneCall" | "outboundPhoneCall"
  status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended"
  startedAt?: string
  endedAt?: string
  cost?: number
  costBreakdown?: {
    transport: number
    stt: number
    llm: number
    tts: number
    vapi: number
    total: number
  }
  messages?: Array<{
    role: "user" | "assistant" | "system" | "function"
    message: string
    time: number
    endTime?: number
    secondsFromStart: number
    function?: {
      name: string
      parameters: any
    }
  }>
  recordingUrl?: string
  summary?: string
  transcript?: string
  artifact?: any
  analysis?: {
    summary?: string
    structuredData?: any
    [key: string]: any
  }
  stereoRecordingUrl?: string
  monoRecordingUrl?: string
  assistantId: string
  customer?: {
    number?: string
    name?: string
    email?: string
  }
  metadata?: Record<string, any>
  endedReason?: string
}

// Extracted and processed call data
export interface ExtractedCallData {
  id: string
  status: string
  endedReason?: string
  duration: number // in seconds
  cost?: number
  transcript: string
  summary?: string
  structuredData?: any
  extractedAt: string
  processingStatus: "extracted" | "processed" | "completed"
  warnings?: string[]
}

// Storage format for Upstash
export interface StoredCallData {
  customerId: string
  callId: string
  extractedData: ExtractedCallData
  storedAt: string
  lastUpdated: string
  version: number
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface GetCallResponse extends APIResponse {
  data?: {
    uniqueId: string
    callData: ExtractedCallData
  }
}

export interface CustomerCallsResponse extends APIResponse {
  data?: {
    calls: Array<{
      callId: string
      storedAt: string
      status: string
      duration: number
    }>
    total: number
  }
}
