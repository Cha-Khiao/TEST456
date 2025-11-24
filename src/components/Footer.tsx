'use client';

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaLine, FaPhoneAlt, FaMapMarkerAlt, FaUserShield } from 'react-icons/fa';

export default function Footer() {
  const { status } = useSession();
  const router = useRouter();

  const handleProtectedLink = (e: React.MouseEvent, path: string) => {
    e.preventDefault(); 
    if (status === 'authenticated') {
      router.push(path); 
    } else {
      router.push('/auth/login'); 
    }
  };

  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-auto position-relative z-1" style={{background: 'linear-gradient(to bottom, #1e1b4b, #0f172a)'}}>
      <Container>
        <Row className="gy-4 justify-content-between">
          <Col lg={4} md={6}>
            <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <span className="bg-primary rounded-circle d-inline-block" style={{width: 10, height: 10}}></span>
                ComSci SSKRU
            </h5>
            <p className="text-white-50 small" style={{lineHeight: '1.8'}}>
              สาขาวิทยาการคอมพิวเตอร์ (COMSCI) <br/>
              มหาวิทยาลัยราชภัฏศรีสะเกษ
            </p>
          </Col>
          
          <Col lg={3} md={6}>
              <h6 className="fw-bold text-white mb-3">เมนูด่วน</h6>
              <ul className="list-unstyled text-white-50 small d-flex flex-column gap-2">
                <li>
                    <Link href="/" className="text-decoration-none text-white-50 hover-text-white transition-all">หน้าแรก</Link>
                </li>
                <li>
                    <a 
                        href="/products" 
                        onClick={(e) => handleProtectedLink(e, '/products')}
                        className="text-decoration-none text-white-50 hover-text-white transition-all cursor-pointer"
                    >
                        สั่งจองเสื้อ
                    </a>
                </li>
                <li>
                    <a 
                        href="/dashboard" 
                        onClick={(e) => handleProtectedLink(e, '/dashboard')}
                        className="text-decoration-none text-white-50 hover-text-white transition-all cursor-pointer"
                    >
                        ตรวจสอบสถานะ
                    </a>
                </li>
              </ul>
          </Col>
          
          <Col lg={4} md={12}>
              <h6 className="fw-bold text-white mb-3">ติดต่อเรา</h6>
              <ul className="list-unstyled text-white-50 small d-flex flex-column gap-3">
                <li className="d-flex gap-2">
                  <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                  <span>มหาวิทยาลัยราชภัฏศรีสะเกษ</span>
                </li>
                <li className="d-flex gap-2 align-items-center">
                  <FaPhoneAlt className="text-primary flex-shrink-0" />
                  <span>012-345-6789</span>
                </li>
                <li className="d-flex gap-3 mt-2">
                  <a 
                    href="https://web.facebook.com/comsci.sskru"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white fs-5 hover-scale"
                    title="Facebook Fanpage"
                  >
                    <FaFacebook />
                  </a>
                  <a 
                    href="https://line.me/R/ti/p/@793ozxpi"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white fs-5 hover-scale"
                    title="Add Line"
                  >
                    <FaLine />
                  </a>
                </li>
              </ul>
          </Col>
        </Row>
        <hr className="border-secondary opacity-25 my-4"/>
        <div className="text-center text-white-50 small position-relative">
            <span>&copy; {new Date().getFullYear()} Sisaket Shirt. All rights reserved.</span>
            
            <Link href="/admin/login" className="position-absolute end-0 top-50 translate-middle-y text-white-50 hover-text-white p-2" title="Admin Login">
                <FaUserShield size={20} />
            </Link>
        </div>
      </Container>
    </footer>
  );
}