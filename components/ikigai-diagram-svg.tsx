export default function IkigaiDiagramSVG() {
  return (
    <svg viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Filters for drop shadows */}
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Centered and scaled diagram with more space */}
      <g transform="translate(200, 200) scale(0.95)">
        {/* Transparent Circle - What You Love */}
        <circle cx="400" cy="200" r="250" fill="transparent" stroke="#aaa" strokeWidth="1" filter="url(#shadow)" />

        {/* Transparent Circle - What You're Good At */}
        <circle cx="200" cy="400" r="250" fill="transparent" stroke="#aaa" strokeWidth="1" filter="url(#shadow)" />

        {/* Transparent Circle - What The World Needs */}
        <circle cx="600" cy="400" r="250" fill="transparent" stroke="#aaa" strokeWidth="1" filter="url(#shadow)" />

        {/* Transparent Circle - What You Can Be Paid For */}
        <circle cx="400" cy="600" r="250" fill="transparent" stroke="#aaa" strokeWidth="1" filter="url(#shadow)" />

        {/* Labels */}
        <text x="400" y="120" textAnchor="middle" fontSize="24" fontWeight="bold"  fill="#3D405B">
          What You Love
        </text>
        <text x="120" y="400" textAnchor="middle" fontSize="24" fontWeight="bold"  fill="#3D405B">
          What You Are Good At
        </text>
        <text x="680" y="400" textAnchor="middle" fontSize="24" fontWeight="bold"  fill="#3D405B">
          What The World Needs
        </text>
        <text x="400" y="680" textAnchor="middle" fontSize="24" fontWeight="bold"  fill="#3D405B">
          What You Can Be Paid For
        </text>

        {/* Overlap Labels */}
        <text x="300" y="300" textAnchor="middle" fontSize="24" fontWeight="bold"  fill="#3D405B">
          Passion
        </text>
        <text x="500" y="300" textAnchor="middle" fontSize="24" fontWeight="bold"  fill="#3D405B">
          Mission
        </text>
        <text x="300" y="500" textAnchor="middle" fontSize="24" fontWeight="bold"  fill="#3D405B">
          Profession
        </text>
        <text x="500" y="500" textAnchor="middle" fontSize="24" fontWeight="bold"  fill="#3D405B">
          Vocation
        </text>

        {/* Ikigai Center Label */}
        <text x="400" y="408" textAnchor="middle" fontSize="28" fontWeight="bold"  fill="#E07A5F">
          Ikigai
        </text>
      </g>
    </svg>
  )
}
