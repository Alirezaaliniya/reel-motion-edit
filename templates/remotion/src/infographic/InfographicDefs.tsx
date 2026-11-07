import React from "react";

export const InfographicDefs: React.FC = () => {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
      <defs>
        {/* Technical Crosshatch Pattern */}
        <pattern
          id="hatch-red"
          width="12"
          height="12"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="12" stroke="#DC2626" strokeWidth="1.5" opacity="0.4" />
        </pattern>

        <pattern
          id="hatch-gray"
          width="10"
          height="10"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="10" stroke="#94A3B8" strokeWidth="1" opacity="0.25" />
        </pattern>

        <pattern
          id="hatch-amber"
          width="10"
          height="10"
          patternTransform="rotate(45 0 0)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="10" stroke="#D97706" strokeWidth="1.2" opacity="0.3" />
        </pattern>

        {/* Technical Arrow Heads */}
        <marker
          id="tech-arrow-chalk"
          markerWidth="10"
          markerHeight="10"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 L2,3 Z" fill="#F1F5F9" />
        </marker>

        <marker
          id="tech-arrow-amber"
          markerWidth="10"
          markerHeight="10"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 L2,3 Z" fill="#D97706" />
        </marker>

        <marker
          id="tech-arrow-green"
          markerWidth="10"
          markerHeight="10"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 L2,3 Z" fill="#10B981" />
        </marker>

        {/* Technical Joint Dot */}
        <marker
          id="tech-dot"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <circle cx="3" cy="3" r="2.5" fill="#F1F5F9" />
        </marker>
      </defs>
    </svg>
  );
};
