"use client"

import Image from "next/image"

interface PassionDiagramProps {
  className?: string
}

export default function PassionDiagram({ className }: PassionDiagramProps) {
  return (
    <div className={className} style={{ width: "220px", height: "220px" }}>
      <Image
        src="/images/passion-diagram-new.svg"
        alt="Passion diagram showing the overlap between What You Love and What You Are Good At"
        width={1000}
        height={1000}
        className="w-full h-full"
        style={{ objectFit: "contain" }}
        priority
        unoptimized
      />
    </div>
  )
}
