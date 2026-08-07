import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [pointer, setPointer] = useState<number>(0);

  const set = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const nextState = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
      
      if (JSON.stringify(prev) === JSON.stringify(nextState)) return prev;

      setHistory((prevHistory) => {
        const newHistory = prevHistory.slice(0, pointer + 1);
        return [...newHistory, nextState];
      });
      setPointer((p) => p + 1);
      
      return nextState;
    });
  }, [pointer]);

  const undo = useCallback(() => {
    if (pointer > 0) {
      setPointer((p) => p - 1);
      setState(history[pointer - 1]);
    }
  }, [history, pointer]);

  const redo = useCallback(() => {
    if (pointer < history.length - 1) {
      setPointer((p) => p + 1);
      setState(history[pointer + 1]);
    }
  }, [history, pointer]);

  const reset = useCallback((toState: T = initialState) => {
    setState(toState);
    setHistory([toState]);
    setPointer(0);
  }, [initialState]);

  const replace = useCallback((value: T | ((prev: T) => T)) => {
    setState(value);
  }, []);

  const commit = useCallback(() => {
    setState((curr) => {
      setHistory((prevHistory) => {
        const last = prevHistory[pointer];
        if (JSON.stringify(last) === JSON.stringify(curr)) return prevHistory;
        const newHistory = prevHistory.slice(0, pointer + 1);
        return [...newHistory, curr];
      });
      setPointer((p) => p + 1);
      return curr;
    });
  }, [pointer]);

  return {
    state,
    set,
    replace,
    commit,
    undo,
    redo,
    reset,
    canUndo: pointer > 0,
    canRedo: pointer < history.length - 1,
  };
}
