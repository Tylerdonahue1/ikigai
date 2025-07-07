import { NextResponse } from "next/server"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function POST(request: Request) {
  try {
    const { transcript, existingData, userEmail } = await request.json()

    // Create a prompt to extract structured data from the voice conversation
    const prompt = `
    You are an expert at extracting structured data from Ikigai assessment conversations.
    
    EXISTING DATA:
    ${JSON.stringify(existingData, null, 2)}
    
    CONVERSATION TRANSCRIPT:
    ${transcript.map((msg: any) => `${msg.role}: ${msg.message}`).join("\n")}
    
    Extract and update the user's Ikigai assessment data based on this conversation.
    Return a JSON object with the following structure:
    
    {
      "extractedData": {
        "firstName": "string",
        "email": "${userEmail}",
        "primaryReason": "string",
        "activities": ["array of activities they mentioned"],
        "enjoymentRatings": {"activity": rating},
        "additionalInterests": "string",
        "skillStatements": ["array of skills they mentioned"],
        "skillConfidence": {"skill": rating},
        "additionalSkills": "string",
        "currentWork": ["array of work types"],
        "nextChapterPriorities": ["array of priorities"],
        "workEnergyRatings": {"work_type": rating},
        "futureVision": "string",
        "burningQuestion": "string",
        "causePassion": {"cause": rating},
        "heartCauses": ["array of causes"],
        "additionalCauses": "string"
      },
      "isComplete": boolean,
      "completionPercentage": number,
      "nextSection": "string",
      "summary": "Brief summary of what was discussed"
    }
    
    Only include fields that were actually discussed in the conversation.
    Merge with existing data, don't overwrite unless new information was provided.
    `

    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt,
      maxTokens: 2000,
    })

    let parsedResponse
    try {
      parsedResponse = JSON.parse(text)
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      return NextResponse.json({
        extractedData: existingData,
        isComplete: false,
        completionPercentage: 0,
        summary: "Error processing conversation",
      })
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error("Error processing voice conversation:", error)
    return NextResponse.json({ success: false, error: "Failed to process conversation" }, { status: 500 })
  }
}
