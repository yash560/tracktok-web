'use client';

import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

      if (e.key === 'Escape') {
        shortcuts['Escape']?.();
        return;
      }

      const key = [
        e.ctrlKey || e.metaKey ? 'mod' : '',
        e.shiftKey ? 'shift' : '',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+');

      // Allow mod+ shortcuts even when focused on inputs
      if (key.startsWith('mod+') && shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
        return;
      }

      if (isInput) return;

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }

      if (shortcuts[e.key]) {
        e.preventDefault();
        shortcuts[e.key]();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
