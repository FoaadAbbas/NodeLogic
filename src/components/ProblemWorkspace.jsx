import React, { useState, useEffect, useCallback } from 'react';
import LeftPanel from './LeftPanel';
import Canvas from './Canvas';
import ReasoningWorkspace from './ReasoningWorkspace';
import EvaluationModal from './EvaluationModal';
import { PROBLEM_CATEGORIES } from '../data/problems';
import { gradeSystemDesign, gradeRiddle } from '../utils/grading';

export default function ProblemWorkspace({
  problem, integrity, onSolve,
  hasAttempted, setHasAttempted,
  showEvaluation, setShowEvaluation,
  evaluationResults, setEvaluationResults,
  registerEvaluate, onCanEvaluateChange, onForfeit,
}) {
  const [canvasNodes, setCanvasNodes]       = useState([]);
  const [canvasConns, setCanvasConns]       = useState([]);
  const [justification, setJustification]   = useState('');
  const [reasoning, setReasoning]           = useState(['']);
  const [answer, setAnswer]                 = useState('');

  const isSysDesign = problem.category === PROBLEM_CATEGORIES.SYSTEM_DESIGN;

  // reset on problem change
  useEffect(() => {
    setCanvasNodes([]); setCanvasConns([]);
    setJustification(''); setReasoning(['']); setAnswer('');
    setShowEvaluation(false); setEvaluationResults(null);
  }, [problem.id, setShowEvaluation, setEvaluationResults]);

  // canvas-first gating
  const canEval = isSysDesign
    ? canvasNodes.length >= 2 && canvasConns.length >= 1
    : answer.trim().length > 0;

  useEffect(() => { onCanEvaluateChange(canEval); }, [canEval, onCanEvaluateChange]);

  // evaluate
  const evaluate = useCallback(() => {
    if (!canEval) return;
    const res = isSysDesign
      ? gradeSystemDesign(problem, canvasNodes, canvasConns, justification)
      : gradeRiddle(problem, answer, reasoning.join('\n'));
    setEvaluationResults(res);
    setShowEvaluation(true);
    setHasAttempted(true);
    onSolve(problem.id, res.score, integrity.status);
  }, [canEval, isSysDesign, problem, canvasNodes, canvasConns, justification, reasoning, answer,
      integrity.status, onSolve, setEvaluationResults, setShowEvaluation, setHasAttempted]);

  useEffect(() => { registerEvaluate(evaluate); }, [evaluate, registerEvaluate]);

  return (
    <div className="flex h-[calc(100vh-56px)]" onContextMenu={integrity.handleContextMenu}>
      {/* ── Left 40 % ── */}
      <div className="w-[40%] border-r border-nl-border overflow-hidden">
        <LeftPanel problem={problem} hasAttempted={hasAttempted} onForfeit={onForfeit} onCopy={integrity.handleCopy} />
      </div>

      {/* ── Right 60 % ── */}
      <div className="w-[60%] flex flex-col overflow-hidden">
        {isSysDesign ? (
          <>
            <div className="h-[65%] border-b border-nl-border overflow-hidden">
              <Canvas nodes={canvasNodes} setNodes={setCanvasNodes} connections={canvasConns} setConnections={setCanvasConns} />
            </div>
            <div className="h-[35%] flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-nl-border bg-nl-bg flex-shrink-0">
                <h3 className="text-sm font-semibold text-nl-text">Design Justification</h3>
                <p className="text-xs text-nl-muted mt-0.5">Explain your architectural decisions and trade-offs.</p>
              </div>
              <textarea value={justification}
                        onChange={e => setJustification(e.target.value)}
                        onPaste={integrity.handlePaste}
                        onKeyDown={() => integrity.recordKeystroke()}
                        placeholder="Explain why you chose these components and how they interact. Discuss trade-offs like scalability, consistency vs. availability, caching strategies…"
                        className="flex-1 w-full bg-nl-card p-4 text-sm text-nl-text placeholder-nl-muted focus:outline-none resize-none" />
            </div>
          </>
        ) : (
          <ReasoningWorkspace problem={problem}
                              reasoning={reasoning} setReasoning={setReasoning}
                              answer={answer} setAnswer={setAnswer}
                              onPaste={integrity.handlePaste}
                              onKeyDown={() => integrity.recordKeystroke()} />
        )}
      </div>

      {showEvaluation && (
        <EvaluationModal results={evaluationResults}
                         integrityStatus={integrity.status}
                         onClose={() => setShowEvaluation(false)}
                         onUnlockSolution={() => setShowEvaluation(false)} />
      )}
    </div>
  );
}
