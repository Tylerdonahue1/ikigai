import type React from "react"
import "@/app/globals.css"
import { EB_Garamond } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Space_Grotesk } from 'next/font/google'

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-eb-garamond",
})

export const metadata = {
  title: "Ikigai Assessment",
  description: "Discover your unique purpose with our Ikigai assessment",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
    generator: 'v0.dev'
}

const space_grotesk = Space_Grotesk({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${ebGaramond.variable} ${space_grotesk.className}  bg-white`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'
