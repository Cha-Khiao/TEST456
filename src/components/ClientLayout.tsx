// src/components/ClientLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ✅ รวมทุกหน้าที่ไม่ต้องการ Navbar/Footer ไว้ตรงนี้
  const isFullscreenPage = 
    pathname === '/auth/login' || 
    pathname?.startsWith('/admin') ||
    pathname?.includes('/orders/success') ||
    pathname?.includes('/payment/notify') ||
    pathname?.includes('/orders/details'); // 👈 เพิ่มบรรทัดนี้ครับ

  // ถ้าเป็นหน้า Fullscreen ให้แสดงแค่เนื้อหาเพียวๆ
  if (isFullscreenPage) {
     return <>{children}</>;
  }

  // หน้าลูกค้าทั่วไป (Home, Products, Dashboard, Cart)
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