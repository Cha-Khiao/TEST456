// src/app/admin/layout.tsx
'use client';

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Container, Row, Col, Nav, Button, Spinner } from 'react-bootstrap';
import { FaBoxOpen, FaClipboardList, FaSignOutAlt, FaTshirt, FaChartBar } from 'react-icons/fa';

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

  if (status === 'loading') return <div className="vh-100 d-flex justify-content-center align-items-center"><Spinner animation="border"/></div>;
  if (status === 'unauthenticated') return null;
  // @ts-ignore
  if (session?.user?.role !== 'admin') {
    return <div className="vh-100 d-flex flex-column justify-content-center align-items-center"><h3>Access Denied</h3><Button onClick={() => signOut({ callbackUrl: '/admin/login' })}>Logout</Button></div>;
  }

  return (
    <Container fluid className="min-vh-100 p-0 bg-light">
      <Row className="g-0">
        <Col md={2} className="bg-dark min-vh-100 p-3 text-white d-none d-md-block sticky-top">
           <div className="mb-4 px-2 pt-2">
               <h5 className="fw-bold mb-0">Admin Panel</h5>
           </div>
           <Nav className="flex-column gap-2">
              <Link href="/admin/orders" className={`nav-link rounded px-3 d-flex align-items-center gap-2 text-white ${pathname?.includes('/orders') ? 'bg-primary' : 'hover-bg-secondary'}`}>
                 <FaClipboardList /> รายการออร์เดอร์
              </Link>
              
              <hr className="border-secondary my-2"/>
              
              {/* ✅ แก้ไขชื่อตรงนี้เป็น "สินค้า" */}
              <Link href="/admin/products" className={`nav-link rounded px-3 d-flex align-items-center gap-2 text-white ${pathname === '/admin/products' || pathname?.includes('/products/') ? 'bg-primary' : 'hover-bg-secondary'}`}>
                 <FaTshirt /> สินค้า
              </Link>

              <Link href="/admin/stock" className={`nav-link rounded px-3 d-flex align-items-center gap-2 text-white ${pathname?.includes('/stock') ? 'bg-warning text-dark fw-bold' : 'hover-bg-secondary'}`}>
                 <FaChartBar /> จัดการสต็อก
              </Link>
           </Nav>
           <div className="mt-auto pt-4">
              <Button variant="outline-danger" size="sm" className="w-100" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
                 <FaSignOutAlt className="me-2"/> ออกจากระบบ
              </Button>
           </div>
        </Col>
        <Col md={10} className="bg-light p-4" style={{minHeight: '100vh'}}>
            {children}
        </Col>
      </Row>
    </Container>
  );
}