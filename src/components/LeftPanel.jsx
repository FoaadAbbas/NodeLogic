import React, { useState } from 'react';
import { FileText, Gauge, Lightbulb, BookOpen, Lock, ChevronDown, ChevronRight } from 'lucide-react';

const tabs = [
  { id: 'description', label: 'Description',        icon: FileText },
  { id: 'constraints', label: 'Constraints & Scale', icon: Gauge },
  { id: 'hints',       label: 'Hints',              icon: Lightbulb },
  { id: 'solution',    label: 'Official Solution',  icon: BookOpen },
];

function fmtCode(text) {
  return text.replace(/`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 bg-[#252830] rounded text-[#3B82F6] text-xs font-mono">$1</code>');
}

export default function LeftPanel({ problem, hasAttempted, onForfeit, onCopy }) {
  const [tab, setTab] = useState('description');
  const [unlocked, setUnlocked] = useState(false);
  const [openHints, setOpenHints] = useState({});

  const toggleHint = i => setOpenHints(p => ({ ...p, [i]: !p[i] }));

  const unlock = () => {
    if (hasAttempted) { setUnlocked(true); return; }
    if (window.confirm('You haven\'t submitted yet. Unlock the solution anyway? This counts as forfeiting.')) {
      setUnlocked(true);
      onForfeit?.();
    }
  };

  return (
    <div className="h-full flex flex-col bg-nl-card no-select" onCopy={onCopy} onCut={onCopy}>
      {/* tabs */}
      <div className="flex border-b border-nl-border overflow-x-auto flex-shrink-0">
        {tabs.map(t => {
          const I = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'tab-active text-nl-primary' : 'text-nl-muted hover:text-nl-text'}`}>
              <I className="w-3.5 h-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs px-2 py-1 rounded font-medium badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
          <span className="text-xs text-nl-muted bg-nl-bg px-2 py-1 rounded">{problem.category}</span>
        </div>
        <h2 className="text-xl font-bold text-nl-text mb-6">{problem.title}</h2>

        {/* ── Description ── */}
        {tab === 'description' && (
          <div className="space-y-1">
            {problem.description.split('\n').map((ln, i) => {
              if (ln.startsWith('**') && ln.endsWith('**'))
                return <h3 key={i} className="text-base font-semibold text-nl-text mt-4 mb-2">{ln.slice(2, -2)}</h3>;
              if (ln.startsWith('- '))
                return <div key={i} className="flex items-start gap-2 ml-2 mb-1"><span className="text-nl-primary mt-1">•</span><span className="text-sm text-nl-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: fmtCode(ln.slice(2)) }} /></div>;
              if (ln.trim() === '') return <div key={i} className="h-3" />;
              return <p key={i} className="text-sm text-nl-muted leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: fmtCode(ln) }} />;
            })}
          </div>
        )}

        {/* ── Constraints ── */}
        {tab === 'constraints' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-nl-text mb-4">Scale & Performance Requirements</h3>
            {Object.entries(problem.constraints).map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 p-3 bg-nl-bg rounded-lg">
                <Gauge className="w-4 h-4 text-nl-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-nl-muted uppercase tracking-wider">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  <p className="text-sm text-nl-text mt-0.5">{v}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Hints ── */}
        {tab === 'hints' && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-nl-text mb-2">Hints</h3>
            <p className="text-xs text-nl-muted mb-4">Click to reveal each hint progressively.</p>
            {problem.hints.map((h, i) => (
              <div key={i} className="border border-nl-border rounded-lg overflow-hidden">
                <button onClick={() => toggleHint(i)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-nl-bg/50 transition-colors">
                  {openHints[i] ? <ChevronDown className="w-4 h-4 text-nl-primary" /> : <ChevronRight className="w-4 h-4 text-nl-muted" />}
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-nl-text">Hint {i + 1}</span>
                </button>
                {openHints[i] && <div className="px-4 pb-3"><p className="text-sm text-nl-muted leading-relaxed pl-11">{h}</p></div>}
              </div>
            ))}
          </div>
        )}

        {/* ── Official Solution ── */}
        {tab === 'solution' && (
          unlocked ? (
            <div className="space-y-1">
              {problem.solution.split('\n').map((ln, i) => {
                if (ln.startsWith('## '))  return <h3 key={i} className="text-lg font-bold text-nl-text mt-6 mb-3">{ln.slice(3)}</h3>;
                if (ln.startsWith('**') && ln.endsWith('**')) return <h4 key={i} className="text-base font-semibold text-nl-text mt-4 mb-2">{ln.slice(2, -2)}</h4>;
                if (ln.startsWith('- **')) {
                  const p = ln.slice(2).split('**');
                  return <div key={i} className="flex items-start gap-2 ml-2 mb-1"><span className="text-nl-primary mt-1">•</span><span className="text-sm text-nl-muted"><strong className="text-nl-text">{p[1]}</strong>{p[2]}</span></div>;
                }
                if (ln.startsWith('- ')) return <div key={i} className="flex items-start gap-2 ml-2 mb-1"><span className="text-nl-primary mt-1">•</span><span className="text-sm text-nl-muted">{ln.slice(2)}</span></div>;
                if (ln.startsWith('|')) return <p key={i} className="text-xs text-nl-muted font-mono">{ln}</p>;
                if (ln.trim() === '') return <div key={i} className="h-2" />;
                return <p key={i} className="text-sm text-nl-muted leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: fmtCode(ln) }} />;
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Lock className="w-12 h-12 text-nl-border mb-4" />
              <h3 className="text-lg font-semibold text-nl-text mb-2">Solution Locked</h3>
              <p className="text-sm text-nl-muted text-center max-w-xs mb-6">
                {hasAttempted ? 'You\'ve submitted an attempt. Unlock the official solution to compare.' : 'Submit an attempt first, or forfeit to view the official solution.'}
              </p>
              <button onClick={unlock} className="px-4 py-2 rounded-lg bg-nl-primary hover:bg-blue-600 text-white text-sm font-medium transition-colors">
                {hasAttempted ? 'Unlock Solution' : 'Forfeit & View Solution'}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
