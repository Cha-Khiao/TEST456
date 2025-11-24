'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaClipboardList, FaSignOutAlt, FaTshirt, FaChartBar, FaUserShield, FaExternalLinkAlt } from 'react-icons/fa';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  if (pathname === '/admin/login') return <>{children}</>;

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') router.replace('/admin/login');
    if (status === 'authenticated' && pathname === '/admin') router.replace('/admin/orders');
  }, [status, router, pathname]);

  if (status === 'loading') return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
            <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}}/>
            <p className="mt-3 text-muted small fw-bold">Loading Admin Panel...</p>
        </div>
    </div>
  );

  if (status === 'unauthenticated') return null;

  // @ts-ignore
  if (session?.user?.role !== 'admin') {
    return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
            <div className="bg-white p-5 rounded-4 shadow-sm text-center" style={{maxWidth: '400px'}}>
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                    <FaUserShield size={40} className="text-danger"/>
                </div>
                <h3 className="fw-bold text-dark mb-2">Access Denied</h3>
                <p className="text-muted mb-4">บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนจัดการระบบ</p>
                <Button variant="outline-danger" className="rounded-pill px-4" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
                    ออกจากระบบ
                </Button>
            </div>
        </div>
    );
  }

  const navItems = [
      { href: '/admin/orders', label: 'รายการคำสั่งซื้อ', icon: FaClipboardList },
      { href: '/admin/products', label: 'จัดการสินค้า', icon: FaTshirt },
      { href: '/admin/stock', label: 'จัดการสต็อก', icon: FaChartBar },
  ];

  return (
    <div className="d-flex min-vh-100 bg-light overflow-hidden font-sans">
      
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="bg-dark text-white d-none d-md-flex flex-column flex-shrink-0 p-3 shadow border-end border-secondary border-opacity-10" 
             style={{ width: '280px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', zIndex: 1000 }}>
        
        {/* Logo / Brand */}
        <div className="d-flex align-items-center mb-4 px-2 pt-2 pb-4 border-bottom border-secondary border-opacity-25">
           <div className="bg-primary p-2 rounded-3 me-3 shadow-sm d-flex align-items-center justify-content-center text-white">
              <FaUserShield size={20}/>
           </div>
           <div style={{lineHeight: '1.2'}}>
               <span className="fs-5 fw-bold d-block text-white">Admin Console</span>
               <span className="small text-white-50" style={{fontSize: '0.75rem'}}>Sisaket Charity</span>
           </div>
        </div>

        {/* Navigation Menu */}
        <ul className="nav nav-pills flex-column mb-auto gap-2">
          {navItems.map((item) => {
             const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
             return (
                 <li key={item.href} className="nav-item">
                    <Link 
                        href={item.href} 
                        className={`nav-link d-flex align-items-center gap-3 px-3 py-3 rounded-3 transition-all ${isActive ? 'bg-primary text-white shadow' : 'text-white-50 hover-bg-glass'}`}
                        style={{ fontWeight: isActive ? 600 : 400 }}
                    >
                        <item.icon size={18} className={isActive ? 'text-white' : 'text-white-50'} />
                        {item.label}
                    </Link>
                 </li>
             );
          })}
        </ul>
        
        {/* Preview Store Button */}
        <div className="py-4 border-top border-secondary border-opacity-25 mt-3">
            <a href="/" target="_blank" rel="noopener noreferrer" 
               className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 text-white shadow-sm fw-bold hover-scale"
               style={{background: 'linear-gradient(90deg, #0ea5e9, #2563eb)', border: 'none'}}>
                 <FaExternalLinkAlt size={14}/> ดูหน้าร้านค้า
            </a>
        </div>

        {/* Footer User Profile */}
        <div className="pt-4 border-top border-secondary border-opacity-25">
            <div className="d-flex align-items-center px-2 mb-3">
                <div className="rounded-circle bg-gradient-secondary p-2 me-2 text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                     style={{width: 40, height: 40, background: '#334155'}}>
                    {/* @ts-ignore */}
                    {session?.user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="overflow-hidden">
                    {/* @ts-ignore */}
                    <small className="d-block fw-bold text-truncate text-white">{session?.user?.name}</small>
                    <small className="d-block text-success" style={{fontSize: '0.7rem'}}>● Online</small>
                </div>
            </div>
            <Button 
                variant="outline-danger" 
                className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 text-white-50 border-secondary border-opacity-25 hover-text-white hover-border-danger"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
            >
                <FaSignOutAlt /> Sign Out
            </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow-1 d-flex flex-column h-100" style={{maxHeight: '100vh', overflowY: 'auto', backgroundColor: '#f8fafc'}}>
         
         {/* Mobile Header */}
         <div className="d-md-none bg-dark text-white p-3 d-flex justify-content-between align-items-center shadow-sm sticky-top">
             <span className="fw-bold d-flex align-items-center gap-2"><FaUserShield/> Admin Panel</span>
             
             <div className="d-flex gap-3 align-items-center">
                {/* Mobile Preview Link */}
                <a href="/" target="_blank" className="text-white opacity-75"><FaExternalLinkAlt/></a>
                <div className="vr bg-white opacity-25"></div>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className={`text-white ${pathname?.startsWith(item.href) ? 'opacity-100' : 'opacity-50'}`}>
                        <item.icon size={20}/>
                    </Link>
                ))}
                <div className="vr bg-white opacity-25"></div>
                <Button variant="link" className="text-danger p-0" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
                    <FaSignOutAlt />
                </Button>
             </div>
         </div>

         <div className="p-4 p-lg-5">
            {children}
         </div>
      </main>
    </div>
  );
}