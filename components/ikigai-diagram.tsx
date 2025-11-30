"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface IkigaiDiagramProps {
  className?: string
}

export default function IkigaiDiagram({ className }: IkigaiDiagramProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className={cn("relative aspect-square", className)}>
      <Image
        src="/images/ikigai-diagram.svg"
        alt="Ikigai Diagram showing the intersection of What You Love, What You Are Good At, What The World Needs, and What You Can Get Paid For"
        width={800}
        height={800}
        className="w-full h-auto"
        priority
      />

      {/* Interactive overlay */}
      <div className="absolute inset-0">
        {/* What You Love */}
        <div
          className="absolute w-1/2 h-1/2 left-1/4 top-0 cursor-pointer"
          onMouseEnter={() => setActiveSection("love")}
          onMouseLeave={() => setActiveSection(null)}
        />

        {/* What You Are Good At */}
        <div
          className="absolute w-1/2 h-1/2 left-0 top-1/4 cursor-pointer"
          onMouseEnter={() => setActiveSection("good")}
          onMouseLeave={() => setActiveSection(null)}
        />

        {/* What The World Needs */}
        <div
          className="absolute w-1/2 h-1/2 right-0 top-1/4 cursor-pointer"
          onMouseEnter={() => setActiveSection("world")}
          onMouseLeave={() => setActiveSection(null)}
        />

        {/* What You Can Get Paid For */}
        <div
          className="absolute w-1/2 h-1/2 left-1/4 bottom-0 cursor-pointer"
          onMouseEnter={() => setActiveSection("paid")}
          onMouseLeave={() => setActiveSection(null)}
        />

        {/* Passion */}
        <div
          className="absolute w-1/4 h-1/4 left-1/4 top-1/4 cursor-pointer"
          onMouseEnter={() => setActiveSection("passion")}
          onMouseLeave={() => setActiveSection(null)}
        />

        {/* Mission */}
        <div
          className="absolute w-1/4 h-1/4 right-1/4 top-1/4 cursor-pointer"
          onMouseEnter={() => setActiveSection("mission")}
          onMouseLeave={() => setActiveSection(null)}
        />

        {/* Profession */}
        <div
          className="absolute w-1/4 h-1/4 left-1/4 bottom-1/4 cursor-pointer"
          onMouseEnter={() => setActiveSection("profession")}
          onMouseLeave={() => setActiveSection(null)}
        />

        {/* Vocation */}
        <div
          className="absolute w-1/4 h-1/4 right-1/4 bottom-1/4 cursor-pointer"
          onMouseEnter={() => setActiveSection("vocation")}
          onMouseLeave={() => setActiveSection(null)}
        />

        {/* Ikigai */}
        <div
          className="absolute w-1/6 h-1/6 left-[41.67%] top-[41.67%] cursor-pointer"
          onMouseEnter={() => setActiveSection("ikigai")}
          onMouseLeave={() => setActiveSection(null)}
        />
      </div>

      {/* Display active section name (optional) */}
      {activeSection && (
        <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 rounded text-sm text-[#3D405B]">
          {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
        </div>
      )}
    </div>
  )
}
