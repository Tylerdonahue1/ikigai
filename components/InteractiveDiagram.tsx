"use client";

import { useState } from "react";
import { useTouchDevice } from "@/hooks/use-touch-device";
import { X } from "lucide-react";

interface InteractiveIkigaiDiagramProps {
  className?: string;
}

export default function InteractiveDiagram({
  className,
}: InteractiveIkigaiDiagramProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const isTouchDevice = useTouchDevice();
  const [isHovered, setIsHovered] = useState(false);
  const [values, setValues] = useState<string[]>([]);

  const handleInteraction = (section: string) => {
    if (isTouchDevice) {
      setActiveSection(activeSection === section ? null : section);
    }
  };
  let prevHoveredCount = 0;

  const handleMultiOver = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsHovered(true);
    setValues([]);
    const { clientX, clientY } = e;
    const elements = document.elementsFromPoint(clientX, clientY);

    const hoveredSections = new Set(
      elements.filter((el) => el.tagName === "circle").map((el) => el.id)
    );

    const currentHoveredCount = hoveredSections.size;

    if (currentHoveredCount !== prevHoveredCount) {
      hoveredSections.forEach((val: string) => {
        setValues((prev) => [...prev, val]);
      });
    }

    if (
      values?.includes("love") &&
      values.includes("world") &&
      values.includes("good") &&
      values.includes("paid")
    ) {
      setActiveSection("ikigai");
    } else if (
      values.includes("love") &&
      values.includes("world") &&
      values.includes("good")
    ) {
    } else if (
      values.includes("love") &&
      values.includes("paid") &&
      values.includes("good")
    ) {
    } else if (
      values.includes("love") &&
      values.includes("world") &&
      values.includes("paid")
    ) {
    } else if (
      values.includes("paid") &&
      values.includes("world") &&
      values.includes("good")
    ) {
    } else if (values.includes("love") && values.includes("world")) {
      setActiveSection("mission");
    } else if (values.includes("love") && values.includes("good")) {
      setActiveSection("passion");
    } else if (values.includes("good") && values.includes("paid")) {
      setActiveSection("profession");
    } else if (values.includes("world") && values.includes("paid")) {
      setActiveSection("vocation");
    } else if (values.includes("love")) {
      setActiveSection("love");
    } else if (values.includes("good")) {
      setActiveSection("good");
    } else if (values.includes("paid")) {
      setActiveSection("paid");
    } else if (values.includes("world")) {
      setActiveSection("world");
    }

    prevHoveredCount = currentHoveredCount;
  };

  const handleMouseOut = () => {
    setActiveSection(null);
    setIsHovered(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`relative mx-auto px-4 flex justify-center items-center w-full md:mt-[-70px] my-0` }>
        <svg
          onMouseMove={(e) => handleMultiOver(e)}
          onMouseOut={handleMouseOut}
          // style={{ pointerEvents: "none" }}
          viewBox="0 0 1050 1150"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-h-[800px] scale-[1.05] md:static relative -left-[1.3rem] sm:-left-[1.8rem] -top-10 mix-blend-multiply"
        >
          {/* Filters for drop shadows */}
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Centered and scaled diagram with more space */}
          <g transform="translate(200, 200) scale(0.95) " pointerEvents="auto">
            {/* Transparent Circle - What You Love */}
            <circle
              // onMouseEnter={(e) => {
              //   handleMouseEnter(e);
              // }}
              id="love"
              className="z-10 mix-blend-multiply pointer-events-auto"
              cx="400"
              cy="200"
              r="250"
              fill={
                activeSection == "ikigai" ||
                activeSection == "love" ||
                activeSection == "mission" ||
                activeSection == "passion"
                  ? "#81B29A60"
                  : "transparent"
              }
              // fill="transparent"
              stroke="#aaa"
              strokeWidth="1"
              filter="url(#shadow)"
            />

            {/* Transparent Circle - What You're Good At */}
            <circle
              className="z-10 mix-blend-multiply pointer-events-auto"
              id="good"
              cx="200"
              cy="400"
              r="250"
              fill={
                activeSection == "ikigai" ||
                activeSection == "good" ||
                activeSection == "profession" ||
                activeSection == "passion"
                  ? "#81B29A60"
                  : "transparent"
              }
              // fill="transparent"
              stroke="#aaa"
              strokeWidth="1"
              filter="url(#shadow)"
            />

            {/* Transparent Circle - What The World Needs */}
            <circle
              className="z-10 mix-blend-multiply pointer-events-auto"
              id="world"
              cx="600"
              cy="400"
              r="250"
              fill={
                activeSection == "ikigai" ||
                activeSection == "vocation" ||
                activeSection == "mission" ||
                activeSection == "world"
                  ? "#81B29A60"
                  : "transparent"
              }
              // fill="transparent"
              stroke="#aaa"
              strokeWidth="1"
              filter="url(#shadow)"
            />

            {/* Transparent Circle - What You Can Be Paid For */}
            <circle
              className="z-10 mix-blend-multiply pointer-events-auto"
              id="paid"
              cx="400"
              cy="600"
              r="250"
              fill={
                activeSection == "ikigai" ||
                activeSection == "vocation" ||
                activeSection == "profession" ||
                activeSection == "paid"
                  ? "#81B29A60"
                  : "transparent"
              }
              // fill="transparent"
              stroke="#aaa"
              strokeWidth="1"
              filter="url(#shadow)"
            />

            {/* Labels */}
            <text
              className="pointer-events-none "
              x="400"
              y="90"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              
              fill="#3D405B"
            >
              What You Love
            </text>
            <text
              className="pointer-events-none "
              x="90"
              y="400"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              
              fill="#3D405B"
            >
              What You Are Good At
            </text>
            <text
              className="pointer-events-none "
              x="710"
              y="400"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              
              fill="#3D405B"
            >
              What The World Needs
            </text>
            <text
              className="pointer-events-none "
              x="400"
              y="720"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              
              fill="#3D405B"
            >
              What You Can Be Paid For
            </text>

            {/* Overlap Labels */}
            <text
              className="pointer-events-none "
              x="270"
              y="280"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              
              fill="#3D405B"
            >
              Passion
            </text>
            <text
              className="pointer-events-none "
              x="530"
              y="280"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              
              fill="#3D405B"
            >
              Mission
            </text>
            <text
              className="pointer-events-none "
              x="280"
              y="530"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              
              fill="#3D405B"
            >
              Profession
            </text>
            <text
              className="pointer-events-none "
              x="530"
              y="530"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              
              fill="#3D405B"
            >
              Vocation
            </text>

            {/* Ikigai Center Label */}
            <text
              className="pointer-events-none "
              x="400"
              y="408"
              textAnchor="middle"
              fontSize="28"
              fontWeight="bold"
              
              fill="#E07A5F"
            >
              Ikigai
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
