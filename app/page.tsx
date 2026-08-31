'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Brain, Code2, Network, ShieldCheck } from 'lucide-react';
import { Grid } from '@/components/Grid';
import { ControlPanel } from '@/components/ControlPanel';
import { DiscreteMathInspector } from '@/components/DiscreteMathInspector';
import {
  createAdjacencyMatrix,
  dijkstraGenerator,
  getObstaclePreset,
  DijkstraStep,
  TOTAL_NODES,
} from '@/lib/dijkstra';

export default function Home() {
  // Graph topology states
  const [startNode, setStartNode] = useState<number>(0);
  const [targetNode, setTargetNode] = useState<number>(99);
  const [obstacles, setObstacles] = useState<Set<number>>(
    new Set(getObstaclePreset('center'))
  );
  const [adjMatrix, setAdjMatrix] = useState<number[][]>(() =>
    createAdjacencyMatrix(obstacles)
  );

  // Interaction tool mode state
  const [toolMode, setToolMode] = useState<'obstacle' | 'start' | 'target'>('obstacle');
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Algorithm Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(40);

  const [setS, setSetS] = useState<Set<number>>(new Set());
  const [setQ, setSetQ] = useState<Set<number>>(new Set());
  const [relaxedNodes, setRelaxedNodes] = useState<Set<number>>(new Set());
  const [distances, setDistances] = useState<number[]>(Array(TOTAL_NODES).fill(Infinity));
  const [previous, setPrevious] = useState<(number | null)[]>(Array(TOTAL_NODES).fill(null));
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [evaluatingNeighbor, setEvaluatingNeighbor] = useState<number | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [phase, setPhase] = useState<'init' | 'exploring' | 'relaxing' | 'found' | 'unreachable'>('init');

  // Generator & Animation Loop refs
  const generatorRef = useRef<Generator<DijkstraStep, DijkstraStep, void> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Re-build matrix when obstacles change
  useEffect(() => {
    const newMatrix = createAdjacencyMatrix(obstacles);
    setAdjMatrix(newMatrix);
  }, [obstacles]);

  // Reset algorithm state and re-initialize generator
  const resetAlgorithm = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);

    const matrix = createAdjacencyMatrix(obstacles);
    const gen = dijkstraGenerator(matrix, startNode, targetNode);
    generatorRef.current = gen;

    const initialResult = gen.next();
    if (!initialResult.done && initialResult.value) {
      const step = initialResult.value;
      setSetS(step.setS);
      setSetQ(step.setQ);
      setRelaxedNodes(step.relaxedNodes);
      setDistances(step.distances);
      setPrevious(step.previous);
      setCurrentNode(step.currentNode);
      setEvaluatingNeighbor(step.evaluatingNeighbor);
      setPath(step.path);
      setPhase(step.phase);
    }
  }, [obstacles, startNode, targetNode]);

  // Re-initialize generator whenever graph configuration changes
  useEffect(() => {
    resetAlgorithm();
  }, [resetAlgorithm]);

  // Advance single step of Dijkstra's generator
  const advanceStep = useCallback(() => {
    if (!generatorRef.current) return;

    const result = generatorRef.current.next();
    const step = result.value;

    if (step) {
      setSetS(step.setS);
      setSetQ(step.setQ);
      setRelaxedNodes(step.relaxedNodes);
      setDistances(step.distances);
      setPrevious(step.previous);
      setCurrentNode(step.currentNode);
      setEvaluatingNeighbor(step.evaluatingNeighbor);
      setPath(step.path);
      setPhase(step.phase);

      if (step.phase === 'found') {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#34d399', '#38bdf8', '#818cf8'],
        });
      } else if (step.phase === 'unreachable') {
        setIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }

    if (result.done) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);

  // Animation Timer Loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        advanceStep();
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, speed, advanceStep]);

  const handleTogglePlay = () => {
    if (phase === 'found' || phase === 'unreachable') {
      resetAlgorithm();
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  const handleNodeClick = (index: number) => {
    if (toolMode === 'start') {
      if (index !== targetNode && !obstacles.has(index)) {
        setStartNode(index);
      }
    } else if (toolMode === 'target') {
      if (index !== startNode && !obstacles.has(index)) {
        setTargetNode(index);
      }
    } else if (toolMode === 'obstacle') {
      if (index !== startNode && index !== targetNode) {
        setObstacles((prev) => {
          const next = new Set(prev);
          if (next.has(index)) {
            next.delete(index);
          } else {
            next.add(index);
          }
          return next;
        });
      }
    }
  };

  const handlePresetSelect = (preset: 'maze' | 'center' | 'spiral' | 'random' | 'none') => {
    const newObstacles = getObstaclePreset(preset);
    setObstacles(new Set(newObstacles));
  };

  const handleClearObstacles = () => {
    setObstacles(new Set());
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 text-slate-950 font-bold">
              <Brain className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Predictive Routing
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Dijkstra Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Discrete Mathematics Proof & Adjacency Matrix Visualizer
              </p>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span>100×100 Matrix W</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generator function*</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full flex flex-col gap-8">
        {/* Main 2-Column Grid & Controls View */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
          {/* Visual 10x10 Grid View */}
          <div className="flex-1 w-full flex justify-center">
            <Grid
              startNode={startNode}
              targetNode={targetNode}
              obstacles={obstacles}
              setS={setS}
              relaxedNodes={relaxedNodes}
              currentNode={currentNode}
              evaluatingNeighbor={evaluatingNeighbor}
              path={path}
              distances={distances}
              onNodeClick={handleNodeClick}
              onNodeHover={setHoveredNode}
              toolMode={toolMode}
              isSearching={isRunning}
            />
          </div>

          {/* Control Panel Sidebar */}
          <ControlPanel
            isRunning={isRunning}
            onTogglePlay={handleTogglePlay}
            onStep={advanceStep}
            onReset={resetAlgorithm}
            onClearObstacles={handleClearObstacles}
            onRandomize={() => handlePresetSelect('random')}
            onPresetSelect={handlePresetSelect}
            speed={speed}
            onSpeedChange={setSpeed}
            toolMode={toolMode}
            onToolModeChange={setToolMode}
            setSCount={setS.size}
            setQCount={setQ.size}
            pathLength={path.length}
            phase={phase}
          />
        </div>

        {/* Discrete Math Real-Time Matrix & Set Inspector */}
        <DiscreteMathInspector
          adjMatrix={adjMatrix}
          setS={setS}
          setQ={setQ}
          distances={distances}
          previous={previous}
          currentNode={currentNode}
          evaluatingNeighbor={evaluatingNeighbor}
          hoveredNode={hoveredNode}
          startNode={startNode}
          targetNode={targetNode}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs font-mono text-slate-600">
        Predictive Routing Visualizer • Powered by Next.js, Framer Motion & Kokonut UI aesthetic
      </footer>
    </main>
  );
}
