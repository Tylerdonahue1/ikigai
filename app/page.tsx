import Link from "next/link"
import { Button } from "@/components/ui/button"
import IkigaiDiagramSimple from "@/components/ikigai-diagram-simple"

export default function Home() {
  return (
    <main className="min-h-screen bg-white py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-6xl font-serif font-bold text-[#3D405B] mb-8">Tyler Donahue</h1>

        <p className="text-xl font-serif leading-relaxed mb-8 text-[#3D405B]">
          This document presents the results of your Ikigai assessment, guiding you toward the discovery of your unique
          purpose in life. Ikigai, a Japanese concept meaning "a reason for being," is found at the intersection of what
          you love, what you are good at, what you can be paid for, and what the world needs. This report will explore
          each of these areas and their overlaps, ultimately helping you to identify your Ikigai and live a more
          fulfilling life.
        </p>

        <p className="text-2xl font-serif mb-12 text-[#3D405B]">2025-03-20 2:32:33</p>

        <div className="flex justify-center mb-12">
          <Button asChild className="bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white border-none text-lg">
            <Link href="/dashboard">View Assessment</Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <IkigaiDiagramSimple className="w-full max-w-2xl" />
        </div>
      </div>
    </main>
  )
}
