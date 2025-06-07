"use client"

import { useState } from "react"
import IkigaiDiagramSVG from "./ikigai-diagram-svg"
import { useTouchDevice } from "@/hooks/use-touch-device"
import { useMobile } from "@/hooks/use-mobile"
import { X } from "lucide-react"

interface InteractiveIkigaiDiagramProps {
  data: {
    love: string
    good: string
    world: string
    paid: string
    passion: string
    mission: string
    vocation: string
    profession: string
    ikigai: string
  }
  className?: string
}

export default function InteractiveIkigaiDiagram({ data, className }: InteractiveIkigaiDiagramProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const isTouchDevice = useTouchDevice()
  const isMobile = useMobile()

  const handleInteraction = (section: string) => {
    if (isTouchDevice) {
      // Toggle behavior - if clicking the same section, close it
      setActiveSection(activeSection === section ? null : section)
    }
  }

  return (
    <div className={`relative bg-white ${className}`}>
      {/* SVG Diagram - centered with larger size on mobile */}
      <div className={`relative w-full max-w-5xl mx-auto px-4 ${isMobile ? "scale-110 my-8" : ""}`}>
        <IkigaiDiagramSVG />

        {/* Interactive overlay */}
        <div className="absolute inset-0">
          {/* What You Love */}
          <div
            className="absolute w-1/2 h-1/2 left-1/4 top-0 cursor-pointer"
            onClick={() => handleInteraction("love")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("love")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="What You Love"
          />

          {/* What You Are Good At */}
          <div
            className="absolute w-1/2 h-1/2 left-0 top-1/4 cursor-pointer"
            onClick={() => handleInteraction("good")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("good")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="What You Are Good At"
          />

          {/* What The World Needs */}
          <div
            className="absolute w-1/2 h-1/2 right-0 top-1/4 cursor-pointer"
            onClick={() => handleInteraction("world")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("world")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="What The World Needs"
          />

          {/* What You Can Get Paid For */}
          <div
            className="absolute w-1/2 h-1/2 left-1/4 bottom-0 cursor-pointer"
            onClick={() => handleInteraction("paid")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("paid")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="What You Can Get Paid For"
          />

          {/* Passion */}
          <div
            className="absolute w-1/4 h-1/4 left-1/4 top-1/4 cursor-pointer"
            onClick={() => handleInteraction("passion")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("passion")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="Passion"
          />

          {/* Mission */}
          <div
            className="absolute w-1/4 h-1/4 right-1/4 top-1/4 cursor-pointer"
            onClick={() => handleInteraction("mission")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("mission")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="Mission"
          />

          {/* Profession */}
          <div
            className="absolute w-1/4 h-1/4 left-1/4 bottom-1/4 cursor-pointer"
            onClick={() => handleInteraction("profession")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("profession")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="Profession"
          />

          {/* Vocation */}
          <div
            className="absolute w-1/4 h-1/4 right-1/4 bottom-1/4 cursor-pointer"
            onClick={() => handleInteraction("vocation")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("vocation")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="Vocation"
          />

          {/* Ikigai */}
          <div
            className="absolute w-1/6 h-1/6 left-[41.67%] top-[41.67%] cursor-pointer"
            onClick={() => handleInteraction("ikigai")}
            onMouseEnter={() => !isTouchDevice && setActiveSection("ikigai")}
            onMouseLeave={() => !isTouchDevice && setActiveSection(null)}
            aria-label="Ikigai"
          />
        </div>
      </div>

      {/* Hover/click tooltip for dynamic text */}
      {activeSection && (
        <div className="absolute bottom-0 left-0 right-0 bg-white p-4 md:p-6 rounded-lg shadow-md z-30 border border-gray-100 max-h-[40vh] overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-serif font-bold text-[#E07A5F] capitalize">{activeSection}</h3>
            {isTouchDevice && (
              <button
                onClick={() => setActiveSection(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <p className="text-[#3D405B] font-serif text-base">{data[activeSection as keyof typeof data]}</p>
        </div>
      )}
    </div>
  )
}
