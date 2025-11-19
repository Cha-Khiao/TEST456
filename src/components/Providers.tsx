// src/components/Providers.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
// ❌ ลบ import { SSRProvider } ออก

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
       {/* ❌ ลบ <SSRProvider> ที่ครอบไว้ออก ให้เหลือแค่ children เพียวๆ */}
        {children}
    </SessionProvider>
  );
}