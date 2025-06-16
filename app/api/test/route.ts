import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API is working!",
    env: {
      url: process.env.STORAGE_URL ? "Set" : "Not set", // Or your new URL variable name
      token: process.env.STORAGE_TOKEN ? "Set" : "Not set", // Or your new TOKEN variable name
      site: process.env.SITE_URL || "Not set",
    },
  })
}
