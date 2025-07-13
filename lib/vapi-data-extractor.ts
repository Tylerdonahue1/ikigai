import type { VAPICallResponse, ExtractedCallData } from "@/types/vapi-response"

export class VAPIDataExtractor {
  /**
   * Extract structured data from VAPI call response
   */
  static extractCallData(response: VAPICallResponse): ExtractedCallData {
    const warnings: string[] = []

    // Calculate duration
    const duration = this.calculateDuration(response.startedAt, response.endedAt)

    // Extract structured data with fallbacks
    const structuredData = this.extractStructuredData(response, warnings)

    // Extract summary with fallbacks
    const summary = this.extractSummary(response, warnings)

    // Extract transcript
    const transcript = this.extractTranscript(response, warnings)

    return {
      id: response.id,
      status: response.status,
      endedReason: response.endedReason,
      duration,
      cost: response.cost,
      transcript,
      summary,
      structuredData,
      extractedAt: new Date().toISOString(),
      processingStatus: "extracted",
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Calculate call duration in seconds
   */
  private static calculateDuration(startedAt?: string, endedAt?: string): number {
    if (!startedAt || !endedAt) {
      return 0
    }

    try {
      const start = new Date(startedAt).getTime()
      const end = new Date(endedAt).getTime()
      return Math.round((end - start) / 1000)
    } catch (error) {
      console.warn("Failed to calculate duration:", error)
      return 0
    }
  }

  /**
   * Extract structured data with multiple fallback locations
   */
  private static extractStructuredData(response: VAPICallResponse, warnings: string[]): any {
    // Priority 1: analysis.structuredData
    if (response.analysis?.structuredData) {
      console.log("✅ Found structured data in analysis.structuredData")
      return response.analysis.structuredData
    }

    // Priority 2: artifact field
    if (response.artifact) {
      console.log("✅ Found structured data in artifact field")
      warnings.push("Structured data found in artifact field instead of analysis.structuredData")
      return response.artifact
    }

    // Priority 3: Extract from function call messages
    if (response.messages) {
      const functionCalls = response.messages.filter((msg) => msg.role === "function" || msg.function)

      if (functionCalls.length > 0) {
        console.log("✅ Found structured data in function calls")
        warnings.push("Structured data extracted from function call messages")
        return this.extractFromFunctionCalls(functionCalls)
      }
    }

    // Priority 4: Try to parse from transcript
    if (response.transcript) {
      const parsedData = this.tryParseFromTranscript(response.transcript)
      if (parsedData) {
        console.log("✅ Found structured data parsed from transcript")
        warnings.push("Structured data parsed from transcript - may be less reliable")
        return parsedData
      }
    }

    warnings.push("No structured data found in any expected location")
    return null
  }

  /**
   * Extract summary with fallbacks
   */
  private static extractSummary(response: VAPICallResponse, warnings: string[]): string | undefined {
    // Priority 1: analysis.summary
    if (response.analysis?.summary) {
      return response.analysis.summary
    }

    // Priority 2: summary field
    if (response.summary) {
      warnings.push("Summary found in root field instead of analysis.summary")
      return response.summary
    }

    warnings.push("No summary found")
    return undefined
  }

  /**
   * Extract transcript
   */
  private static extractTranscript(response: VAPICallResponse, warnings: string[]): string {
    if (response.transcript) {
      return response.transcript
    }

    // Fallback: construct from messages
    if (response.messages) {
      const transcript = response.messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => `${msg.role}: ${msg.message}`)
        .join("\n")

      if (transcript) {
        warnings.push("Transcript constructed from messages")
        return transcript
      }
    }

    warnings.push("No transcript available")
    return ""
  }

  /**
   * Extract structured data from function call messages
   */
  private static extractFromFunctionCalls(functionCalls: any[]): any {
    const structuredData: any = {
      responses: [],
      extractedFrom: "function_calls",
    }

    for (const call of functionCalls) {
      if (call.function?.name === "capture_survey_response") {
        structuredData.responses.push(call.function.parameters)
      }
    }

    return structuredData
  }

  /**
   * Try to parse structured data from transcript
   */
  private static tryParseFromTranscript(transcript: string): any | null {
    // This is a basic implementation - you might want to enhance this
    // based on your specific transcript format
    try {
      // Look for JSON-like structures in the transcript
      const jsonMatch = transcript.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      // Ignore parsing errors
    }

    return null
  }

  /**
   * Validate if call data is ready for processing
   */
  static validateCallForProcessing(response: VAPICallResponse): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check if call is ended
    if (response.status !== "ended") {
      errors.push(`Call status is '${response.status}', expected 'ended'`)
    }

    // Check for problematic end reasons
    const problematicReasons = ["error", "failed", "cancelled"]
    if (response.endedReason && problematicReasons.includes(response.endedReason.toLowerCase())) {
      errors.push(`Call ended with reason: ${response.endedReason}`)
    }

    // Check minimum duration (e.g., at least 10 seconds)
    const duration = this.calculateDuration(response.startedAt, response.endedAt)
    if (duration < 10) {
      errors.push(`Call duration too short: ${duration} seconds`)
    }

    // Check for basic data availability
    if (!response.transcript && (!response.messages || response.messages.length === 0)) {
      errors.push("No transcript or messages available")
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
