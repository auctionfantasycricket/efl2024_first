import { useState, useCallback } from 'react';

const STORAGE_KEY = 'afc_auction_shortcuts';
const DEFAULT_KEYS = '123456789abcdefghijklmnopqrstuvwxyz'.split('');

const buildDefaults = (teams) =>
  Object.fromEntries(teams.map((t, i) => [t, DEFAULT_KEYS[i] ?? '']));

export const useKeyboardShortcuts = (teams) => {
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return buildDefaults(teams);
  });

  const save = (next) => {
    setShortcuts(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const setShortcut = useCallback((teamName, key) => {
    setShortcuts(prev => {
      // Remove the key from any team that already has it
      const cleared = Object.fromEntries(
        Object.entries(prev).map(([t, k]) => [t, k === key && t !== teamName ? '' : k])
      );
      const next = { ...cleared, [teamName]: key };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetShortcuts = useCallback((teamNames) => {
    save(buildDefaults(teamNames));
  }, []);

  return { shortcuts, setShortcut, resetShortcuts };
};
