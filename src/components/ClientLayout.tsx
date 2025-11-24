'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isFullscreenPage = 
    pathname === '/auth/login' || 
    pathname?.startsWith('/admin') ||
    pathname?.includes('/orders/success') ||
    pathname?.includes('/payment/notify') ||
    pathname?.includes('/orders/details'); 

  if (isFullscreenPage) {
     return <>{children}</>;
  }

  return (
    <div className="customer-layout">
      <div className="fixed-background"></div>
      <Navbar />
      <main className="flex-grow-1 position-relative z-1" style={{ paddingTop: '50px' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}