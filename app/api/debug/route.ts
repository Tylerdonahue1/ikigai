import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get the raw request body
    const body = await request.text()
    console.log("Debug endpoint received:", body)

    // Try to parse it as JSON
    let parsedData
    try {
      parsedData = JSON.parse(body)
    } catch (error) {
      console.error("Failed to parse JSON:", error)
      parsedData = { error: "Invalid JSON" }
    }

    // Return the data we received
    return NextResponse.json(
      {
        success: true,
        receivedBody: body,
        parsedData,
        contentType: request.headers.get("content-type"),
        method: request.method,
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
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 },
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

