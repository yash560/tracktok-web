'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ChatBot } from '@/components/ChatBot';
import { CommandPalette } from '@/components/CommandPalette';
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function SplitGroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useKeyboardShortcuts({
    'mod+k': useCallback(() => setCommandPaletteOpen(true), []),
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-skin-base dark:bg-dark-bg text-skin-base">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="md:pl-64 flex flex-col min-h-screen">
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onSearchClick={() => setCommandPaletteOpen(true)}
          />

          <main className="flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>

        <ChatBot />
        <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
