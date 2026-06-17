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

  const save = useCallback(() => {
    if (!result || !lastInput) return false;
    try {
      saveEntry(lastInput, result);
      setEntries(getHistory());
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

  return { result, insights, entries, loading, status, calculate, save, refreshHistory, clearAll };
}
