'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Database, Binary, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNodeCoords, TOTAL_NODES, GRID_COLS } from '@/lib/dijkstra';

interface DiscreteMathInspectorProps {
  adjMatrix: number[][];
  setS: Set<number>;
  setQ: Set<number>;
  distances: number[];
  previous: (number | null)[];
  currentNode: number | null;
  evaluatingNeighbor: number | null;
  hoveredNode: number | null;
  startNode: number;
  targetNode: number;
}

export const DiscreteMathInspector: React.FC<DiscreteMathInspectorProps> = ({
  adjMatrix,
  setS,
  setQ,
  distances,
  previous,
  currentNode,
  evaluatingNeighbor,
  hoveredNode,
  startNode,
  targetNode,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'sets' | 'vectors'>('matrix');

  // Focus node is either hovered node, current evaluating node, or start node
  const activeNodeIndex = hoveredNode !== null ? hoveredNode : currentNode !== null ? currentNode : startNode;
  const activeCoords = getNodeCoords(activeNodeIndex);

  // Extract row u from Adjacency Matrix
  const activeMatrixRow = adjMatrix[activeNodeIndex] || [];
  
  // Calculate degree deg(u)
  const degree = activeMatrixRow.reduce((acc, weight, j) => {
    return j !== activeNodeIndex && weight < Infinity ? acc + 1 : acc;
  }, 0);

  // Convert Set S to sorted array for display
  const sortedSetS = Array.from(setS).sort((a, b) => a - b);
  const sortedSetQ = Array.from(setQ).sort((a, b) => a - b);

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-cyan-950/20 p-5 flex flex-col gap-4">
      {/* Inspector Header & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
            <Binary className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Discrete Math Inspector</h3>
            <p className="text-[11px] font-mono text-slate-400">Formal Sets & 100×100 Adjacency Matrix</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('matrix')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5',
              activeTab === 'matrix'
                ? 'bg-indigo-600/80 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Adjacency Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('sets')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5',
              activeTab === 'sets'
                ? 'bg-indigo-600/80 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Sets (S & Q)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ADJACENCY MATRIX INSPECTOR */}
      {activeTab === 'matrix' && (
        <div className="flex flex-col gap-4">
          {/* Active Node Matrix Vector Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Selected Vertex:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60">
                v_{activeNodeIndex} ({activeCoords.row}, {activeCoords.col})
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-300">
              <div>
                <span className="text-slate-500 mr-1">Degree:</span>
                <span className="text-emerald-400 font-bold">deg(v_{activeNodeIndex}) = {degree}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1">Graph Dimensions:</span>
                <span className="text-indigo-300">100 × 100 Matrix</span>
              </div>
            </div>
          </div>

          {/* Adjacency Matrix Row Inspection Heatmap / Grid */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Matrix Row W[{activeNodeIndex}][j] for j = 0...99</span>
              <span className="text-[11px] text-slate-500">1 = Edge, ∞ = No Connection / Roadblock</span>
            </div>

            <div className="grid grid-cols-10 gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              {activeMatrixRow.map((weight, j) => {
                const isSelf = j === activeNodeIndex;
                const isConnected = weight < Infinity;
                const isNeighboring = isConnected && !isSelf;

                return (
                  <div
                    key={j}
                    className={cn(
                      'p-1.5 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono border transition-all',
                      isSelf
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : isNeighboring
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                        : 'bg-slate-900/40 text-slate-600 border-slate-800/60 opacity-60'
                    )}
                    title={`W[${activeNodeIndex}][${j}] = ${weight === Infinity ? '∞' : weight}`}
                  >
                    <span className="text-[8px] opacity-40">j={j}</span>
                    <span className="font-bold">{weight === Infinity ? '∞' : weight}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Discrete Math Formal Formula Banner */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs font-mono text-indigo-200/90 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-indigo-300 mb-0.5">Discrete Graph Theory Definition</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adjacency Matrix W ∈ ℝ^{'{100 × 100}'} represents weighted edge function w(u, v). If vertex u and v are connected by an unblocked grid tile, W_{'{u,v}'} = 1. Blocking vertex u sets row W_{'{u, :}'} and column W_{'{:, u}'} to ∞, proving obstacle rerouting strictly via matrix edge mutations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISCRETE SETS INSPECTOR (Set S & Set Q) */}
      {activeTab === 'sets' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Set S Box */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/50 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-800/40">
                <span className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
                  Set S (Settled Shortest Paths)
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-200 border border-indigo-700/60">
                  |S| = {setS.size}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                S = {'{'} v ∈ V ∣ d(v) is finalized {'}'}
              </p>

              <div className="max-h-36 overflow-y-auto pr-1 flex flex-wrap gap-1 mt-1 font-mono text-[11px]">
                {sortedSetS.length > 0 ? (
                  sortedSetS.map((v) => (
                    <span
                      key={v}
                      className={cn(
                        'px-1.5 py-0.5 rounded border text-[10px]',
                        v === currentNode
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-300'
                          : 'bg-indigo-950 text-indigo-300 border-indigo-800/80'
                      )}
                    >
                      v_{v}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-600 italic">Set S is empty (∅)</span>
                )}
              </div>
            </div>

            {/* Set Q Box */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  Set Q (Unvisited Candidate Set)
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                  |Q| = {setQ.size}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Q = V \ S (Remaining priority queue)
              </p>

              <div className="max-h-36 overflow-y-auto pr-1 flex flex-wrap gap-1 mt-1 font-mono text-[11px]">
                {sortedSetQ.length > 0 ? (
                  sortedSetQ.map((v) => (
                    <span
                      key={v}
                      className={cn(
                        'px-1.5 py-0.5 rounded border text-[10px]',
                        v === evaluatingNeighbor
                          ? 'bg-purple-500 text-white font-bold border-purple-300'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      )}
                    >
                      v_{v}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-600 italic">Set Q is empty (∅)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
