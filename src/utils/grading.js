/* ─────────────────────────────────────────
   grading.js  –  Automated evaluation engine
   ───────────────────────────────────────── */

export function gradeSystemDesign(problem, canvasNodes, canvasConnections, justification) {
  const results = {
    score: 0,
    maxScore: 100,
    nodeScore: 0,
    connectionScore: 0,
    conceptScore: 0,
    missingNodes: [],
    missingConnections: [],
    missingConcepts: [],
    feedback: [],
  };

  // ── Nodes (40 pts) ──
  const placedTypes = canvasNodes.map(n => n.type);
  const requiredNodes = problem.requiredNodes || [];
  let nodeHits = 0;

  for (const req of requiredNodes) {
    if (placedTypes.includes(req)) {
      nodeHits++;
    } else {
      results.missingNodes.push(req);
    }
  }
  if (requiredNodes.length > 0) {
    results.nodeScore = Math.round((nodeHits / requiredNodes.length) * 40);
  }

  // ── Connections (30 pts) ──
  const requiredConns = problem.requiredConnections || [];
  let connHits = 0;

  for (const rc of requiredConns) {
    const found = canvasConnections.some(c => {
      const fromNode = canvasNodes.find(n => n.id === c.from);
      const toNode   = canvasNodes.find(n => n.id === c.to);
      return fromNode && toNode && fromNode.type === rc.from && toNode.type === rc.to;
    });
    if (found) connHits++;
    else results.missingConnections.push(`${rc.from} → ${rc.to}`);
  }
  if (requiredConns.length > 0) {
    results.connectionScore = Math.round((connHits / requiredConns.length) * 30);
  }

  // ── Key concepts in justification (30 pts) ──
  const keyConcepts = problem.keyConcepts || [];
  const justLower = (justification || '').toLowerCase();
  let conceptHits = 0;

  for (const concept of keyConcepts) {
    if (justLower.includes(concept.toLowerCase())) conceptHits++;
    else results.missingConcepts.push(concept);
  }
  if (keyConcepts.length > 0) {
    results.conceptScore = Math.round((conceptHits / keyConcepts.length) * 30);
  }

  // Bonus for extra nodes (up to 10)
  const extra = canvasNodes.length - requiredNodes.length;
  const bonus = Math.min(extra > 0 ? extra * 2 : 0, 10);

  results.score = Math.min(results.nodeScore + results.connectionScore + results.conceptScore + bonus, 100);

  // Feedback
  if (results.missingNodes.length)       results.feedback.push(`Missing components: ${results.missingNodes.join(', ')}`);
  if (results.missingConnections.length)  results.feedback.push(`Missing connections: ${results.missingConnections.join(', ')}`);
  if (results.missingConcepts.length)     results.feedback.push(`Key concepts not addressed: ${results.missingConcepts.join(', ')}`);
  if (canvasNodes.length < 3)             results.feedback.push('Your architecture seems incomplete. Try adding more components.');
  if (!justification || justification.length < 50) results.feedback.push('Please provide a more detailed explanation of your design decisions.');

  return results;
}

export function gradeRiddle(problem, answer, reasoning) {
  const results = {
    score: 0,
    maxScore: 100,
    answerScore: 0,
    reasoningScore: 0,
    feedback: [],
    isCorrect: false,
  };

  // ── Answer (50 pts) ──
  if (problem.answerType === 'numeric') {
    const num = parseFloat(answer);
    if (problem.answer.exact !== undefined) {
      if (num === problem.answer.exact) {
        results.answerScore = 50;
        results.isCorrect = true;
      } else if (Math.abs(num - problem.answer.exact) <= 1) {
        results.answerScore = 30;
        results.feedback.push(`Close! The exact answer is ${problem.answer.exact}.`);
      } else {
        results.feedback.push(`Incorrect. The correct answer is ${problem.answer.exact}.`);
      }
    } else if (problem.answer.min !== undefined) {
      if (num >= problem.answer.min && num <= problem.answer.max) {
        results.answerScore = 50;
        results.isCorrect = true;
      } else if (num >= problem.answer.min * 0.5 && num <= problem.answer.max * 2) {
        results.answerScore = 25;
        results.feedback.push(`Your answer is in the right ballpark but outside the expected range (${problem.answer.min}–${problem.answer.max} ${problem.answer.unit || ''}).`);
      } else {
        results.feedback.push(`Your estimate is significantly off. Expected range: ${problem.answer.min}–${problem.answer.max} ${problem.answer.unit || ''}.`);
      }
    }
  } else if (problem.answerType === 'text') {
    const low = (answer || '').toLowerCase();
    const kw  = problem.answerKeywords || [];
    const hits = kw.filter(k => low.includes(k.toLowerCase())).length;
    if (hits >= 2) { results.answerScore = 50; results.isCorrect = true; }
    else if (hits >= 1) { results.answerScore = 25; results.feedback.push('Your answer touches on the right idea but could be more specific.'); }
    else { results.feedback.push('Your answer doesn\'t seem to match the expected solution.'); }
  }

  // ── Reasoning (50 pts) ──
  const rLow = (reasoning || '').toLowerCase();
  const steps = problem.keyReasoningSteps || [];
  let stepHits = 0;

  for (const step of steps) {
    const words = step.toLowerCase().split(' ').filter(w => w.length > 3);
    const matched = words.filter(w => rLow.includes(w)).length;
    if (matched >= words.length * 0.4) stepHits++;
  }
  if (steps.length > 0) {
    results.reasoningScore = Math.round((stepHits / steps.length) * 50);
  }
  if (reasoning && reasoning.length < 30) {
    results.feedback.push('Please provide more detailed reasoning for your answer.');
    results.reasoningScore = Math.min(results.reasoningScore, 10);
  }

  results.score = results.answerScore + results.reasoningScore;
  return results;
}
