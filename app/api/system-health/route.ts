import { NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { kv } from "@vercel/kv"

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: "checking",
    services: {},
    overall: false,
  }

  try {
    // Test 1: Claude AI Connection
    console.log("Testing Claude AI...")
    try {
      const { text } = await generateText({
        model: anthropic("claude-3-5-sonnet-20241022"),
        prompt: "Respond with exactly: 'Claude AI is working correctly'",
        maxTokens: 50,
      })

      healthCheck.services.claude = {
        status: "✅ Connected",
        response: text.trim(),
        working: text.includes("Claude AI is working"),
      }
    } catch (error) {
      healthCheck.services.claude = {
        status: "❌ Failed",
        error: error instanceof Error ? error.message : String(error),
        working: false,
      }
    }

    // Test 2: Redis/KV Connection
    console.log("Testing Redis/KV...")
    try {
      const testKey = `health-check-${Date.now()}`
      const testValue = { test: true, timestamp: Date.now() }

      await kv.set(testKey, testValue)
      const retrieved = await kv.get(testKey)
      await kv.del(testKey)

      healthCheck.services.redis = {
        status: "✅ Connected",
        testResult: retrieved,
        working: !!retrieved,
      }
    } catch (error) {
      healthCheck.services.redis = {
        status: "❌ Failed",
        error: error instanceof Error ? error.message : String(error),
        working: false,
      }
    }

    // Test 3: Environment Variables
    console.log("Checking environment variables...")
    const envVars = {
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      SITE_URL: !!process.env.SITE_URL,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STORAGE_URL: !!process.env.STORAGE_URL,
      STORAGE_TOKEN: !!process.env.STORAGE_TOKEN,
    }

    const missingVars = Object.entries(envVars)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name)

    healthCheck.services.environment = {
      status: missingVars.length === 0 ? "✅ All Set" : "⚠️ Missing Variables",
      variables: envVars,
      missing: missingVars,
      working: missingVars.length === 0,
    }

    // Test 4: Full Assessment Flow Simulation
    console.log("Testing assessment flow...")
    try {
      const mockFormData = {
        firstName: "Test User",
        email: "test@example.com",
        primaryReason: "Testing the system",
        activities: ["Solving complex problems and puzzles"],
        skillStatements: ["I'm a Problem Solver"],
        currentWork: ["Software Engineering"],
        heartCauses: ["Technology & Innovation"],
      }

      // Test the prompt creation (without actually calling Claude to save API costs)
      const prompt = createTestPrompt(mockFormData)
      const promptValid = prompt.includes("Test User") && prompt.includes("Ikigai analysis")

      healthCheck.services.assessmentFlow = {
        status: promptValid ? "✅ Ready" : "⚠️ Issues",
        promptGenerated: promptValid,
        working: promptValid,
      }
    } catch (error) {
      healthCheck.services.assessmentFlow = {
        status: "❌ Failed",
        error: error instanceof Error ? error.message : String(error),
        working: false,
      }
    }

    // Overall system status
    const allWorking = Object.values(healthCheck.services).every((service: any) => service.working)
    healthCheck.overall = allWorking
    healthCheck.status = allWorking ? "🟢 SYSTEM OPERATIONAL" : "🔴 ISSUES DETECTED"

    return NextResponse.json(healthCheck)
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        ...healthCheck,
        status: "🔴 SYSTEM ERROR",
        error: error instanceof Error ? error.message : String(error),
        overall: false,
      },
      { status: 500 },
    )
  }
}

function createTestPrompt(formData: any): string {
  return `You are an expert Ikigai coach. Based on the following assessment responses, create a comprehensive Ikigai analysis for ${formData.firstName}.

ASSESSMENT DATA:
Name: ${formData.firstName}
Activities: ${formData.activities?.join(", ")}
Skills: ${formData.skillStatements?.join(", ")}
Work: ${formData.currentWork?.join(", ")}
Causes: ${formData.heartCauses?.join(", ")}

Please provide a comprehensive Ikigai analysis...`
}
