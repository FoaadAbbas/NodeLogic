import React, { useState, useRef, useCallback } from 'react';
import TopNav from './components/TopNav';
import Home from './components/Home';
import ProblemWorkspace from './components/ProblemWorkspace';
import Toast from './components/Toast';
import { problems } from './data/problems';
import { useTimer } from './hooks/useTimer';
import { useIntegrity } from './hooks/useIntegrity';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [view, setView]             = useState('home');
  const [problemId, setProblemId]   = useState(null);
  const [solved, setSolved]         = useLocalStorage('nl-solved', {});
  const [pIntegrity, setPIntegrity] = useLocalStorage('nl-integrity', {});
  const [canEval, setCanEval]       = useState(false);
  const [attempted, setAttempted]   = useState(false);
  const [showEval, setShowEval]     = useState(false);
  const [evalRes, setEvalRes]       = useState(null);

  const timer     = useTimer();
  const integrity = useIntegrity();
  const evalRef   = useRef(null);

  const current = problems.find(p => p.id === problemId);

  const selectProblem = useCallback(id => {
    setProblemId(id); setView('problem');
    setAttempted(false); setShowEval(false); setEvalRes(null);
    timer.reset(); timer.start();
    integrity.resetIntegrity(); integrity.activate();
  }, [timer, integrity]);

  const goHome = useCallback(() => {
    setView('home'); setProblemId(null);
    timer.pause(); integrity.deactivate();
  }, [timer, integrity]);

  const onSolve = useCallback((id, score, status) => {
    setSolved(p => ({ ...p, [id]: { score, ts: Date.now() } }));
    setPIntegrity(p => ({ ...p, [id]: status }));
  }, [setSolved, setPIntegrity]);

  const onForfeit = useCallback(() => {
    if (problemId) setSolved(p => ({ ...p, [problemId]: { score: 0, forfeited: true, ts: Date.now() } }));
  }, [problemId, setSolved]);

  return (
    <div className="h-screen flex flex-col bg-nl-bg">
      <TopNav currentProblem={current} problems={problems}
              onSelectProblem={selectProblem} onGoHome={goHome}
              timer={timer} integrityStatus={integrity.status}
              onEvaluate={() => evalRef.current?.()} canEvaluate={canEval}
              showProblemNav={view === 'problem'} />

      {view === 'home' ? (
        <Home problems={problems} solvedProblems={solved} problemIntegrity={pIntegrity} onSelectProblem={selectProblem} />
      ) : current ? (
        <ProblemWorkspace problem={current} integrity={integrity}
                          onSolve={onSolve}
                          hasAttempted={attempted} setHasAttempted={setAttempted}
                          showEvaluation={showEval} setShowEvaluation={setShowEval}
                          evaluationResults={evalRes} setEvaluationResults={setEvalRes}
                          registerEvaluate={fn => { evalRef.current = fn; }}
                          onCanEvaluateChange={setCanEval}
                          onForfeit={onForfeit} />
      ) : null}

      <Toast toasts={integrity.toasts} onDismiss={id => integrity.setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  );
}
