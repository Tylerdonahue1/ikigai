"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface IkigaiDiagramSimpleProps {
  className?: string
}

export default function IkigaiDiagramSimple({ className }: IkigaiDiagramSimpleProps) {
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
    </div>
  )
}

