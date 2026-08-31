'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Flag, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      className="relative select-none p-4 md:p-6 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-cyan-950/20"
      onMouseLeave={() => {
        setIsMouseDown(false);
        if (onNodeHover) onNodeHover(null);
      }}
      onMouseUp={handleMouseUp}
    >
      {/* Visual Sub-header / Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>Start</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span>Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
            <span>Obstacle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500/60 border border-indigo-400/40" />
            <span>Set S (Settled)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400/80 border border-amber-300" />
            <span>Evaluating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-400/50" />
            <span>Shortest Path</span>
          </div>
        </div>
        <div className="text-slate-500 text-[11px]">
          10x10 Grid (100 Vertices)
        </div>
      </div>

      {/* Grid Canvas */}
      <div
        className="grid grid-cols-10 gap-1.5 md:gap-2 max-w-[560px] mx-auto aspect-square p-2 bg-slate-950/80 rounded-xl border border-slate-800/80 shadow-inner"
      >
        {Array.from({ length: TOTAL_NODES }).map((_, index) => {
          const isStart = index === startNode;
          const isTarget = index === targetNode;
          const isObstacle = obstacles.has(index);
          const inSetS = setS.has(index);
          const isRelaxed = relaxedNodes.has(index);
          const isCurrent = index === currentNode;
          const isEvaluating = index === evaluatingNeighbor;
          const inPath = pathSet.has(index);
          const dist = distances[index];

          // Compute dynamic node background and styles
          let bgClass = 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-400 border-slate-800';
          let glowStyle = {};

          if (isStart) {
            bgClass = 'bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-bold border-emerald-300 shadow-lg shadow-emerald-500/40 z-20';
          } else if (isTarget) {
            bgClass = 'bg-gradient-to-br from-rose-500 to-pink-600 text-white font-bold border-rose-400 shadow-lg shadow-rose-500/40 z-20';
          } else if (isObstacle) {
            bgClass = 'bg-slate-950 text-slate-700 border-slate-800 opacity-90 cursor-not-allowed';
          } else if (inPath) {
            bgClass = 'bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-extrabold border-emerald-300 shadow-lg shadow-emerald-400/50 z-10';
          } else if (isCurrent) {
            bgClass = 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-lg shadow-amber-400/60 ring-2 ring-amber-300 z-15';
          } else if (isEvaluating) {
            bgClass = 'bg-purple-500/80 text-white font-bold border-purple-300 ring-2 ring-purple-400 shadow-md shadow-purple-500/40 z-10';
          } else if (inSetS) {
            bgClass = 'bg-indigo-600/50 border-indigo-500/40 text-indigo-200 shadow-sm shadow-indigo-500/20';
          } else if (isRelaxed) {
            bgClass = 'bg-purple-900/40 border-purple-700/50 text-purple-200';
          }

          const { row, col } = getNodeCoords(index);

          return (
            <motion.div
              key={index}
              onMouseDown={() => handleMouseDown(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{
                scale: isCurrent ? [1, 1.12, 1.05] : inSetS && !inPath ? [0.85, 1.05, 1] : inPath ? [1, 1.08, 1] : 1,
                opacity: isObstacle ? 0.85 : 1,
              }}
              transition={{
                duration: isCurrent || inPath ? 0.3 : 0.25,
                ease: 'easeOut',
              }}
              className={cn(
                'relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer border transition-colors duration-150 select-none overflow-hidden group',
                bgClass
              )}
            >
              {/* Node Index watermark/badge */}
              <span className="absolute top-0.5 left-1 text-[9px] font-mono opacity-30 pointer-events-none">
                {index}
              </span>

              {/* Node Content */}
              {isStart ? (
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center"
                >
                  <Navigation className="w-4 h-4 fill-slate-950 stroke-slate-950" />
                  <span className="text-[9px] uppercase tracking-tighter leading-none mt-0.5">S</span>
                </motion.div>
              ) : isTarget ? (
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center"
                >
                  <Flag className="w-4 h-4 fill-white stroke-white" />
                  <span className="text-[9px] uppercase tracking-tighter leading-none mt-0.5">T</span>
                </motion.div>
              ) : isObstacle ? (
                <ShieldAlert className="w-4 h-4 text-slate-800 opacity-60 group-hover:text-slate-600 transition-colors" />
              ) : inPath ? (
                <Sparkles className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
              ) : (
                dist !== undefined && dist !== Infinity && (
                  <span className={cn(
                    "text-[10px] font-mono font-semibold transition-opacity",
                    inSetS ? "text-indigo-200" : "text-slate-500"
                  )}>
                    {dist}
                  </span>
                )
              )}

              {/* Water Ripple Overlay Animation when added to Set S */}
              <AnimatePresence>
                {inSetS && !inPath && !isStart && !isTarget && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-full bg-cyan-400/40 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* Shortest Path Glow Animation */}
              {inPath && !isStart && !isTarget && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-emerald-400/30 blur-sm pointer-events-none"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Grid Coordinates Footer Info */}
      <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-500 px-2">
        <span>Top-Left: (0,0) [Idx 0]</span>
        <span>Bottom-Right: (9,9) [Idx 99]</span>
      </div>
    </div>
  );
};
