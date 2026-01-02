'use client';

import { AppProvider } from '@/context/AppContext';
import { Toaster } from '@/components/ui/sonner';

export default function Providers({ children }) {
  return (
    <AppProvider>
      {children}
      <Toaster />
    </AppProvider>
  );
}
