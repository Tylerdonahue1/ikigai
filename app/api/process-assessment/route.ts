import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Generate a unique ID for this assessment
    const id = Math.random().toString(36).substring(2, 15)

    // Store the initial form data in Redis
    await kv.set(`assessment:${id}`, {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "processing",
    })

    // Process the assessment with Claude AI in the background
    processWithClaude(formData, id).catch(console.error)

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error processing assessment:", error)
    return NextResponse.json({ error: "Failed to process assessment" }, { status: 500 })
  }
}

async function processWithClaude(formData: any, id: string) {
  try {
    // Create a comprehensive prompt for Claude
    const prompt = createIkigaiPrompt(formData)

    // Generate the Ikigai analysis using Claude
    const { text } = await generateText({
      model: anthropic("claude-3-5-sonnet-20241022"),
      prompt,
      maxTokens: 4000,
    })

    // Parse the response and structure it
    const ikigaiAnalysis = parseClaudeResponse(text, formData)

    // Store the complete analysis in Redis
    await kv.set(`ikigai:${id}`, ikigaiAnalysis)

    // Update status to completed
    await kv.set(`assessment:${id}`, {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "completed",
      completedAt: new Date().toISOString(),
    })

    console.log(`Ikigai analysis completed for ID: ${id}`)
  } catch (error) {
    console.error("Error processing with Claude:", error)

    // Update status to error
    await kv.set(`assessment:${id}`, {
      ...formData,
      submittedAt: new Date().toISOString(),
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

function createIkigaiPrompt(formData: any): string {
  return `You are an expert Ikigai coach and life purpose analyst. Based on the following assessment responses, create a comprehensive, personalized Ikigai analysis. The analysis should be insightful, actionable, and deeply personalized to this individual.

ASSESSMENT DATA:
Name: ${formData.firstName}
Email: ${formData.email}
Primary Reason: ${formData.primaryReason}

INTERESTS & ACTIVITIES:
Selected Activities: ${formData.activities?.join(", ") || "None specified"}
Enjoyment Ratings: ${JSON.stringify(formData.enjoymentRatings || {})}
Additional Interests: ${formData.additionalInterests || "None specified"}

SKILLS & ABILITIES:
Selected Skills: ${formData.skillStatements?.join(", ") || "None specified"}
Confidence Ratings: ${JSON.stringify(formData.skillConfidence || {})}
Additional Skills: ${formData.additionalSkills || "None specified"}

CAREER & GOALS:
Current Work: ${formData.currentWork?.join(", ") || "None specified"}
Next Chapter Priorities: ${formData.nextChapterPriorities?.join(", ") || "None specified"}
Work Energy Ratings: ${JSON.stringify(formData.workEnergyRatings || {})}
Future Vision: ${formData.futureVision || "None specified"}
Burning Question: ${formData.burningQuestion || "None specified"}

IMPACT & CAUSES:
Cause Passion Ratings: ${JSON.stringify(formData.causePassion || {})}
Heart Causes: ${formData.heartCauses?.join(", ") || "None specified"}
Additional Causes: ${formData.additionalCauses || "None specified"}

Please provide a comprehensive Ikigai analysis in the following JSON format. Make sure to return ONLY valid JSON without any additional text or formatting:

{
  "name": "${formData.firstName}",
  "completionDate": "${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} ${new Date().toLocaleTimeString("en-US")}",
  "ikigaiSummary": "A compelling 2-3 sentence summary of their unique Ikigai discovery",
  "buildingBlocks": {
    "love": "Detailed analysis of what they love based on their interests and activities",
    "good": "Detailed analysis of what they're good at based on their skills and confidence ratings",
    "paid": "Detailed analysis of what they can be paid for based on their career goals and skills",
    "world": "Detailed analysis of what the world needs based on their cause passions and impact desires"
  },
  "passion": {
    "overlap": "Deep analysis of the intersection between what they love and what they're good at",
    "examples": ["3-4 specific, actionable examples of how they can pursue their passion"]
  },
  "mission": {
    "overlap": "Deep analysis of the intersection between what they love and what the world needs",
    "examples": ["3-4 specific, actionable examples of how they can pursue their mission"]
  },
  "vocation": {
    "overlap": "Deep analysis of the intersection between what the world needs and what they can be paid for",
    "examples": ["3-4 specific, actionable examples of how they can pursue their vocation"]
  },
  "profession": {
    "overlap": "Deep analysis of the intersection between what they're good at and what they can be paid for",
    "examples": ["3-4 specific, actionable examples of how they can pursue their profession"]
  },
  "ikigai": {
    "overlap": "Comprehensive analysis of their unique Ikigai at the center of all four circles",
    "examples": ["4-5 specific, actionable suggestions for living their Ikigai"]
  },
  "ikigaiIcons": [
    {
      "name": "Real person's name",
      "description": "Brief description of who they are",
      "matchReason": "Detailed explanation of why this person matches their Ikigai",
      "relevantWork": "Specific examples of their work that relates",
      "keyInsight": "Key lesson or insight this person offers"
    }
  ],
  "emergingPatterns": "Analysis of common patterns among their role models and what this reveals about their path",
  "suggestedResources": ["4-5 specific books, articles, courses, or resources that would help them on their journey"]
}

Make the analysis deeply personal, insightful, and actionable. Use their specific responses to create unique insights rather than generic advice. The role models should be real people who genuinely embody aspects of their Ikigai based on their responses. Include 3-4 role models in the ikigaiIcons array.`
}

function parseClaudeResponse(text: string, formData: any): any {
  try {
    // Clean the response to extract just the JSON
    let cleanedText = text.trim()

    // Remove any markdown formatting
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    // Find the JSON object
    const jsonStart = cleanedText.indexOf("{")
    const jsonEnd = cleanedText.lastIndexOf("}") + 1

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No JSON object found in response")
    }

    const jsonString = cleanedText.substring(jsonStart, jsonEnd)
    const parsed = JSON.parse(jsonString)

    // Ensure all required fields are present with proper structure
    return {
      id: Math.random().toString(36).substring(2, 15),
      name: parsed.name || formData.firstName || "Anonymous User",
      completionDate: parsed.completionDate || new Date().toLocaleDateString(),
      ikigaiSummary: parsed.ikigaiSummary || "Your Ikigai analysis has been completed.",
      buildingBlocks: {
        love: parsed.buildingBlocks?.love || "Analysis of your interests and passions.",
        good: parsed.buildingBlocks?.good || "Analysis of your skills and abilities.",
        paid: parsed.buildingBlocks?.paid || "Analysis of your earning potential.",
        world: parsed.buildingBlocks?.world || "Analysis of your potential impact.",
      },
      passion: {
        overlap: parsed.passion?.overlap || "The intersection of what you love and what you're good at.",
        examples: Array.isArray(parsed.passion?.examples) ? parsed.passion.examples : [],
      },
      mission: {
        overlap: parsed.mission?.overlap || "The intersection of what you love and what the world needs.",
        examples: Array.isArray(parsed.mission?.examples) ? parsed.mission.examples : [],
      },
      vocation: {
        overlap: parsed.vocation?.overlap || "The intersection of what the world needs and what you can be paid for.",
        examples: Array.isArray(parsed.vocation?.examples) ? parsed.vocation.examples : [],
      },
      profession: {
        overlap: parsed.profession?.overlap || "The intersection of what you're good at and what you can be paid for.",
        examples: Array.isArray(parsed.profession?.examples) ? parsed.profession.examples : [],
      },
      ikigai: {
        overlap: parsed.ikigai?.overlap || "Your unique purpose at the intersection of all four areas.",
        examples: Array.isArray(parsed.ikigai?.examples) ? parsed.ikigai.examples : [],
      },
      ikigaiIcons: Array.isArray(parsed.ikigaiIcons) ? parsed.ikigaiIcons : [],
      emergingPatterns: parsed.emergingPatterns || "Patterns in your responses reveal unique insights about your path.",
      suggestedResources: Array.isArray(parsed.suggestedResources) ? parsed.suggestedResources : [],
    }
  } catch (error) {
    console.error("Error parsing Claude response:", error)
    console.error("Raw response:", text)

    // Return a fallback structure
    return {
      id: Math.random().toString(36).substring(2, 15),
      name: formData.firstName || "Anonymous User",
      completionDate: new Date().toLocaleDateString(),
      ikigaiSummary: "Your personalized Ikigai analysis has been generated based on your responses.",
      buildingBlocks: {
        love: "Your interests and passions have been analyzed based on your responses.",
        good: "Your skills and abilities have been evaluated from your assessment.",
        paid: "Your career opportunities have been identified from your goals.",
        world: "Your potential impact has been determined from your cause selections.",
      },
      passion: { overlap: "The intersection of your interests and abilities.", examples: [] },
      mission: { overlap: "The intersection of your passions and impact goals.", examples: [] },
      vocation: { overlap: "The intersection of your impact goals and career potential.", examples: [] },
      profession: { overlap: "The intersection of your abilities and career opportunities.", examples: [] },
      ikigai: { overlap: "Your unique purpose combining all four areas.", examples: [] },
      ikigaiIcons: [],
      emergingPatterns: "Your responses show a unique pattern of interests and goals.",
      suggestedResources: [],
    }
  }
}
