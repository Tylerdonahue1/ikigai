import { Redis } from "@upstash/redis"
import type { StoredCallData, ExtractedCallData } from "../types/vapi-response"

// Initialize Upstash Redis client
export class UpstashStorage {
  private redis: Redis

  constructor() {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })

    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error("Upstash environment variables are required")
    }
  }

  /**
   * Generate a unique ID for the customer's call data
   */
  generateUniqueId(customerId: string, callId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `${customerId}-${callId}-${timestamp}-${random}`
  }

  /**
   * Store call data with customer association
   */
  async storeCallData(
    customerId: string,
    callId: string,
    extractedData: ExtractedCallData,
  ): Promise<{ uniqueId: string; success: boolean }> {
    try {
      const uniqueId = this.generateUniqueId(customerId, callId)
      const timestamp = new Date().toISOString()

      const storedData: StoredCallData = {
        customerId,
        callId,
        extractedData,
        storedAt: timestamp,
        lastUpdated: timestamp,
        version: 1,
      }

      // Primary storage with unique ID
      const primaryKey = `ikigai:${uniqueId}`
      await this.redis.set(primaryKey, storedData, { ex: 2592000 }) // 30 days TTL

      // Customer association
      const customerCallKey = `customer:${customerId}:call:${callId}`
      await this.redis.set(
        customerCallKey,
        {
          uniqueId,
          callId,
          customerId,
          storedAt: timestamp,
        },
        { ex: 2592000 },
      )

      // Add to customer's call list
      const customerCallsListKey = `customer:${customerId}:calls`
      await this.redis.sadd(customerCallsListKey, callId)

      // Add to processing queue if needed
      if (extractedData.structuredData) {
        await this.redis.sadd("processing_queue", uniqueId)
      }

      // Create indexes for retrieval
      await this.createIndexes(uniqueId, customerId, callId, extractedData)

      console.log(`✅ Successfully stored call data with unique ID: ${uniqueId}`)
      return { uniqueId, success: true }
    } catch (error) {
      console.error("❌ Failed to store call data:", error)
      throw new Error(`Storage failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Retrieve call data by unique ID
   */
  async getCallData(uniqueId: string): Promise<StoredCallData | null> {
    try {
      const key = `ikigai:${uniqueId}`
      const data = await this.redis.get(key)

      if (!data) {
        console.log(`⚠️ No data found for unique ID: ${uniqueId}`)
        return null
      }

      console.log(`✅ Retrieved call data for unique ID: ${uniqueId}`)
      return data as StoredCallData
    } catch (error) {
      console.error("❌ Failed to retrieve call data:", error)
      throw new Error(`Retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Retrieve call data by customer ID and call ID
   */
  async getCallDataByCustomerAndCall(customerId: string, callId: string): Promise<StoredCallData | null> {
    try {
      const customerCallKey = `customer:${customerId}:call:${callId}`
      const linkData = await this.redis.get(customerCallKey)

      if (!linkData || typeof linkData !== "object" || !("uniqueId" in linkData)) {
        console.log(`⚠️ No link found for customer ${customerId} and call ${callId}`)
        return null
      }

      const uniqueId = (linkData as any).uniqueId
      return this.getCallData(uniqueId)
    } catch (error) {
      console.error("❌ Failed to retrieve call data by customer and call:", error)
      throw new Error(`Retrieval failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * List all calls for a customer
   */
  async getCustomerCalls(customerId: string): Promise<
    Array<{
      callId: string
      storedAt: string
      status: string
      duration: number
    }>
  > {
    try {
      const customerCallsListKey = `customer:${customerId}:calls`
      const callIds = await this.redis.smembers(customerCallsListKey)

      if (!callIds || callIds.length === 0) {
        return []
      }

      const calls = []
      for (const callId of callIds) {
        const callData = await this.getCallDataByCustomerAndCall(customerId, callId)
        if (callData) {
          calls.push({
            callId,
            storedAt: callData.storedAt,
            status: callData.extractedData.status,
            duration: callData.extractedData.duration,
          })
        }
      }

      return calls.sort((a, b) => new Date(b.storedAt).getTime() - new Date(a.storedAt).getTime())
    } catch (error) {
      console.error("❌ Failed to get customer calls:", error)
      throw new Error(`Failed to get customer calls: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Update call data processing status
   */
  async updateProcessingStatus(uniqueId: string, status: "extracted" | "processed" | "completed"): Promise<void> {
    try {
      const callData = await this.getCallData(uniqueId)
      if (!callData) {
        throw new Error(`Call data not found for unique ID: ${uniqueId}`)
      }

      callData.extractedData.processingStatus = status
      callData.lastUpdated = new Date().toISOString()
      callData.version += 1

      const key = `ikigai:${uniqueId}`
      await this.redis.set(key, callData, { ex: 2592000 })

      console.log(`✅ Updated processing status to '${status}' for unique ID: ${uniqueId}`)
    } catch (error) {
      console.error("❌ Failed to update processing status:", error)
      throw new Error(`Status update failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Create indexes for efficient retrieval
   */
  private async createIndexes(
    uniqueId: string,
    customerId: string,
    callId: string,
    extractedData: ExtractedCallData,
  ): Promise<void> {
    try {
      // Status index
      await this.redis.sadd(`calls:status:${extractedData.status}`, uniqueId)

      // Date index
      const dateKey = new Date().toISOString().split("T")[0]
      await this.redis.sadd(`calls:date:${dateKey}`, uniqueId)

      // Customer index
      await this.redis.sadd(`calls:customer:${customerId}`, uniqueId)

      // Processing status index
      await this.redis.sadd(`calls:processing:${extractedData.processingStatus}`, uniqueId)
    } catch (error) {
      console.warn("⚠️ Failed to create some indexes:", error)
      // Don't throw here as indexes are not critical for basic functionality
    }
  }

  /**
   * Test connection to Upstash
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.redis.ping()
      console.log("✅ Upstash connection successful")
      return true
    } catch (error) {
      console.error("❌ Upstash connection failed:", error)
      return false
    }
  }
}
