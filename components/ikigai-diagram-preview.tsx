"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface IkigaiDiagramPreviewProps {
  className?: string
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
}

export default function IkigaiDiagramPreview({ className, data }: IkigaiDiagramPreviewProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  return (
    <div className={cn("relative aspect-square max-w-3xl mx-auto", className)}>
      {/* What You Love Circle */}
      <div className="absolute w-1/2 h-1/2 left-1/4 top-0">
        <div
          className="w-full h-full rounded-full bg-red-200 opacity-80 flex items-center justify-center p-6 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg"
          onMouseEnter={() => setActiveSection("love")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold text-[#3D405B] mb-2">What You Love</h3>
            <p className="text-sm md:text-base text-[#3D405B] line-clamp-4">{data.love}</p>
          </div>
        </div>
      </div>

      {/* What You Are Good At Circle */}
      <div className="absolute w-1/2 h-1/2 left-0 top-1/4">
        <div
          className="w-full h-full rounded-full bg-yellow-200 opacity-80 flex items-center justify-center p-6 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg"
          onMouseEnter={() => setActiveSection("good")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold text-[#3D405B] mb-2">What You're Good At</h3>
            <p className="text-sm md:text-base text-[#3D405B] line-clamp-4">{data.good}</p>
          </div>
        </div>
      </div>

      {/* What The World Needs Circle */}
      <div className="absolute w-1/2 h-1/2 right-0 top-1/4">
        <div
          className="w-full h-full rounded-full bg-green-200 opacity-80 flex items-center justify-center p-6 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg"
          onMouseEnter={() => setActiveSection("world")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold text-[#3D405B] mb-2">What The World Needs</h3>
            <p className="text-sm md:text-base text-[#3D405B] line-clamp-4">{data.world}</p>
          </div>
        </div>
      </div>

      {/* What You Can Get Paid For Circle */}
      <div className="absolute w-1/2 h-1/2 left-1/4 bottom-0">
        <div
          className="w-full h-full rounded-full bg-blue-200 opacity-80 flex items-center justify-center p-6 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg"
          onMouseEnter={() => setActiveSection("paid")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold text-[#3D405B] mb-2">What You Can Be Paid For</h3>
            <p className="text-sm md:text-base text-[#3D405B] line-clamp-4">{data.paid}</p>
          </div>
        </div>
      </div>

      {/* Passion Overlap */}
      <div className="absolute w-1/4 h-1/4 left-1/4 top-1/4">
        <div
          className="w-full h-full rounded-full bg-orange-200 opacity-90 flex items-center justify-center p-3 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg z-10"
          onMouseEnter={() => setActiveSection("passion")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-[#3D405B] mb-1">Passion</h3>
            <p className="text-xs md:text-sm text-[#3D405B] line-clamp-3">{data.passion}</p>
          </div>
        </div>
      </div>

      {/* Mission Overlap */}
      <div className="absolute w-1/4 h-1/4 right-1/4 top-1/4">
        <div
          className="w-full h-full rounded-full bg-lime-200 opacity-90 flex items-center justify-center p-3 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg z-10"
          onMouseEnter={() => setActiveSection("mission")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-[#3D405B] mb-1">Mission</h3>
            <p className="text-xs md:text-sm text-[#3D405B] line-clamp-3">{data.mission}</p>
          </div>
        </div>
      </div>

      {/* Profession Overlap */}
      <div className="absolute w-1/4 h-1/4 left-1/4 bottom-1/4">
        <div
          className="w-full h-full rounded-full bg-teal-200 opacity-90 flex items-center justify-center p-3 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg z-10"
          onMouseEnter={() => setActiveSection("profession")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-[#3D405B] mb-1">Profession</h3>
            <p className="text-xs md:text-sm text-[#3D405B] line-clamp-3">{data.profession}</p>
          </div>
        </div>
      </div>

      {/* Vocation Overlap */}
      <div className="absolute w-1/4 h-1/4 right-1/4 bottom-1/4">
        <div
          className="w-full h-full rounded-full bg-cyan-200 opacity-90 flex items-center justify-center p-3 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg z-10"
          onMouseEnter={() => setActiveSection("vocation")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-[#3D405B] mb-1">Vocation</h3>
            <p className="text-xs md:text-sm text-[#3D405B] line-clamp-3">{data.vocation}</p>
          </div>
        </div>
      </div>

      {/* Ikigai Center */}
      <div className="absolute w-1/6 h-1/6 left-[41.67%] top-[41.67%]">
        <div
          className="w-full h-full rounded-full bg-[#E07A5F] opacity-90 flex items-center justify-center p-2 cursor-pointer transition-all hover:opacity-100 hover:shadow-lg z-20"
          onMouseEnter={() => setActiveSection("ikigai")}
          onMouseLeave={() => setActiveSection(null)}
        >
          <div className="text-center">
            <h3 className="text-sm md:text-base font-bold text-white">Ikigai</h3>
          </div>
        </div>
      </div>

      {/* Active section tooltip */}
      {activeSection === "ikigai" && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-4 rounded-lg shadow-lg z-30">
          <h3 className="text-xl font-bold text-[#E07A5F] mb-2">Your Ikigai</h3>
          <p className="text-[#3D405B]">{data.ikigai}</p>
        </div>
      )}
    </div>
  )
}
