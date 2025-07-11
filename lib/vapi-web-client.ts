// VAPI Web SDK Client Wrapper - Client-side only
// This uses the official @vapi-ai/web SDK for real-time voice conversations

export interface VAPIWebClient {
  initialize(): Promise<void>
  startCall(config?: any): Promise<void>
  endCall(): Promise<void>
  setMuted(muted: boolean): void
  isMuted(): boolean
  on(event: string, callback: (data?: any) => void): void
  off(event: string, callback?: (data?: any) => void): void
}

// Your pre-created assistant ID - no need to create new ones
export const IKIGAI_ASSISTANT_ID = "5542140a-b071-4455-8d43-6a0eb424dbc4"

class VAPIWebClientImpl implements VAPIWebClient {
  private vapi: any = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Import the VAPI Web SDK dynamically
      const { default: Vapi } = await import("@vapi-ai/web")

      const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
      if (!publicKey) {
        throw new Error("NEXT_PUBLIC_VAPI_PUBLIC_KEY environment variable is required")
      }

      console.log("Initializing VAPI Web SDK with public key:", publicKey.substring(0, 10) + "...")

      this.vapi = new Vapi(publicKey)
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
      // The Web SDK expects just the assistant ID, not wrapped in an object
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
    return this.vapi?.isMuted || false
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
    vapiClientInstance = new VAPIWebClientImpl()
  }
  return vapiClientInstance
}
