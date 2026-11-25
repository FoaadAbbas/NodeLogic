import React from 'react';
import { Plus, Trash2, Send } from 'lucide-react';

export default function ReasoningWorkspace({ problem, reasoning, setReasoning, answer, setAnswer, onPaste, onKeyDown }) {
  const add    = () => setReasoning(p => [...p, '']);
  const update = (i, v) => setReasoning(p => p.map((s, j) => j === i ? v : s));
  const remove = i => setReasoning(p => p.filter((_, j) => j !== i));

  return (
    <div className="h-full flex flex-col bg-nl-card">
      {/* header */}
      <div className="px-6 py-4 border-b border-nl-border flex-shrink-0">
        <h3 className="text-base font-semibold text-nl-text">Step-by-Step Reasoning</h3>
        <p className="text-xs text-nl-muted mt-1">Break down your approach into clear logical steps.</p>
      </div>

      {/* steps */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {reasoning.map((step, i) => (
          <div key={i} className="group flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-nl-primary/20 flex items-center justify-center mt-1">
              <span className="text-xs font-bold text-nl-primary">{i + 1}</span>
            </div>
            <textarea value={step} onChange={e => update(i, e.target.value)} onPaste={onPaste} onKeyDown={onKeyDown}
                      placeholder={`Step ${i + 1}: Describe your reasoning…`}
                      className="flex-1 bg-nl-input border border-nl-border rounded-lg px-4 py-3 text-sm text-nl-text placeholder-nl-muted focus:outline-none focus:border-nl-primary resize-none transition-colors" rows={3} />
            <button onClick={() => remove(i)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded text-nl-muted hover:text-red-400 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={add}
                className="flex items-center gap-2 px-4 py-2.5 w-full border-2 border-dashed border-nl-border rounded-lg text-sm text-nl-muted hover:border-nl-primary hover:text-nl-primary transition-colors">
          <Plus className="w-4 h-4" />Add Reasoning Step
        </button>
      </div>

      {/* answer */}
      <div className="border-t border-nl-border p-6 flex-shrink-0">
        <h4 className="text-sm font-semibold text-nl-text mb-3 flex items-center gap-2">
          <Send className="w-4 h-4 text-nl-primary" />Final Answer
        </h4>
        {problem.answerType === 'numeric' ? (
          <div className="flex items-center gap-3">
            <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} onPaste={onPaste}
                   placeholder={problem.answer?.unit ? `Enter your answer in ${problem.answer.unit}` : 'Enter your numerical answer'}
                   className="flex-1 bg-nl-input border border-nl-border rounded-lg px-4 py-3 text-lg text-nl-text placeholder-nl-muted focus:outline-none focus:border-nl-primary transition-colors font-mono" />
            {problem.answer?.unit && <span className="text-sm text-nl-muted font-medium">{problem.answer.unit}</span>}
          </div>
        ) : (
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} onPaste={onPaste} onKeyDown={onKeyDown}
                    placeholder="Enter your answer…"
                    className="w-full bg-nl-input border border-nl-border rounded-lg px-4 py-3 text-sm text-nl-text placeholder-nl-muted focus:outline-none focus:border-nl-primary resize-none transition-colors" rows={3} />
        )}
      </div>
    </div>
  );
}
