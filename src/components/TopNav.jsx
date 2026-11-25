import React, { useState } from 'react';
import { ChevronDown, Clock, Play, Pause, RotateCcw, Home } from 'lucide-react';
import IntegrityBadge from './IntegrityBadge';

export default function TopNav({
  currentProblem, problems, onSelectProblem, onGoHome,
  timer, integrityStatus, onEvaluate, canEvaluate, showProblemNav,
}) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="h-14 bg-nl-card border-b border-nl-border flex items-center justify-between px-4 z-40 relative flex-shrink-0">
      {/* ── Left: Logo + Selector ── */}
      <div className="flex items-center gap-4">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-nl-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">NL</span>
          </div>
          <span className="text-lg font-bold text-nl-text">Node<span className="text-nl-primary">Logic</span></span>
        </button>

        {showProblemNav && currentProblem && (
          <>
            <div className="w-px h-6 bg-nl-border" />
            <div className="relative">
              <button onClick={() => setOpen(!open)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-nl-bg hover:bg-nl-border/50 text-sm transition-colors">
                <span className="text-nl-text max-w-[220px] truncate">{currentProblem.title}</span>
                <ChevronDown className="w-4 h-4 text-nl-muted" />
              </button>
              {open && (
                <div className="absolute top-full left-0 mt-1 w-96 bg-nl-card border border-nl-border rounded-lg shadow-xl overflow-hidden z-50">
                  {problems.map(p => (
                    <button key={p.id}
                            onClick={() => { onSelectProblem(p.id); setOpen(false); }}
                            className={`w-full text-left px-4 py-3 hover:bg-nl-bg/50 flex items-center gap-3 transition-colors ${p.id === currentProblem.id ? 'bg-nl-primary/10' : ''}`}>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                      <span className="text-sm text-nl-text truncate">{p.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Centre: Timer ── */}
      {showProblemNav && (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-nl-muted" />
          <span className="text-lg font-mono text-nl-text tracking-wider">{timer.formattedTime}</span>
          <div className="flex items-center gap-1 ml-2">
            {timer.isRunning
              ? <button onClick={timer.pause} className="p-1 hover:bg-nl-bg rounded" title="Pause"><Pause className="w-4 h-4 text-nl-muted"/></button>
              : <button onClick={timer.start} className="p-1 hover:bg-nl-bg rounded" title="Start"><Play  className="w-4 h-4 text-nl-muted"/></button>}
            <button onClick={timer.reset} className="p-1 hover:bg-nl-bg rounded" title="Reset"><RotateCcw className="w-4 h-4 text-nl-muted"/></button>
          </div>
        </div>
      )}

      {/* ── Right: Integrity + Evaluate + Home ── */}
      <div className="flex items-center gap-3">
        {showProblemNav && (
          <>
            <IntegrityBadge status={integrityStatus} />
            <button onClick={onEvaluate} disabled={!canEvaluate}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${canEvaluate
                      ? 'bg-nl-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-nl-border text-nl-muted cursor-not-allowed'}`}>
              Evaluate Solution
            </button>
            <button onClick={onGoHome} className="p-2 hover:bg-nl-bg rounded-lg" title="Back to Home">
              <Home className="w-5 h-5 text-nl-muted" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
