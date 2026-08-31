'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  StepForward,
  Shield,
  Navigation,
  Flag,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Grid as GridIcon,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="w-full lg:w-80 flex flex-col gap-5 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-cyan-950/20">
      {/* Header Badge & Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 tracking-wide">Controls</h2>
            <p className="text-[11px] text-slate-400 font-mono">Dijkstra Engine</p>
          </div>
        </div>

        {/* Dynamic Phase Status Badge */}
        <div
          className={cn(
            'px-2.5 py-1 rounded-full text-[10px] font-mono font-medium flex items-center gap-1.5 border',
            phase === 'found' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
            phase === 'unreachable' && 'bg-rose-500/10 text-rose-400 border-rose-500/30',
            (phase === 'exploring' || phase === 'relaxing') && 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse',
            phase === 'init' && 'bg-slate-800 text-slate-400 border-slate-700'
          )}
        >
          {phase === 'found' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          {phase === 'unreachable' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
          {phase === 'found'
            ? 'PATH FOUND'
            : phase === 'unreachable'
            ? 'NO PATH'
            : isRunning
            ? 'COMPUTING'
            : 'READY'}
        </div>
      </div>

      {/* Main Execution Controls */}
      <div className="flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onTogglePlay}
            disabled={phase === 'found' || phase === 'unreachable'}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-cyan-500/20'
            )}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-amber-300 stroke-amber-300" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950 stroke-slate-950" />
                <span>Start Routing</span>
              </>
            )}
          </button>

          <button
            onClick={onStep}
            disabled={isRunning || phase === 'found' || phase === 'unreachable'}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <StepForward className="w-4 h-4 text-cyan-400" />
            <span>Step</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Path</span>
          </button>

          <button
            onClick={onClearObstacles}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs text-slate-300 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 transition-all active:scale-95"
          >
            <GridIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Grid</span>
          </button>
        </div>
      </div>

      {/* Preset Map Selection */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Roadblock Layouts
          </span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onPresetSelect('random')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-mono text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition-all"
          >
            <Shuffle className="w-3 h-3 text-cyan-400" />
            Randomize
          </button>
          <button
            onClick={() => onPresetSelect('maze')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-mono text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition-all"
          >
            Maze Pattern
          </button>
          <button
            onClick={() => onPresetSelect('center')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-mono text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition-all"
          >
            Center Block
          </button>
          <button
            onClick={() => onPresetSelect('spiral')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-mono text-slate-300 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 transition-all"
          >
            Spiral Tunnel
          </button>
        </div>
      </div>

      {/* Interactive Tool Mode Selection */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
        <label className="text-[11px] font-mono text-slate-400">Click & Drag Tool Mode</label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onToolModeChange('obstacle')}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-mono transition-all border',
              toolMode === 'obstacle'
                ? 'bg-slate-800 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            )}
          >
            <Shield className="w-3.5 h-3.5 mb-1 text-slate-400" />
            <span>Obstacle</span>
          </button>

          <button
            onClick={() => onToolModeChange('start')}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-mono transition-all border',
              toolMode === 'start'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            )}
          >
            <Navigation className="w-3.5 h-3.5 mb-1 text-emerald-400" />
            <span>Start Node</span>
          </button>

          <button
            onClick={() => onToolModeChange('target')}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-xl text-[11px] font-mono transition-all border',
              toolMode === 'target'
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800/50'
            )}
          >
            <Flag className="w-3.5 h-3.5 mb-1 text-rose-400" />
            <span>Target Node</span>
          </button>
        </div>
      </div>

      {/* Speed Slider */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Animation Delay
          </span>
          <span className="text-cyan-300">{speed} ms</span>
        </div>
        <input
          type="range"
          min="10"
          max="300"
          step="10"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Live Algorithm Telemetry Counters */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-slate-400">Set S</span>
          <span className="text-sm font-bold font-mono text-indigo-400">{setSCount}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-slate-400">Set Q</span>
          <span className="text-sm font-bold font-mono text-slate-300">{setQCount}</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-slate-400">Path Cost</span>
          <span className="text-sm font-bold font-mono text-emerald-400">
            {pathLength > 0 ? pathLength - 1 : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
