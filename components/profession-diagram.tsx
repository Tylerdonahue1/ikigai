"use client"

interface ProfessionDiagramProps {
  className?: string
}

export default function ProfessionDiagram({ className }: ProfessionDiagramProps) {
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
        src="/images/profession.svg"
        alt="Profession diagram showing the overlap between What You Are Good At and What You Can Get Paid For"
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "400px",
        }}
      />
    </div>
  )
}
