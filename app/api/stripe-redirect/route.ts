import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const url = new URL(request.url)
    const utmContent = url.searchParams.get("utm_content")

    // If utm_content is present (which contains our ikigai ID), redirect to the full report
    if (utmContent) {
      // Return a redirect response
      return NextResponse.redirect(`${process.env.SITE_URL}/ikigai/${utmContent}`)
    }

    // If no utm_content, redirect to home
    return NextResponse.redirect(`${process.env.SITE_URL}`)
  } catch (error) {
    console.error("Error in stripe redirect:", error)
    // Redirect to home on error
    return NextResponse.redirect(`${process.env.SITE_URL}`)
  }
}

