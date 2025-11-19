// src/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Navbar as BSNavbar, Nav, Dropdown, Button, Offcanvas, Badge } from 'react-bootstrap';
import { 
  FaHistory, FaSignOutAlt, FaSignInAlt, 
  FaStore, FaHome, FaBars, FaTimes, FaMoneyBillWave, FaChevronRight
} from 'react-icons/fa';
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  
  const isLoggedIn = !!session;
  const userImage = session?.user?.image;

  // 🛠️ แก้ไข Logic ชื่อตรงนี้:
  // 1. ถ้ามี ID (เบอร์โทร) ให้ใช้เบอร์โทรเป็นชื่อเลย
  // 2. ถ้าไม่มี ให้ใช้ชื่อ User ถ้าไม่มีอีก ให้ใช้ "User"
  // @ts-ignore
  const userId = session?.user?.id; // เบอร์โทรที่เราฝากไว้ใน id
  
  let displayName = "User";
  // 👇 ลบ Logic ซับซ้อนเดิมออก แล้วใช้แบบนี้แทนครับ
  if (session?.user?.name) {
      displayName = session.user.name; // จะเป็นเบอร์โทร หรือ ชื่อ Google อัตโนมัติ
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/auth/login') return null;
  const handleClose = () => setShowMobile(false);

  return (
    <>
      <style jsx global>{`
        /* CSS เดิมของ Floating Navbar (คงไว้) */
        .nav-floating {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 95%;
          max-width: 1200px;
          z-index: 1030;
          border-radius: 16px;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        .nav-floating.scrolled {
          top: 10px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
        .nav-link-custom {
          font-weight: 500;
          color: #475569 !important;
          padding: 0.5rem 1rem !important;
          border-radius: 12px;
          transition: all 0.2s;
          margin: 0 2px;
        }
        .nav-link-custom:hover {
          color: #4F46E5 !important;
          background: rgba(79, 70, 229, 0.06);
        }
        .nav-link-custom.active {
          color: #4F46E5 !important;
          background: rgba(79, 70, 229, 0.1);
          font-weight: 600;
        }
        .profile-toggle {
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .profile-toggle:hover {
          background: rgba(0,0,0,0.03);
          border-color: rgba(0,0,0,0.05);
        }
      `}</style>

      <BSNavbar 
        expand="lg" 
        className={`nav-floating py-3 ${scrolled ? 'scrolled' : ''}`}
      >
        <Container>
          
          {/* Logo */}
          <BSNavbar.Brand as={Link} href="/" className="d-flex align-items-center gap-2 z-2">
              <div className="d-flex position-relative">
                 <div className="bg-white rounded-circle p-1 shadow-sm position-relative z-1 border border-light">
                    <Image src="/images/100.png" alt="Logo" width={38} height={38} className="rounded-circle" />
                 </div>
                 <div className="bg-white rounded-circle p-1 shadow-sm position-relative border border-light" style={{marginLeft: '-12px'}}>
                    <Image src="/images/200.png" alt="Logo" width={38} height={38} className="rounded-circle" />
                 </div>
              </div>
              <div className="lh-1 d-flex flex-column ms-2">
                 <span className="fw-bold text-dark" style={{letterSpacing: '-0.5px', fontSize: '1rem'}}>YEC SISAKET</span>
                 <span className="text-muted small" style={{fontSize: '0.65rem'}}>Charity Shop</span>
              </div>
          </BSNavbar.Brand>

          {/* Center Menu (Hidden if not logged in) */}
          <div className="d-none d-lg-flex position-absolute start-50 translate-middle-x">
             {isLoggedIn && (
               <div className="d-flex gap-1 bg-secondary bg-opacity-10 p-1 rounded-4">
                 <Link href="/" className={`nav-link nav-link-custom d-flex align-items-center gap-2 ${pathname === '/' ? 'active' : ''}`}>
                    <FaHome size={14} className="mb-1"/> หน้าแรก
                 </Link>
                 <Link href="/products" className={`nav-link nav-link-custom d-flex align-items-center gap-2 ${pathname.startsWith('/products') ? 'active' : ''}`}>
                    <FaStore size={14} className="mb-1"/> สินค้า
                 </Link>
                 <Link href="/dashboard" className={`nav-link nav-link-custom d-flex align-items-center gap-2 ${pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                    <FaHistory size={14} className="mb-1"/> ประวัติ
                 </Link>
               </div>
             )}
          </div>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-2 z-2 ms-auto">
            
            {isLoggedIn ? (
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="profile-toggle d-flex align-items-center gap-2 cursor-pointer p-1 pe-3 rounded-pill" style={{cursor: 'pointer'}}>
                   <div className="position-relative">
                      {userImage ? (
                        <Image src={userImage} alt="Profile" width={36} height={36} className="rounded-circle border" />
                      ) : (
                        <div className="bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                             style={{width:36, height:36, background: 'linear-gradient(135deg, #6f6af8, #a855f7)'}}>
                           {/* ใช้อักษรตัวแรกของชื่อที่แก้แล้ว */}
                           <span className="fw-bold small">{displayName.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <span className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle" style={{width:10, height:10}}></span>
                   </div>
                   <div className="d-none d-md-block text-start" style={{lineHeight: '1.1'}}>
                      {/* แสดงชื่อ User หรือ เบอร์โทร */}
                      <span className="fw-bold text-dark d-block" style={{fontSize: '0.85rem'}}>{displayName}</span>
                      <span className="text-muted" style={{fontSize: '0.65rem'}}>สมาชิกทั่วไป</span>
                   </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="border-0 shadow-lg rounded-4 mt-3 p-2 animate-slide-down" style={{minWidth: '200px'}}>
                   <div className="px-3 py-2 bg-light rounded-3 mb-2">
                      <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>เข้าสู่ระบบแล้ว</small>
                      <div className="fw-bold text-truncate text-primary">{displayName}</div>
                   </div>
                   <Dropdown.Item as={Link} href="/dashboard" className="rounded-3 py-2 d-flex align-items-center gap-2">
                      <FaHistory className="text-secondary"/> ประวัติการสั่งซื้อ
                   </Dropdown.Item>
                   <Dropdown.Divider className="my-1"/>
                   <Dropdown.Item onClick={() => signOut({callbackUrl: '/'})} className="rounded-3 py-2 text-danger d-flex align-items-center gap-2">
                      <FaSignOutAlt /> ออกจากระบบ
                   </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-none d-lg-block">
                <Link href="/auth/login">
                  <Button className="rounded-pill px-4 py-2 fw-bold shadow-sm border-0 btn-gradient-primary hover-lift" 
                          style={{background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)', fontSize: '0.9rem'}}>
                     <FaSignInAlt className="me-2"/> เข้าสู่ระบบ
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <Button variant="light" className="d-lg-none rounded-circle p-2 text-secondary bg-light border-0" onClick={() => setShowMobile(true)}>
               <FaBars size={20}/>
            </Button>

          </div>
        </Container>
      </BSNavbar>

      {/* Mobile Offcanvas */}
      <Offcanvas show={showMobile} onHide={handleClose} placement="end" className="border-0 rounded-start-4" style={{maxWidth: '85vw'}}>
        <Offcanvas.Header className="justify-content-between p-4 border-bottom">
          <div className="d-flex align-items-center gap-2">
             <span className="fw-bold fs-5 text-primary">เมนูหลัก</span>
          </div>
          <Button variant="light" onClick={handleClose} className="rounded-circle p-2 text-secondary">
             <FaTimes size={20}/>
          </Button>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="px-4 pt-3 d-flex flex-column h-100">
           {isLoggedIn ? (
             <div className="d-flex flex-column gap-2 mb-auto">
                <Link href="/" onClick={handleClose} className={`mobile-menu-link ${pathname === '/' ? 'active' : ''}`}>
                   <div className="d-flex align-items-center gap-3"><FaHome className="text-secondary"/> หน้าแรก</div>
                   <FaChevronRight size={12} className="opacity-25"/>
                </Link>
                <Link href="/products" onClick={handleClose} className={`mobile-menu-link ${pathname.startsWith('/products') ? 'active' : ''}`}>
                   <div className="d-flex align-items-center gap-3"><FaStore className="text-secondary"/> เลือกซื้อสินค้า</div>
                   <FaChevronRight size={12} className="opacity-25"/>
                </Link>
                <Link href="/dashboard" onClick={handleClose} className={`mobile-menu-link ${pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                   <div className="d-flex align-items-center gap-3"><FaHistory className="text-secondary"/> ประวัติการสั่งซื้อ</div>
                   <Badge bg="danger" pill>New</Badge>
                </Link>
             </div>
           ) : (
             <div className="text-center py-5 my-auto opacity-50">
                <FaSignInAlt size={40} className="mb-3"/>
                <p>กรุณาเข้าสู่ระบบเพื่อดูเมนู</p>
             </div>
           )}

           <div className="pb-4 mt-4 border-top pt-4">
              {isLoggedIn ? (
                <Button variant="outline-danger" onClick={() => signOut({callbackUrl: '/'})} className="w-100 py-3 rounded-4 fw-bold d-flex align-items-center justify-content-center gap-2">
                   <FaSignOutAlt /> ออกจากระบบ
                </Button>
              ) : (
                <Link href="/auth/login" onClick={handleClose} className="w-100">
                   <Button className="w-100 py-3 rounded-4 fw-bold btn-gradient-primary border-0 shadow-lg d-flex align-items-center justify-content-center gap-2" style={{background: 'linear-gradient(135deg, #4F46E5 0%, #7c3aed 100%)'}}>
                      <FaSignInAlt /> เข้าสู่ระบบ
                   </Button>
                </Link>
              )}
           </div>
        </Offcanvas.Body>
      </Offcanvas>

      <style jsx global>{`
        .mobile-menu-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem; border-radius: 12px;
          color: #334155; text-decoration: none; font-weight: 600;
          background: #f8fafc; margin-bottom: 0.5rem; transition: all 0.2s;
        }
        .mobile-menu-link:active { transform: scale(0.98); }
        .mobile-menu-link.active { background: #eef2ff; color: #4F46E5; border: 1px solid #e0e7ff; }
      `}</style>
    </>
  );
}