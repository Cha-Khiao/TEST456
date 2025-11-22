// src/components/ClientLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. หน้า Fullscreen (Login, Admin) -> ไม่แสดง Navbar/Footer
  const isFullscreenPage = 
    pathname === '/auth/login' || 
    pathname?.startsWith('/admin');

  if (isFullscreenPage) {
     return <>{children}</>;
  }

  // 2. หน้า Custom Background (Success, Payment, Details) 
  // -> แสดง Navbar/Footer แต่ "ไม่ใช้" ธีมสีม่วง (.customer-layout)
  const isCustomBgPage = 
    pathname?.includes('/success') || 
    pathname?.includes('/payment/notify') || 
    pathname?.includes('/orders/details');

  if (isCustomBgPage) {
      return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            
            {/* ไม่ใส่ padding ที่นี่ เพราะในหน้า page.tsx เราใส่ paddingTop: 120px ไว้แล้ว */}
            <main className="flex-grow-1">
                {children}
            </main>
            
            <Footer />
        </div>
      );
  }

  // 3. หน้าลูกค้าทั่วไป (Home, Products, Dashboard) 
  // -> ใช้ธีมมาตรฐาน (.customer-layout) มีพื้นหลังฟุ้งๆ
  return (
    <div className="customer-layout">
      <div className="fixed-background"></div>

      <Navbar />
      
      {/* หน้าพวกนี้ไม่มี paddingTop ในตัวไฟล์ page.tsx จึงต้องใส่ padding ที่นี่ */}
      {/* ปรับเป็น 120px เพื่อหนี Navbar แบบ Floating */}
      <main className="flex-grow-1 position-relative z-1" style={{ paddingTop: '50px' }}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
}