'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Navbar as BSNavbar, Dropdown, Button, Offcanvas, Badge } from 'react-bootstrap';
import { 
  FaHistory, FaSignOutAlt, FaSignInAlt, 
  FaStore, FaHome, FaBars, FaTimes, FaChevronRight,
  FaShoppingCart, FaUserCircle
} from 'react-icons/fa';
import { useSession, signOut } from "next-auth/react";
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cartCount } = useCart();
  
  const [scrolled, setScrolled] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  
  const isLoggedIn = !!session;
  
  // @ts-ignore
  const role = session?.user?.role || 'user';
  let displayName = "User";
  if (session?.user?.name) {
      displayName = session.user.name;
  }

  // Logic รูปโปรไฟล์
  // 1. ถ้ามีรูปจริง (Google) ให้ใช้รูปนั้น
  // 2. ถ้าไม่มี (Login เบอร์โทร) ให้เจนรูปการ์ตูนจาก DiceBear โดยใช้เบอร์โทรเป็น Seed
  const userImage = session?.user?.image || `https://api.dicebear.com/9.x/notionists/svg?seed=${displayName}&backgroundColor=c0aede,d1d4f9,b6e3f4,ffd5dc,ffdfbf`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/auth/login' || pathname === '/admin/login') return null;
  const handleClose = () => setShowMobile(false);

  return (
    <>
      <style jsx global>{`
        .nav-floating {
          position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
          width: 95%; max-width: 1200px; z-index: 1030;
          border-radius: 16px; transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        .nav-floating.scrolled {
          top: 10px; background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
          padding-top: 0.5rem !important; padding-bottom: 0.5rem !important;
        }
        .nav-link-custom {
          font-weight: 500; color: #475569 !important; padding: 0.5rem 1rem !important;
          border-radius: 12px; transition: all 0.2s; margin: 0 2px;
        }
        .nav-link-custom:hover { color: #4F46E5 !important; background: rgba(79, 70, 229, 0.06); }
        .nav-link-custom.active { color: #4F46E5 !important; background: rgba(79, 70, 229, 0.1); font-weight: 600; }
        
        .animate-slide-down { animation: slideDown 0.3s ease forwards; transform-origin: top right; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .mobile-menu-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem; border-radius: 12px;
          color: #334155; text-decoration: none; font-weight: 600;
          background: #f8fafc; margin-bottom: 0.5rem; transition: all 0.2s;
        }
        .mobile-menu-link:active { transform: scale(0.98); }
        .mobile-menu-link.active { background: #eef2ff; color: #4F46E5; border: 1px solid #e0e7ff; }
        
        .dropdown-item-custom:hover { background-color: #f8fafc; transform: translateX(5px); }
        .dropdown-item-custom { transition: all 0.2s ease; }
      `}</style>

      <BSNavbar expand="lg" className={`nav-floating py-3 ${scrolled ? 'scrolled' : ''}`}>
        <Container>
          {/* Logo */}
          <BSNavbar.Brand as={Link} href="/" className="d-flex align-items-center gap-2 z-2">
              <div className="d-flex position-relative">
                 <div className="bg-white rounded-circle p-1 shadow-sm position-relative z-1 border border-light">
                    <Image src="/images/bee01.png" alt="Logo" width={38} height={38} className="rounded-circle" />
                 </div>
                 <div className="bg-white rounded-circle p-1 shadow-sm position-relative border border-light" style={{marginLeft: '-12px'}}>
                    <Image src="/images/bee02.png" alt="Logo" width={38} height={38} className="rounded-circle" />
                 </div>
              </div>
              <div className="lh-1 d-flex flex-column ms-2">
                 <span className="fw-bold text-dark" style={{letterSpacing: '-0.5px', fontSize: '1rem'}}>COMSCI SSKRU</span>
                 <span className="text-muted small" style={{fontSize: '0.65rem'}}>Sisaket Shirt</span>
              </div>
          </BSNavbar.Brand>

          {/* Center Menu */}
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
            
            {isLoggedIn && (
                <Link href="/cart" className="position-relative btn btn-light rounded-circle shadow-sm me-1 d-none d-lg-flex" style={{width: 42, height: 42, alignItems: 'center', justifyContent: 'center'}}>
                    <FaShoppingCart className="text-primary" size={18}/>
                    {cartCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2 border-white" style={{fontSize: '0.6rem'}}>
                        {cartCount}
                        </span>
                    )}
                </Link>
            )}

            {isLoggedIn ? (
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="cursor-pointer" style={{border: 'none', background: 'transparent'}}>
                   <div className="d-flex align-items-center gap-2 p-1 pe-3 rounded-pill hover-bg-light transition-all border border-transparent hover-border-light">
                       <div className="position-relative">
                          <Image src={userImage} alt="Profile" width={38} height={38} className="rounded-circle border shadow-sm" unoptimized />
                          <span className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle" style={{width:10, height:10}}></span>
                       </div>
                       <div className="d-none d-md-block text-start lh-1">
                          <span className="fw-bold text-dark d-block" style={{fontSize: '0.85rem', maxWidth: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{displayName}</span>
                          <span className="text-muted" style={{fontSize: '0.65rem'}}>{role === 'admin' ? 'Admin' : 'Member'}</span>
                       </div>
                   </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="border-0 shadow-lg rounded-4 mt-3 p-0 overflow-hidden animate-slide-down" style={{minWidth: '280px'}}>
                   
                   {/* Header Gradient */}
                   <div className="p-4 text-center text-white position-relative" style={{background: 'linear-gradient(135deg, #4F46E5, #7c3aed)'}}>
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-10" style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                        
                        <div className="position-relative z-1">
                            <div className="d-inline-block p-1 bg-white bg-opacity-25 rounded-circle mb-2">
                                <Image src={userImage} alt="Profile" width={60} height={60} className="rounded-circle border border-2 border-white" unoptimized />
                            </div>
                            <h6 className="fw-bold mb-0">{displayName}</h6>
                            <Badge bg="light" text="dark" className="fw-normal mt-1 opacity-75">{role === 'admin' ? 'Administrator' : 'สมาชิกทั่วไป'}</Badge>
                        </div>
                   </div>

                   {/* Body */}
                   <div className="p-3 bg-white">
                       <div className="d-grid gap-2">
                           <Link href="/dashboard" className="text-decoration-none">
                               <button className="btn btn-light w-100 text-start d-flex align-items-center gap-3 py-2 rounded-3 dropdown-item-custom border-0">
                                   <div className="bg-primary text-white p-2 rounded-circle shadow-sm" style={{width: 35, height: 35, display: 'flex', alignItems:'center', justifyContent:'center'}}>
                                       <FaHistory size={14}/>
                                   </div>
                                   <div>
                                       <span className="d-block fw-bold text-dark" style={{fontSize: '0.9rem'}}>ประวัติการสั่งซื้อ</span>
                                       <small className="text-muted" style={{fontSize: '0.7rem'}}>ติดตามสถานะพัสดุ</small>
                                   </div>
                               </button>
                           </Link>
                           
                           {/* ปุ่มสำหรับ Admin */}
                           {role === 'admin' && (
                               <Link href="/admin/orders" className="text-decoration-none">
                                   <button className="btn btn-light w-100 text-start d-flex align-items-center gap-3 py-2 rounded-3 dropdown-item-custom border-0">
                                       <div className="bg-warning text-dark p-2 rounded-circle shadow-sm" style={{width: 35, height: 35, display: 'flex', alignItems:'center', justifyContent:'center'}}>
                                           <FaUserCircle size={14}/>
                                       </div>
                                       <div>
                                           <span className="d-block fw-bold text-dark" style={{fontSize: '0.9rem'}}>จัดการหลังบ้าน</span>
                                           <small className="text-muted" style={{fontSize: '0.7rem'}}>Admin Console</small>
                                       </div>
                                   </button>
                               </Link>
                           )}
                       </div>

                       <hr className="my-3 border-secondary opacity-10"/>
                       
                       <button 
                           onClick={() => signOut({callbackUrl: '/'})} 
                           className="btn btn-danger w-100 border-0 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm hover-lift"
                       >
                           <FaSignOutAlt/> ออกจากระบบ
                       </button>
                   </div>
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
               {isLoggedIn && cartCount > 0 && <span className="position-absolute top-0 end-0 bg-danger rounded-circle" style={{width: 8, height: 8, marginTop: 8, marginRight: 8}}></span>}
            </Button>

          </div>
        </Container>
      </BSNavbar>

      {/* Mobile Offcanvas */}
      <Offcanvas show={showMobile} onHide={handleClose} placement="end" className="border-0 rounded-start-4" style={{maxWidth: '85vw'}}>
        <Offcanvas.Header className="justify-content-between p-4 border-bottom bg-light">
          {isLoggedIn ? (
              <div className="d-flex align-items-center gap-3">
                  <div className="bg-white rounded-circle p-1 shadow-sm border">
                      <Image src={userImage} alt="User" width={40} height={40} className="rounded-circle" unoptimized/>
                  </div>
                  <div>
                      <h6 className="fw-bold mb-0 text-dark">{displayName}</h6>
                      <small className="text-muted">{role === 'admin' ? 'Admin' : 'Member'}</small>
                  </div>
              </div>
          ) : (
              <span className="fw-bold fs-5 text-primary">เมนูหลัก</span>
          )}
          <Button variant="light" onClick={handleClose} className="rounded-circle p-2 text-secondary bg-white shadow-sm">
             <FaTimes size={18}/>
          </Button>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="px-4 pt-4 d-flex flex-column h-100">
            
            {isLoggedIn && (
                <Link href="/cart" onClick={handleClose} className={`mobile-menu-link mb-4 ${pathname === '/cart' ? 'active' : ''}`}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="position-relative">
                            <FaShoppingCart className="text-secondary"/>
                            {cartCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger p-1" style={{fontSize: '0.5rem'}}>{cartCount}</span>}
                        </div>
                        ตะกร้าสินค้า
                    </div>
                    <FaChevronRight size={12} className="opacity-25"/>
                </Link>
            )}

           {isLoggedIn ? (
             <div className="d-flex flex-column gap-2 mb-auto">
                <Link href="/" onClick={handleClose} className={`mobile-menu-link ${pathname === '/' ? 'active' : ''}`}>
                   <div className="d-flex align-items-center gap-3"><FaHome className="text-secondary"/> หน้าแรก</div>
                </Link>
                <Link href="/products" onClick={handleClose} className={`mobile-menu-link ${pathname.startsWith('/products') ? 'active' : ''}`}>
                   <div className="d-flex align-items-center gap-3"><FaStore className="text-secondary"/> เลือกซื้อสินค้า</div>
                </Link>
                <Link href="/dashboard" onClick={handleClose} className={`mobile-menu-link ${pathname.startsWith('/dashboard') ? 'active' : ''}`}>
                   <div className="d-flex align-items-center gap-3"><FaHistory className="text-secondary"/> ประวัติการสั่งซื้อ</div>
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
                <Button 
                    className="w-100 py-3 rounded-4 fw-bold d-flex align-items-center justify-content-center gap-2 btn-danger text-white shadow-sm"
                    onClick={() => signOut({callbackUrl: '/'})}
                >
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
    </>
  );
}