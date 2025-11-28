"use client"

interface PassionDiagramLargeProps {
  className?: string
}

export default function PassionDiagramLarge({ className }: PassionDiagramLargeProps) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src="/images/passion-diagram-new.svg"
        alt="Passion diagram showing the overlap between What You Love and What You Are Good At"
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "400px",
        }}
      />
    </div>
  )
}

