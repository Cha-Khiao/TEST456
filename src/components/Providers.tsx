'use client';

import { SessionProvider } from 'next-auth/react';
import { SSRProvider } from 'react-bootstrap'; // ช่วยเรื่อง hydration ของ Bootstrap

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SSRProvider>
        {children}
      </SSRProvider>
    </SessionProvider>
  );
}