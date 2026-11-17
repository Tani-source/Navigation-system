'use client';

import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'matrix' | 'sets' | 'formal'>('matrix');

  const activeNodeIndex = hoveredNode !== null ? hoveredNode : currentNode !== null ? currentNode : startNode;
  const activeCoords = getNodeCoords(activeNodeIndex);
  const activeMatrixRow = adjMatrix[activeNodeIndex] || [];

  const degree = activeMatrixRow.reduce((acc, weight, j) => {
    return j !== activeNodeIndex && weight < Infinity ? acc + 1 : acc;
  }, 0);

  const sortedSetS = Array.from(setS).sort((a, b) => a - b);
  const sortedSetQ = Array.from(setQ).sort((a, b) => a - b);

  return (
    <div className="w-full bg-black text-white border border-white/10 rounded-[5px] p-5 sm:p-8 flex flex-col gap-6">
      {/* Inspector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ffc2] block mb-1">Formal Specification</span>
          <h3 className="text-[20px] font-bold tracking-tight text-white uppercase">Discrete Mathematics Engine</h3>
          <p className="text-[10px] leading-[15px] font-mono text-white/50">
            Adjacency Matrix W ∈ ℝ¹⁰⁰ˣ¹⁰⁰ • Settled Set S • Priority Queue Q = V \ S
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-[5px] border border-white/10">
          {(['matrix', 'sets', 'formal'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-[3px] text-[10px] font-mono uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'bg-white text-black font-bold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'matrix' ? 'Matrix W[u]' : tab === 'sets' ? 'Sets S & Q' : 'Proof Invariants'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: ADJACENCY MATRIX ROW */}
      {activeTab === 'matrix' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-[5px] bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono">
            <div>
              <span className="text-white/40 block">FOCUS VERTEX u</span>
              <span className="text-[16px] font-bold text-[#00ffc2]">v_{activeNodeIndex}</span>
              <span className="text-white/40 ml-2">({activeCoords.row}, {activeCoords.col})</span>
            </div>
            <div>
              <span className="text-white/40 block">VERTEX DEGREE deg(u)</span>
              <span className="text-[16px] font-bold text-white">{degree}</span>
            </div>
            <div>
              <span className="text-white/40 block">TENTATIVE DISTANCE d(u)</span>
              <span className="text-[16px] font-bold text-[#20e7b7]">
                {distances[activeNodeIndex] < Infinity ? distances[activeNodeIndex] : '∞'}
              </span>
            </div>
            <div>
              <span className="text-white/40 block">PREDECESSOR π(u)</span>
              <span className="text-[16px] font-bold text-white">
                {previous[activeNodeIndex] !== null ? `v_${previous[activeNodeIndex]}` : 'null'}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">
                Adjacency Vector W[{activeNodeIndex}][0..99]
              </span>
              <span className="text-[10px] font-mono text-white/40">100 Dimensional Vector</span>
            </div>
            <div className="grid grid-cols-10 sm:grid-cols-20 gap-1 p-2 bg-white/[0.02] border border-white/10 rounded-[5px] max-h-48 overflow-y-auto">
              {activeMatrixRow.map((weight, targetIdx) => {
                const isSelf = targetIdx === activeNodeIndex;
                const isEdge = weight < Infinity && !isSelf;
                return (
                  <div
                    key={targetIdx}
                    className={`p-1 text-center rounded-[2px] font-mono text-[9px] border ${
                      isSelf
                        ? 'bg-white text-black border-white font-bold'
                        : isEdge
                        ? 'bg-[#00ffc2]/20 border-[#00ffc2] text-[#00ffc2] font-semibold'
                        : 'bg-white/[0.01] border-white/5 text-white/20'
                    }`}
                  >
                    <span>{isSelf ? '0' : weight === Infinity ? '∞' : weight}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SETS S & Q */}
      {activeTab === 'sets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-[5px] bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase text-[#00ffc2] font-bold">Settled Set S</span>
              <span className="text-[10px] font-mono text-white/50">|S| = {sortedSetS.length}</span>
            </div>
            <p className="text-[10px] font-mono text-white/40 leading-[15px]">
              Vertices with globally settled optimal shortest distance.
            </p>
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pt-2">
              {sortedSetS.length === 0 ? (
                <span className="text-[10px] font-mono text-white/30 italic">∅ (Empty Set)</span>
              ) : (
                sortedSetS.map((node) => (
                  <span
                    key={node}
                    className="px-1.5 py-0.5 rounded-[2px] bg-[#00ffc2]/10 border border-[#00ffc2]/40 text-[#00ffc2] text-[9px] font-mono"
                  >
                    v_{node}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-[5px] bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase text-white font-bold">Candidate Set Q (V \ S)</span>
              <span className="text-[10px] font-mono text-white/50">|Q| = {sortedSetQ.length}</span>
            </div>
            <p className="text-[10px] font-mono text-white/40 leading-[15px]">
              Unvisited candidate priority queue set waiting for greedy extraction.
            </p>
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pt-2">
              {sortedSetQ.map((node) => (
                <span
                  key={node}
                  className="px-1.5 py-0.5 rounded-[2px] bg-white/5 border border-white/10 text-white/50 text-[9px] font-mono"
                >
                  v_{node}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MATHEMATICAL PROOF & SYLLABUS MAPPING */}
      {activeTab === 'formal' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-mono leading-[16px]">
          <div className="p-4 rounded-[5px] bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <span className="text-[#00ffc2] font-bold uppercase">1. Invariant & Induction</span>
            <p className="text-white/70">
              For all v in S, d(v) = δ(s, v). Proved by induction over set size |S|. Because edge weights W(u,v) ≥ 1, no detour through candidate set Q can yield lower cost than min d(v) for v in Q.
            </p>
          </div>

          <div className="p-4 rounded-[5px] bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <span className="text-[#20e7b7] font-bold uppercase">2. Bijection & Coordinates</span>
            <p className="text-white/70">
              f(r, c) = 10·r + c defines a strict bijection between 2D lattice coordinates and 1D vector index. Inverse computed via quotient ⌊k/10⌋ and remainder k mod 10.
            </p>
          </div>

          <div className="p-4 rounded-[5px] bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <span className="text-white font-bold uppercase">3. Metric & Triangle Inequality</span>
            <p className="text-white/70">
              Edge relaxation updates d(v) ← d(u) + W[u][v] whenever d(u) + W[u][v] &lt; d(v), enforcing metric triangle inequality δ(s,v) ≤ δ(s,u) + W(u,v).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
