'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
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

  useEffect(() => {
    resetAlgorithm();
  }, [resetAlgorithm]);

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
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00ffc2', '#20e7b7', '#ffffff'],
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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#00ffc2] selection:text-black flex flex-col">
      {/* nk.studio Header Bar */}
      <header className="w-full flex items-center justify-between px-5 sm:px-10 h-[88px] border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div>
          <span className="font-bold tracking-tight text-[16px] sm:text-[18px] uppercase">
            NK.STUDIO <span className="text-[#00ffc2] font-normal">/ PREDICTIVE ROUTING</span>
          </span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-white/50">
            W ∈ ℝ¹⁰⁰ˣ¹⁰⁰ • Single-Source Shortest Path
          </span>
          <button
            onClick={resetAlgorithm}
            className="button-primary text-[10px] uppercase font-mono tracking-wider py-1.5 px-3 border border-white/20 text-white hover:border-[#00ffc2] hover:text-[#00ffc2]"
          >
            Reset Engine
          </button>
        </div>
      </header>

      {/* Main Dedicated Laboratory Workspace */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-5 sm:px-10 py-10 sm:py-14 flex flex-col gap-10">
        {/* Title & Introduction */}
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#00ffc2] font-mono block mb-2">
            DISCRETE MATHEMATICS & GRAPH THEORY ENGINE
          </span>
          <h1 className="text-[40px] sm:text-[70px] lg:text-[90px] font-medium leading-[0.92] tracking-[-0.03em] text-white">
            The Engine.
          </h1>
          <p className="mt-3 text-[14px] sm:text-[18px] leading-[25px] text-white/70 max-w-[720px]">
            Interactive Single-Source Shortest Path (Dijkstra) solver running over a 100-vertex discrete lattice graph with live Adjacency Matrix inspection and formal set proofs.
          </p>
        </div>

        {/* Interactive Visualizer Canvas & Controls */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
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

        {/* Real-Time Formal Discrete Mathematics Inspector */}
        <div className="w-full">
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
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 py-6 px-5 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-white/50">
        <div>
          <span>PREDICTIVE ROUTING ENGINE • VIT DISCRETE MATHEMATICS</span>
        </div>
        <div className="flex items-center gap-6">
          <span>|V| = 100</span>
          <span>|E| ≤ 180</span>
          <span className="text-[#00ffc2]">NK.STUDIO MINIMALIST DESIGN</span>
        </div>
      </footer>
    </div>
  );
}
