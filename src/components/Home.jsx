import React, { useState } from 'react';
import { Search, Filter, ChevronRight, Shield, ShieldCheck, ShieldAlert, CheckCircle2, Circle } from 'lucide-react';

export default function Home({ problems, solvedProblems, problemIntegrity, onSelectProblem }) {
  const [q, setQ]       = useState('');
  const [cat, setCat]   = useState('all');
  const [diff, setDiff] = useState('all');

  const cats  = ['all', 'System Design', 'Back-of-the-Envelope', 'Logic Riddle'];
  const diffs = ['all', 'Easy', 'Medium', 'Hard'];

  const list = problems.filter(p =>
    p.title.toLowerCase().includes(q.toLowerCase()) &&
    (cat  === 'all' || p.category   === cat) &&
    (diff === 'all' || p.difficulty === diff));

  return (
    <div className="min-h-[calc(100vh-56px)] bg-nl-bg overflow-y-auto">
      {/* ── Hero ── */}
      <div className="border-b border-nl-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-nl-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">NL</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-nl-text">Node<span className="text-nl-primary">Logic</span></h1>
              <p className="text-nl-muted text-sm">System Design & Logic Challenges</p>
            </div>
          </div>
          <p className="text-nl-muted text-lg max-w-2xl mt-4">
            Master system design and sharpen your logical thinking with interactive,
            integrity-verified challenges. No AI shortcuts — just your brain. 🧠
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nl-muted" />
            <input type="text" placeholder="Search problems..." value={q} onChange={e => setQ(e.target.value)}
                   className="w-full pl-10 pr-4 py-2.5 bg-nl-card border border-nl-border rounded-lg text-sm text-nl-text placeholder-nl-muted focus:outline-none focus:border-nl-primary transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-nl-muted" />
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat === c ? 'bg-nl-primary text-white' : 'bg-nl-card text-nl-muted hover:text-nl-text border border-nl-border'}`}>
                {c === 'all' ? 'All Categories' : c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {diffs.map(d => (
              <button key={d} onClick={() => setDiff(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${diff === d ? 'bg-nl-primary text-white' : 'bg-nl-card text-nl-muted hover:text-nl-text border border-nl-border'}`}>
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-nl-card border border-nl-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[48px_48px_1fr_180px_100px_100px] gap-4 px-6 py-3 border-b border-nl-border text-xs font-medium text-nl-muted uppercase tracking-wider">
            <span>Status</span><span>Shield</span><span>Title</span><span>Category</span><span>Difficulty</span><span>Acceptance</span>
          </div>
          {list.map(p => {
            const solved    = solvedProblems[p.id];
            const integrity = problemIntegrity[p.id];
            return (
              <button key={p.id} onClick={() => onSelectProblem(p.id)}
                      className="w-full grid grid-cols-[48px_48px_1fr_180px_100px_100px] gap-4 px-6 py-4 border-b border-nl-border/50 hover:bg-nl-bg/50 transition-colors items-center text-left">
                <div>{solved ? <CheckCircle2 className="w-5 h-5 text-nl-success" /> : <Circle className="w-5 h-5 text-nl-border" />}</div>
                <div>
                  {integrity
                    ? integrity === 'clean'   ? <ShieldCheck className="w-5 h-5 text-nl-success" />
                    : integrity === 'warning' ? <ShieldAlert className="w-5 h-5 text-yellow-500" />
                    :                           <ShieldAlert className="w-5 h-5 text-red-500" />
                    : <Shield className="w-5 h-5 text-nl-border" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-nl-text hover:text-nl-primary transition-colors">{p.title}</span>
                  <ChevronRight className="w-4 h-4 text-nl-border" />
                </div>
                <span className="text-xs text-nl-muted bg-nl-bg px-2 py-1 rounded w-fit">{p.category}</span>
                <span className={`text-xs px-2 py-1 rounded font-medium w-fit badge-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
                <span className="text-sm text-nl-muted">{p.acceptanceRate}%</span>
              </button>
            );
          })}
          {list.length === 0 && <div className="px-6 py-12 text-center text-nl-muted">No problems match your filters.</div>}
        </div>
      </div>
    </div>
  );
}
