import { NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function GET() {
  try {
    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt: "Hello! Please respond with a simple JSON object containing a greeting message.",
      maxTokens: 100,
    })

    return NextResponse.json({
      success: true,
      response: text,
      message: "Claude AI integration is working!",
    })
  } catch (error) {
    console.error("Claude test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Claude AI integration failed",
      },
      { status: 500 },
    )
  }
}
