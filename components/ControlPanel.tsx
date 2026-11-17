'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Shuffle, StepForward } from 'lucide-react';

interface ControlPanelProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onClearObstacles: () => void;
  onRandomize: () => void;
  onPresetSelect: (preset: 'maze' | 'center' | 'spiral' | 'random' | 'none') => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  toolMode: 'obstacle' | 'start' | 'target';
  onToolModeChange: (mode: 'obstacle' | 'start' | 'target') => void;
  setSCount: number;
  setQCount: number;
  pathLength: number;
  phase: 'init' | 'exploring' | 'relaxing' | 'found' | 'unreachable';
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  onTogglePlay,
  onStep,
  onReset,
  onClearObstacles,
  onRandomize,
  onPresetSelect,
  speed,
  onSpeedChange,
  toolMode,
  onToolModeChange,
  setSCount,
  setQCount,
  pathLength,
  phase,
}) => {
  return (
    <div className="w-full lg:w-[360px] flex flex-col gap-5 p-5 sm:p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[5px] text-white">
      {/* Header status */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Algorithm Engine</span>
          <span className="text-[14px] font-bold tracking-tight text-white uppercase">Dijkstra Shortest Path</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-[2.5px] text-[10px] font-mono uppercase tracking-wider ${
            phase === 'found'
              ? 'bg-[#00ffc2] text-black font-bold'
              : phase === 'unreachable'
              ? 'bg-[#ff3366] text-white font-bold'
              : phase === 'exploring' || phase === 'relaxing'
              ? 'bg-[#20e7b7]/20 text-[#20e7b7] border border-[#20e7b7]/50 animate-pulse'
              : 'bg-white/10 text-white/60'
          }`}
        >
          {phase}
        </span>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onTogglePlay}
          className="button-primary flex items-center justify-center gap-2 py-3 px-4 font-bold uppercase tracking-wider text-[12px] bg-white text-black hover:bg-[#00ffc2] transition-colors duration-200"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Run Dijkstra
            </>
          )}
        </button>

        <button
          onClick={onStep}
          disabled={isRunning}
          className="button-primary flex items-center justify-center gap-1.5 py-3 px-3 uppercase tracking-wider text-[10px] bg-white/10 text-white border border-white/15 hover:border-white/40 disabled:opacity-40"
        >
          <StepForward className="w-3.5 h-3.5" /> Step Next
        </button>
      </div>

      {/* Secondary Controls: Reset & Randomize */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="flex-1 button-primary py-2 px-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider border border-white/10 hover:border-white/30"
        >
          <RotateCcw className="w-3 h-3" /> Reset Engine
        </button>
        <button
          onClick={onClearObstacles}
          className="button-primary py-2 px-3 text-[10px] uppercase tracking-wider border border-white/10 hover:border-white/30 text-white/70"
        >
          Clear Walls
        </button>
      </div>

      {/* Discrete Mode Selector */}
      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
        <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Edit Tool Target</label>
        <div className="grid grid-cols-3 gap-1.5 bg-white/[0.03] p-1 rounded-[5px] border border-white/10">
          {(['obstacle', 'start', 'target'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onToolModeChange(mode)}
              className={`py-1.5 text-[10px] uppercase font-mono tracking-wider rounded-[3px] transition-all duration-200 ${
                toolMode === mode
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Maze Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-white/50">Topology Presets</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['maze', 'spiral', 'center', 'random', 'none'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => onPresetSelect(preset)}
              className="py-1.5 px-2 bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 rounded-[3px] text-[10px] font-mono uppercase tracking-wider text-white/70 hover:text-white transition-all text-center"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Speed */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
        <div className="flex justify-between items-center text-[10px] font-mono uppercase text-white/50">
          <span>Simulation Latency</span>
          <span className="text-[#00ffc2]">{speed}ms</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full accent-[#00ffc2] cursor-pointer h-1 bg-white/20 rounded-lg appearance-none"
        />
      </div>

      {/* Discrete State Counter Matrix */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center font-mono">
        <div className="p-2 rounded-[3px] bg-white/[0.03] border border-white/10">
          <span className="text-[10px] text-white/40 block">|S| (Settled)</span>
          <span className="text-[14px] font-bold text-[#20e7b7]">{setSCount}</span>
        </div>
        <div className="p-2 rounded-[3px] bg-white/[0.03] border border-white/10">
          <span className="text-[10px] text-white/40 block">|Q| (Unvisited)</span>
          <span className="text-[14px] font-bold text-white">{setQCount}</span>
        </div>
        <div className="p-2 rounded-[3px] bg-white/[0.03] border border-white/10">
          <span className="text-[10px] text-white/40 block">Path Cost</span>
          <span className="text-[14px] font-bold text-[#00ffc2]">{pathLength > 0 ? pathLength - 1 : 0}</span>
        </div>
      </div>
    </div>
  );
};
