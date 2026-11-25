import React from 'react';
import { X, Award, ArrowRight, Unlock } from 'lucide-react';
import IntegrityBadge from './IntegrityBadge';

export default function EvaluationModal({ results, integrityStatus, onClose, onUnlockSolution }) {
  if (!results) return null;

  const col   = results.score >= 70 ? 'text-nl-success' : results.score >= 40 ? 'text-yellow-500' : 'text-nl-danger';
  const label = results.score >= 70 ? 'Excellent!'      : results.score >= 40 ? 'Good Effort'     : 'Needs Improvement';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-nl-card border border-nl-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-nl-border">
          <div className="flex items-center gap-2"><Award className="w-5 h-5 text-nl-primary" /><h3 className="text-lg font-semibold text-nl-text">Evaluation Results</h3></div>
          <button onClick={onClose} className="p-1 hover:bg-nl-bg rounded-lg"><X className="w-5 h-5 text-nl-muted" /></button>
        </div>

        {/* score */}
        <div className="px-6 py-8 text-center border-b border-nl-border">
          <div className={`text-6xl font-bold ${col} mb-2`}>{results.score}%</div>
          <p className={`text-sm font-medium ${col}`}>{label}</p>
        </div>

        {/* breakdown */}
        <div className="px-6 py-4 border-b border-nl-border space-y-3">
          {results.nodeScore       !== undefined && <Bar label="Architecture Components" score={results.nodeScore}       max={40} />}
          {results.connectionScore !== undefined && <Bar label="Component Connections"   score={results.connectionScore} max={30} />}
          {results.conceptScore    !== undefined && <Bar label="Key Concepts"            score={results.conceptScore}    max={30} />}
          {results.answerScore     !== undefined && <Bar label="Answer Accuracy"         score={results.answerScore}     max={50} />}
          {results.reasoningScore  !== undefined && <Bar label="Reasoning Quality"       score={results.reasoningScore}  max={50} />}
        </div>

        {/* feedback */}
        {results.feedback?.length > 0 && (
          <div className="px-6 py-4 border-b border-nl-border">
            <h4 className="text-sm font-semibold text-nl-text mb-3">Feedback</h4>
            <div className="space-y-2">
              {results.feedback.map((f, i) => (
                <div key={i} className="flex items-start gap-2"><ArrowRight className="w-4 h-4 text-nl-muted mt-0.5 flex-shrink-0" /><span className="text-sm text-nl-muted">{f}</span></div>
              ))}
            </div>
          </div>
        )}

        {/* integrity */}
        <div className="px-6 py-4 border-b border-nl-border flex items-center justify-between">
          <span className="text-sm text-nl-muted">Integrity Status</span>
          <IntegrityBadge status={integrityStatus} />
        </div>

        {/* actions */}
        <div className="px-6 py-4 flex items-center justify-between">
          <button onClick={onUnlockSolution}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nl-bg hover:bg-nl-border/50 text-sm text-nl-muted hover:text-nl-text transition-colors">
            <Unlock className="w-4 h-4" />View Official Solution
          </button>
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-nl-primary hover:bg-blue-600 text-white text-sm font-medium transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, score, max }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-nl-muted">{label}</span>
        <span className="text-xs text-nl-text font-medium">{score}/{max}</span>
      </div>
      <div className="h-1.5 bg-nl-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
             style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444' }} />
      </div>
    </div>
  );
}
