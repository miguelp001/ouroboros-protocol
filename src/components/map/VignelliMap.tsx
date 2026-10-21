import React from 'react';
import { MAP_NODES, TRANSIT_LINES, MapNode } from '../../data/transitMapData';
import { Key } from 'lucide-react';
import { soundFx } from '../../audio/soundFx';

interface VignelliMapProps {
  activeLocationId: string;
  selectedNodeId: string;
  onSelectNode: (node: MapNode) => void;
  adjacentNodeIds: string[];
}

export const VignelliMap: React.FC<VignelliMapProps> = ({
  activeLocationId,
  selectedNodeId,
  onSelectNode,
  adjacentNodeIds,
}) => {
  const handleNodeClick = (node: MapNode) => {
    soundFx.playClick();
    onSelectNode(node);
  };

  return (
    <div className="relative w-full h-[520px] bg-noir-ink/95 rounded-lg border border-noir-border overflow-hidden select-none font-mono">
      {/* SVG Canvas Map Network */}
      <svg 
        viewBox="0 0 920 620" 
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.8))' }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="subway-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18181f" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background Grid Layer */}
        <rect width="100%" height="100%" fill="url(#subway-grid)" />

        {/* Waterway / Coastal Basin Silhouette (The Sink & Shoreline) */}
        <path
          d="M 0 240 Q 140 280 200 400 T 120 620 L 0 620 Z"
          fill="#0c131d"
          opacity="0.7"
        />

        {/* ================= TRACK LINES (VIGNELLI 45°/90° ANGLES) ================= */}

        {/* Line B: The Submerged Spur (Cyan) */}
        <path
          d="M 180 320 L 120 400 L 80 490"
          fill="none"
          stroke={TRANSIT_LINES.line_b.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Line C: The Cut - Old Town (Zinc Grey) */}
        <path
          d="M 260 270 L 340 270 L 420 270 L 540 280"
          fill="none"
          stroke={TRANSIT_LINES.line_c.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Line C Spur to OT-04 Dead Iron Yard */}
        <path
          d="M 420 270 L 440 350"
          fill="none"
          stroke={TRANSIT_LINES.line_c.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Line A: The Tower Artery - Heights (Hazard Amber) */}
        <path
          d="M 480 80 L 580 140 L 620 220 L 540 280"
          fill="none"
          stroke={TRANSIT_LINES.line_a.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Line F: Redoubt Express (Crisis Red) */}
        <path
          d="M 700 320 L 760 400 L 820 470"
          fill="none"
          stroke={TRANSIT_LINES.line_f.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Line S: Scorch Feeder (Industrial Orange) */}
        <path
          d="M 360 440 L 420 500 L 500 560"
          fill="none"
          stroke={TRANSIT_LINES.line_s.color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cross-District Foot Connector Dashed Lines */}
        <path
          d="M 180 320 L 260 270"
          fill="none"
          stroke="#52525b"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M 540 280 L 700 320"
          fill="none"
          stroke="#52525b"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M 440 350 L 360 440"
          fill="none"
          stroke="#52525b"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* ================= STATION TERMINAL NODES ================= */}
        {Object.values(MAP_NODES).map((node) => {
          if (node.id === 'THRESHOLD_BAR') return null; // Rendered as floating sanctuary badge

          const isActive = node.id === activeLocationId;
          const isSelected = node.id === selectedNodeId;
          const isAdjacent = adjacentNodeIds.includes(node.id);

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className="cursor-pointer group"
            >
              {/* Invisible Hit Area to guarantee easy, stable clicking */}
              <circle
                cx={node.x}
                cy={node.y}
                r="22"
                fill="transparent"
                className="cursor-pointer"
              />

              {/* Active Player Position Halo Ping */}
              {isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="16"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  className="animate-ping opacity-60 pointer-events-none"
                />
              )}

              {/* Adjacent Travelable Indicator Pulse */}
              {isAdjacent && !isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="13"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="animate-pulse pointer-events-none"
                />
              )}

              {/* Station Outer Ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isSelected ? 9 : 7}
                fill="#000000"
                stroke={
                  isSelected
                    ? '#f59e0b'
                    : isActive
                    ? '#f59e0b'
                    : isAdjacent
                    ? '#fbbf24'
                    : '#ffffff'
                }
                strokeWidth={isSelected || isActive ? 3 : 2}
                className="transition-colors duration-150 group-hover:stroke-amber-400 group-hover:stroke-[3px]"
              />

              {/* Station Inner Core Pip */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isActive ? 4 : 2.5}
                fill={isActive ? '#f59e0b' : isSelected ? '#fbbf24' : '#71717a'}
                className="pointer-events-none"
              />

              {/* Vignelli Typography Station Label */}
              <text
                x={node.x + 12}
                y={node.y + 4}
                fill={isActive ? '#f59e0b' : isSelected ? '#fbbf24' : '#e4e4e7'}
                fontSize="11"
                fontWeight={isActive || isSelected ? 'bold' : 'normal'}
                letterSpacing="0.05em"
                className="select-none pointer-events-none group-hover:fill-amber-300 transition-colors"
              >
                {node.code} // {node.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Threshold Bar Sanctuary Keyhole (Upper-Right) */}
      <div 
        onClick={() => {
          const barNode = MAP_NODES['THRESHOLD_BAR'];
          if (barNode) handleNodeClick(barNode);
        }}
        className={`
          absolute top-4 right-4 p-3 rounded-lg border cursor-pointer font-mono text-xs flex items-center gap-3 transition-all
          ${activeLocationId === 'THRESHOLD_BAR' 
            ? 'border-hazard bg-hazard/15 shadow-hazard-glow text-hazard' 
            : selectedNodeId === 'THRESHOLD_BAR'
            ? 'border-hazard bg-noir-surface text-hazard'
            : 'border-noir-border bg-noir-surface/90 hover:border-hazard text-noir-chalk'}
        `}
      >
        <div className="p-2 rounded bg-noir-ink border border-noir-border">
          <Key className="w-4 h-4 text-hazard" />
        </div>
        <div>
          <div className="font-bold text-xs flex items-center gap-1.5">
            <span>THE THRESHOLD BAR</span>
            <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">OFF-GRID</span>
          </div>
          <p className="text-[10px] text-zinc-400">1860s Sanctuary // Evac via Threshold Key</p>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between text-[10px] text-noir-muted bg-noir-ink/90 p-2 rounded border border-noir-border">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
            Line A (Heights)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            Line B (Sink)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
            Line C (Old Town)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Line F (Redoubt)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Line S (Scorch)
          </span>
        </div>

        <span className="text-zinc-500">CLICK ANY NODE TO INSPECT TELEMETRY OR TRAVEL</span>
      </div>
    </div>
  );
};
