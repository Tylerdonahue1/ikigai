import { Redis } from "@upstash/redis"
import { nanoid } from "nanoid"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log("API route called: /api/create-ikigai")

  try {
    // Initialize Redis client
    const redis = new Redis({
      url: process.env.STORAGE_URL || "", // Or your new URL variable name
      token: process.env.STORAGE_TOKEN || "", // Or your new TOKEN variable name
    })

    // Get the raw request body
    const body = await request.text()
    console.log("Received body length:", body.length)

    // Log a small sample of the body for debugging
    if (body.length > 200) {
      console.log("Body sample:", body.substring(0, 100) + "..." + body.substring(body.length - 100))
    } else {
      console.log("Body:", body)
    }

    // Parse the JSON data with error handling
    let data
    let name = "Anonymous User" // Default name
    try {
      data = JSON.parse(body)
      console.log("Successfully parsed JSON")

      // Checking for name field
      console.log("Checking for name field:", data.name)

      // Check if there's a separate name field
      if (data.name) {
        name = data.name
      } else if (data.userName) {
        name = data.userName
      } else if (data.user_name) {
        name = data.user_name
      } else if (data.fullName) {
        name = data.fullName
      } else {
        // Try to extract from profile
        name = extractName(data.ikigai_analysis?.Profile || "")
      }
    } catch (error) {
      console.error("Failed to parse JSON:", error)

      // Try to identify the problematic part of the JSON
      if (error instanceof SyntaxError && error.message.includes("position")) {
        const position = Number.parseInt(error.message.match(/position (\d+)/)?.[1] || "0")
        const problemArea = body.substring(Math.max(0, position - 50), Math.min(body.length, position + 50))
        console.error("Problem area around position", position, ":", problemArea)
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON data",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 400 },
      )
    }

    // Extract the ikigai analysis data with fallbacks
    const ikigaiAnalysis = data.ikigai_analysis || {}
    const roleModelFinder = data.role_model_finder || {}

    console.log(
      "Extracted data sections:",
      "ikigai_analysis=" + (ikigaiAnalysis ? "present" : "missing"),
      "role_model_finder=" + (roleModelFinder ? "present" : "missing"),
    )

    // Generate a unique ID
    const id = nanoid(10)

    // Get current date/time
    const completionDate = new Date().toISOString().replace("T", " ").substring(0, 19)

    // Create a simplified data structure with safe fallbacks
    const ikigaiData = {
      id,
      completionDate,
      name, // Use the extracted name
      ikigaiSummary: ikigaiAnalysis.Profile || "No profile provided",
      buildingBlocks: {
        love: ikigaiAnalysis.WhatYouLove || "Not specified",
        good: ikigaiAnalysis.WhatYouAreGoodAt || "Not specified",
        world: ikigaiAnalysis.WhatTheWorldNeeds || "Not specified",
        paid: ikigaiAnalysis.WhatYouCanBePaidFor || "Not specified",
      },
      // Add other fields with fallbacks
      passion: {
        overlap: ikigaiAnalysis.Passion?.synergy || "Not specified",
        examples: Array.isArray(ikigaiAnalysis.Passion?.examples) ? ikigaiAnalysis.Passion?.examples : [],
      },
      mission: {
        overlap: ikigaiAnalysis.Mission?.synergy || "Not specified",
        examples: Array.isArray(ikigaiAnalysis.Mission?.examples) ? ikigaiAnalysis.Mission?.examples : [],
      },
      vocation: {
        overlap: ikigaiAnalysis.Vocation?.synergy || "Not specified",
        examples: Array.isArray(ikigaiAnalysis.Vocation?.examples) ? ikigaiAnalysis.Vocation?.examples : [],
      },
      profession: {
        overlap: ikigaiAnalysis.Profession?.synergy || "Not specified",
        examples: Array.isArray(ikigaiAnalysis.Profession?.examples) ? ikigaiAnalysis.Profession?.examples : [],
      },
      ikigai: {
        overlap: ikigaiAnalysis.Ikigai?.synergy || "Not specified",
        examples: Array.isArray(ikigaiAnalysis.Ikigai?.suggestions) ? ikigaiAnalysis.Ikigai?.suggestions : [],
      },
      // Extract role models safely
      ikigaiIcons: extractRoleModels(roleModelFinder),
      emergingPatterns: roleModelFinder.emerging_patterns || "No patterns identified",
      suggestedResources: Array.isArray(roleModelFinder.suggested_resources) ? roleModelFinder.suggested_resources : [],
    }

    console.log("Using name in ikigaiData:", ikigaiData.name)
    console.log("Created ikigai data structure")

    // IMPORTANT: Properly stringify the data before storing
    const stringifiedData = JSON.stringify(ikigaiData)
    console.log("Stringified data length:", stringifiedData.length)

    // Store in Redis
    await redis.set(`ikigai:${id}`, stringifiedData)
    console.log("Stored data in Redis with key:", `ikigai:${id}`)

    // Generate URL - now pointing to the processing page
    const siteUrl = process.env.SITE_URL || "http://localhost:3000"
    const processingUrl = `${siteUrl}/processing/${id}`

    // Return success with the processing URL
    return NextResponse.json(
      {
        success: true,
        id,
        url: processingUrl, // Changed from previewUrl to processingUrl
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  } catch (error) {
    console.error("Error in create-ikigai:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    },
  )
}

// Helper function to extract name
function extractName(profile: string): string {
  try {
    // First, check if the profile starts with a name-like pattern
    const firstLineMatch = profile.split(/[.,\n]/)[0].trim()
    if (firstLineMatch && firstLineMatch.length < 100 && !firstLineMatch.includes("is")) {
      return firstLineMatch
    }

    // Try different patterns
    const patterns = [
      /^([\w\s]+) is a/, // Starts with name
      /This user is ([\w\s]+)/,
      /user is ([\w\s]+)/,
      /([\w\s]+) is a/,
      /name is ([\w\s]+)/i,
      /I am ([\w\s]+)/i,
    ]

    for (const pattern of patterns) {
      const match = profile.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return "Anonymous User"
  } catch (error) {
    console.error("Error extracting name:", error)
    return "Anonymous User"
  }
}

// Helper function to extract role models
function extractRoleModels(roleModelFinder: any): any[] {
  try {
    if (!roleModelFinder || !roleModelFinder.role_models) {
      return []
    }

    const roleModels = roleModelFinder.role_models
    const result = []

    // Try to extract role models by different patterns
    for (let i = 1; i <= 4; i++) {
      const roleModel = roleModels[`role_model_${i}`]
      if (roleModel) {
        result.push({
          name: roleModel.name || `Role Model ${i}`,
          description: roleModel.description || "",
          matchReason: roleModel.match_reason || "",
          relevantWork: roleModel.relevant_work || "",
          keyInsight: roleModel.key_insight || "",
        })
      }
    }

    // If no role models found by numbered keys, try direct array
    if (result.length === 0 && Array.isArray(roleModels)) {
      roleModels.forEach((model, index) => {
        result.push({
          name: model.name || `Role Model ${index + 1}`,
          description: model.description || "",
          matchReason: model.match_reason || "",
          relevantWork: model.relevant_work || "",
          keyInsight: model.key_insight || "",
        })
      })
    }

    return result
  } catch (error) {
    console.error("Error extracting role models:", error)
    return []
  }
}
