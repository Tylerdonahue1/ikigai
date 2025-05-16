import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get the raw request body
    const body = await request.text()
    console.log("Received body:", body)

    let data
    try {
      data = JSON.parse(body)
      console.log("Parsed JSON:", data)
      console.log("Name field:", data.name)
    } catch (error) {
      console.error("Failed to parse JSON:", error)
    }

    return NextResponse.json({
      success: true,
      receivedName: data?.name || "No name found",
      nameType: typeof data?.name,
    })
  } catch (error) {
    console.error("Error in test-name:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}

