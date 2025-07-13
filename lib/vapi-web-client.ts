"use client"

// Your pre-created assistant ID
export const IKIGAI_ASSISTANT_ID = "5542140a-b071-4455-8d43-6a0eb424dbc4"

export interface VAPIWebClient {
  initialize(): Promise<void>
  startCall(config?: any): Promise<void>
  endCall(): Promise<void>
  setMuted(muted: boolean): void
  isMuted(): boolean
  on(event: string, callback: (data?: any) => void): void
  off(event: string, callback?: (data?: any) => void): void
}

class VAPIWebClientImpl implements VAPIWebClient {
  private vapi: any = null
  private isInitialized = false
  private publicKey: string

  constructor(publicKey: string) {
    this.publicKey = publicKey
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Dynamic import for client-side only
      const { default: Vapi } = await import("@vapi-ai/web")

      console.log("Initializing VAPI Web SDK with public key:", this.publicKey.substring(0, 10) + "...")

      this.vapi = new Vapi(this.publicKey)
      this.isInitialized = true

      console.log("✅ VAPI Web SDK initialized successfully")
    } catch (error: any) {
      console.error("❌ Failed to initialize VAPI Web SDK:", error)
      throw new Error(`Failed to initialize VAPI: ${error.message}`)
    }
  }

  async startCall(config?: any): Promise<void> {
    if (!this.vapi) {
      throw new Error("VAPI not initialized. Call initialize() first.")
    }

    try {
      console.log("🚀 Starting call with assistant:", IKIGAI_ASSISTANT_ID)

      // For VAPI Web SDK, we pass the assistant ID directly to the start method
      await this.vapi.start(IKIGAI_ASSISTANT_ID, config)
    } catch (error) {
      console.error("❌ Failed to start call:", error)
      throw error
    }
  }

  async endCall(): Promise<void> {
    if (!this.vapi) return

    try {
      console.log("🛑 Ending call")
      await this.vapi.stop()
    } catch (error) {
      console.error("❌ Failed to end call:", error)
      throw error
    }
  }

  setMuted(muted: boolean): void {
    if (!this.vapi) return

    try {
      this.vapi.setMuted(muted)
      console.log(`🎤 Microphone ${muted ? "muted" : "unmuted"}`)
    } catch (error) {
      console.error("❌ Failed to set mute state:", error)
    }
  }

  isMuted(): boolean {
    return this.vapi?.isMuted() || false
  }

  on(event: string, callback: (data?: any) => void): void {
    if (!this.vapi) return
    this.vapi.on(event, callback)
  }

  off(event: string, callback?: (data?: any) => void): void {
    if (!this.vapi) return
    this.vapi.off(event, callback)
  }
}

// Singleton instance
let vapiClientInstance: VAPIWebClient | null = null

export function getVAPIWebClient(): VAPIWebClient {
  if (!vapiClientInstance) {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

    if (!publicKey) {
      throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY environment variable is required")
    }

    vapiClientInstance = new VAPIWebClientImpl(publicKey)
  }

  return vapiClientInstance
}

// Alternative function name for compatibility
export function createVapiWebClient(publicKey?: string): VAPIWebClient {
  const key = publicKey || process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

  if (!key) {
    throw new Error("VAPI public key is required")
  }

  return new VAPIWebClientImpl(key)
}

// Export the type for use in other files
export type { VAPIWebClient }
