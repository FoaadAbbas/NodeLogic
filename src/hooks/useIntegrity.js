import { useState, useEffect, useCallback, useRef } from 'react';
import { INTEGRITY_STATUS, analyzeKeystrokeCadence } from '../utils/integrity';

export function useIntegrity() {
  const [status, setStatus]           = useState(INTEGRITY_STATUS.CLEAN);
  const [tabSwitchCount, setTabCount] = useState(0);
  const [copyAttempts, setCopy]       = useState(0);
  const [pasteAttempts, setPaste]     = useState(0);
  const [violations, setViolations]   = useState([]);
  const [toasts, setToasts]           = useState([]);

  const keyTsRef   = useRef([]);
  const activeRef  = useRef(false);

  /* ── helpers ── */
  const addViolation = useCallback((type, message) => {
    setViolations(p => [...p, { type, message, ts: Date.now() }]);
  }, []);

  const showToast = useCallback((message, type = 'warning') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const activate   = useCallback(() => { activeRef.current = true;  }, []);
  const deactivate = useCallback(() => { activeRef.current = false; }, []);

  const resetIntegrity = useCallback(() => {
    setStatus(INTEGRITY_STATUS.CLEAN);
    setTabCount(0); setCopy(0); setPaste(0);
    setViolations([]); keyTsRef.current = [];
  }, []);

  /* ── tab / visibility ── */
  useEffect(() => {
    const onVis = () => {
      if (!activeRef.current || !document.hidden) return;
      setTabCount(prev => {
        const n = prev + 1;
        if (n === 1) {
          addViolation('tab-switch', 'Tab switch detected');
          showToast('⚠️ Tab switch detected. Multiple switches will flag your attempt.', 'warning');
          setStatus(INTEGRITY_STATUS.WARNING);
        } else if (n >= 2) {
          addViolation('tab-switch', 'Multiple tab switches — flagged');
          showToast('🚫 Multiple tab switches detected. Attempt flagged.', 'error');
          setStatus(INTEGRITY_STATUS.FLAGGED);
        }
        return n;
      });
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [addViolation, showToast]);

  /* ── copy / cut ── */
  const handleCopy = useCallback(e => {
    if (!activeRef.current) return;
    e.preventDefault();
    setCopy(p => p + 1);
    addViolation('copy-attempt', 'Attempted to copy problem text');
    showToast('📋 Copying problem text is disabled to ensure authentic problem-solving.', 'warning');
  }, [addViolation, showToast]);

  /* ── paste ── */
  const handlePaste = useCallback(e => {
    if (!activeRef.current) return;
    e.preventDefault();
    setPaste(p => {
      if (p + 1 >= 2) setStatus(s => s === INTEGRITY_STATUS.FLAGGED ? s : INTEGRITY_STATUS.WARNING);
      return p + 1;
    });
    addViolation('paste-attempt', 'Attempted to paste in answer area');
    showToast('📋 Direct pasting is disabled to ensure authentic problem-solving.', 'warning');
    return false;
  }, [addViolation, showToast]);

  /* ── context menu ── */
  const handleContextMenu = useCallback(e => {
    if (!activeRef.current) return;
    e.preventDefault();
    showToast('🔒 Right-click menu is disabled during problem-solving.', 'info');
  }, [showToast]);

  /* ── keystroke cadence ── */
  const recordKeystroke = useCallback(() => {
    if (!activeRef.current) return;
    keyTsRef.current.push(Date.now());
    if (keyTsRef.current.length > 50) keyTsRef.current = keyTsRef.current.slice(-50);

    if (keyTsRef.current.length % 20 === 0) {
      const a = analyzeKeystrokeCadence(keyTsRef.current);
      if (a.suspicious) {
        addViolation('keystroke-anomaly', a.reason);
        showToast(`⚠️ ${a.reason}`, 'warning');
        setStatus(s => s === INTEGRITY_STATUS.CLEAN ? INTEGRITY_STATUS.WARNING : s);
      }
    }
  }, [addViolation, showToast]);

  return {
    status, tabSwitchCount, copyAttempts, pasteAttempts, violations, toasts, setToasts,
    activate, deactivate, resetIntegrity,
    handleCopy, handlePaste, handleContextMenu, recordKeystroke,
  };
}
