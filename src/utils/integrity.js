/* ─────────────────────────────────────────
   integrity.js  –  Anti-AI integrity helpers
   ───────────────────────────────────────── */

export const INTEGRITY_STATUS = {
  CLEAN:   'clean',
  WARNING: 'warning',
  FLAGGED: 'flagged',
};

export function getIntegrityLabel(status) {
  switch (status) {
    case INTEGRITY_STATUS.CLEAN:   return 'Verified Human Attempt';
    case INTEGRITY_STATUS.WARNING: return 'Warning — Suspicious Activity';
    case INTEGRITY_STATUS.FLAGGED: return 'Flagged — Integrity Violation';
    default:                       return 'Unknown';
  }
}

export function getIntegrityColor(status) {
  switch (status) {
    case INTEGRITY_STATUS.CLEAN:   return '#10B981';
    case INTEGRITY_STATUS.WARNING: return '#F59E0B';
    case INTEGRITY_STATUS.FLAGGED: return '#EF4444';
    default:                       return '#9CA3AF';
  }
}

/** Analyse the last N keystroke timestamps for burst / robotic input. */
export function analyzeKeystrokeCadence(keyTimestamps) {
  if (keyTimestamps.length < 10) return { suspicious: false };

  const intervals = [];
  for (let i = 1; i < keyTimestamps.length; i++) {
    intervals.push(keyTimestamps[i] - keyTimestamps[i - 1]);
  }

  const recent = intervals.slice(-20);
  const avg    = recent.reduce((a, b) => a + b, 0) / recent.length;

  // Burst: average interval < 20 ms → paste / script
  if (avg < 20 && recent.length >= 10) {
    return { suspicious: true, reason: 'Burst input detected — unusually fast typing speed' };
  }

  // Robotic: very low standard deviation
  const mean     = recent.reduce((a, b) => a + b, 0) / recent.length;
  const variance = recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length;
  const stdDev   = Math.sqrt(variance);

  if (stdDev < 10 && recent.length >= 15 && mean < 100) {
    return { suspicious: true, reason: 'Robotic typing pattern — unusually uniform intervals' };
  }

  return { suspicious: false };
}
