'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GRID_ROWS, GRID_COLS, TOTAL_NODES, getNodeCoords } from '@/lib/dijkstra';

interface GridProps {
  startNode: number;
  targetNode: number;
  obstacles: Set<number>;
  setS: Set<number>;
  relaxedNodes: Set<number>;
  currentNode: number | null;
  evaluatingNeighbor: number | null;
  path: number[];
  distances: number[];
  onNodeClick: (index: number) => void;
  onNodeHover?: (index: number | null) => void;
  toolMode: 'obstacle' | 'start' | 'target';
  isSearching: boolean;
}

export const Grid: React.FC<GridProps> = ({
  startNode,
  targetNode,
  obstacles,
  setS,
  relaxedNodes,
  currentNode,
  evaluatingNeighbor,
  path,
  distances,
  onNodeClick,
  onNodeHover,
  toolMode,
  isSearching,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const pathSet = new Set(path);

  const handleMouseDown = (index: number) => {
    setIsMouseDown(true);
    onNodeClick(index);
  };

  const handleMouseEnter = (index: number) => {
    if (onNodeHover) onNodeHover(index);
    if (isMouseDown && toolMode === 'obstacle') {
      onNodeClick(index);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div
      className="relative select-none w-full max-w-[620px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-[5px] p-4 sm:p-6"
      onMouseLeave={() => {
        setIsMouseDown(false);
        if (onNodeHover) onNodeHover(null);
      }}
      onMouseUp={handleMouseUp}
    >
      {/* Grid Status Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-[10px] leading-[15px] font-mono tracking-tight text-white/60">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2.5px] bg-[#00ffc2] shadow-[0_0_10px_#00ffc2]" />
            <span className="text-white">START (s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2.5px] bg-[#ff3366] shadow-[0_0_10px_#ff3366]" />
            <span className="text-white">TARGET (t)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2.5px] bg-white/10 border border-white/20" />
            <span>OBSTACLE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2.5px] bg-[#20e7b7]/30 border border-[#20e7b7]/50" />
            <span>SET S</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-[2.5px] bg-white border border-[#00ffc2] shadow-[0_0_12px_#00ffc2]" />
            <span className="text-[#00ffc2]">OPTIMAL PATH</span>
          </div>
        </div>
        <span className="hidden sm:inline-block font-mono text-white/40">10×10 | |V|=100</span>
      </div>

      {/* 10x10 Discrete Lattice Matrix */}
      <div
        className="grid gap-[3px] sm:gap-[4px] aspect-square w-full"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${GRID_ROWS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: TOTAL_NODES }).map((_, index) => {
          const isStart = index === startNode;
          const isTarget = index === targetNode;
          const isObstacle = obstacles.has(index);
          const isCurrent = index === currentNode;
          const isEvaluating = index === evaluatingNeighbor;
          const isPath = pathSet.has(index);
          const isSettled = setS.has(index);
          const isRelaxed = relaxedNodes.has(index);
          const dist = distances[index];

          // Color & Styling logic strictly fitting NK Studio palette
          let bgClass = "bg-white/[0.04] border border-white/[0.08] hover:border-white/40 hover:bg-white/[0.08]";
          let textClass = "text-white/30";
          let scaleAnim = 1;

          if (isObstacle) {
            bgClass = "bg-white/15 border-white/10";
            textClass = "text-transparent";
          } else if (isPath) {
            bgClass = "bg-[#00ffc2] border-[#00ffc2] shadow-[0_0_15px_rgba(0,255,194,0.6)]";
            textClass = "text-black font-bold";
            scaleAnim = 1.05;
          } else if (isCurrent) {
            bgClass = "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]";
            textClass = "text-black font-bold";
            scaleAnim = 1.08;
          } else if (isEvaluating) {
            bgClass = "bg-[#20e7b7] text-black border-[#20e7b7] animate-pulse";
            textClass = "text-black font-bold";
          } else if (isSettled) {
            bgClass = "bg-[#20e7b7]/20 border-[#20e7b7]/40 text-[#20e7b7]";
            textClass = "text-[#20e7b7]";
          } else if (isRelaxed) {
            bgClass = "bg-white/15 border-white/30 text-white";
            textClass = "text-white";
          }

          if (isStart) {
            bgClass = "bg-[#00ffc2] border-[#00ffc2] text-black shadow-[0_0_18px_#00ffc2]";
            textClass = "text-black font-bold";
          } else if (isTarget) {
            bgClass = "bg-[#ff3366] border-[#ff3366] text-white shadow-[0_0_18px_#ff3366]";
            textClass = "text-white font-bold";
          }

          return (
            <motion.div
              key={index}
              animate={{ scale: scaleAnim }}
              transition={{ duration: 0.15, ease: [0.18, 1, 0.32, 1] }}
              onMouseDown={() => handleMouseDown(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              className={`relative flex items-center justify-center rounded-[2.5px] cursor-pointer transition-colors duration-150 aspect-square ${bgClass}`}
            >
              <span className={`text-[8px] sm:text-[9px] font-mono leading-none select-none ${textClass}`}>
                {isStart ? "S" : isTarget ? "T" : isObstacle ? "" : isPath ? dist : dist < Infinity ? dist : index}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Discrete Math footnote caption */}
      <div className="mt-3 text-[10px] leading-[15px] font-mono text-white/40 flex justify-between items-center">
        <span>Click / Drag to set obstacles</span>
        <span>Mode: <strong className="text-[#00ffc2] uppercase">{toolMode}</strong></span>
      </div>
    </div>
  );
};
