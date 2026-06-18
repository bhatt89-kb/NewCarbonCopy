import { useState, useCallback } from 'react';
import { calculateFootprint, generateInsights, saveEntry, getHistory, clearHistory } from '../engine';

export function useFootprint() {
  const [result, setResult] = useState(null);
  const [lastInput, setLastInput] = useState(null);
  const [insights, setInsights] = useState(null);
  const [entries, setEntries] = useState(() => getHistory());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const calculate = useCallback((input) => {
    setLoading(true);
    setStatus('');
    try {
      const calc = calculateFootprint(input);
      const ins = generateInsights(input, calc);
      setResult(calc);
      setInsights(ins);
      setLastInput(input);
      setStatus('Your footprint results and personalized insights are ready.');
      return { success: true };
    } catch {
      setStatus('Error calculating footprint.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setInsights(null);
    setLastInput(null);
    setStatus('');
  }, []);

  const save = useCallback(() => {
    if (!result || !lastInput) return false;
    try {
      const entry = saveEntry(lastInput, result);
      setEntries(prev => [entry, ...prev.filter(e => e.id !== entry.id)].slice(0, 50));
      return true;
    } catch {
      return false;
    }
  }, [result, lastInput]);

  const refreshHistory = useCallback(() => {
    setEntries(getHistory());
  }, []);

  const clearAll = useCallback(() => {
    clearHistory();
    setEntries([]);
  }, []);

  return { result, insights, entries, loading, status, calculate, save, reset, refreshHistory, clearAll };
}
