// src/app/layout.tsx
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import { Sarabun } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import BootstrapClient from '@/components/BootstrapClient';
import BackToTop from '@/components/BackToTop'; // อย่าลืมปุ่มนี้
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaLine, FaPhoneAlt, FaMapMarkerAlt, FaHeart, FaUserShield } from 'react-icons/fa';

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sisaket Charity - ร่วมเป็นส่วนหนึ่งในการให้',
  description: 'สั่งจองเสื้อที่ระลึก 243 ปี จังหวัดศรีสะเกษ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sans d-flex flex-column min-vh-100`}>
        <Providers>
          <div className="fixed-background"></div>

          <Navbar />
          
          {/* 🛠️ แก้ไขจุดนี้: เพิ่ม padding-top: 120px เพื่อไม่ให้เนื้อหาโดน Navbar บัง */}
          <main className="flex-grow-1 position-relative z-1" style={{ paddingTop: '50px' }}>
            {children}
          </main>

          {/* Footer (คงเดิม) */}
          <footer className="bg-dark text-white pt-5 pb-3 mt-auto position-relative z-1" style={{background: 'linear-gradient(to bottom, #1e1b4b, #0f172a)'}}>
            <Container>
              <Row className="gy-4 justify-content-between">
                <Col lg={4} md={6}>
                  <h5 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                     <span className="bg-primary rounded-circle d-inline-block" style={{width: 10, height: 10}}></span>
                     YEC SISAKET
                  </h5>
                  <p className="text-white-50 small" style={{lineHeight: '1.8'}}>
                    กลุ่มผู้ประกอบการรุ่นใหม่หอการค้าจังหวัดศรีสะเกษ (YEC) <br/>
                    มุ่งมั่นพัฒนาเศรษฐกิจและสังคมบ้านเกิด
                  </p>
                </Col>
                <Col lg={3} md={6}>
                   <h6 className="fw-bold text-white mb-3">เมนูด่วน</h6>
                   <ul className="list-unstyled text-white-50 small d-flex flex-column gap-2">
                      <li><a href="/" className="text-decoration-none text-white-50 hover-text-white transition-all">หน้าแรก</a></li>
                      <li><a href="/products" className="text-decoration-none text-white-50 hover-text-white transition-all">สั่งจองเสื้อ</a></li>
                      <li><a href="/dashboard" className="text-decoration-none text-white-50 hover-text-white transition-all">ตรวจสอบสถานะ</a></li>
                   </ul>
                </Col>
                <Col lg={4} md={12}>
                   <h6 className="fw-bold text-white mb-3">ติดต่อเรา</h6>
                   <ul className="list-unstyled text-white-50 small d-flex flex-column gap-3">
                      <li className="d-flex gap-2">
                        <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                        <span>หอการค้าจังหวัดศรีสะเกษ</span>
                      </li>
                      <li className="d-flex gap-2 align-items-center">
                        <FaPhoneAlt className="text-primary flex-shrink-0" />
                        <span>093-358-1622</span>
                      </li>
                      <li className="d-flex gap-3 mt-2">
                        <a href="#" className="text-white fs-5 hover-scale"><FaFacebook /></a>
                        <a href="#" className="text-white fs-5 hover-scale"><FaLine /></a>
                      </li>
                   </ul>
                </Col>
              </Row>
              <hr className="border-secondary opacity-25 my-4"/>
              <div className="text-center text-white-50 small position-relative"> {/* เพิ่ม position-relative */}
                  <span>&copy; {new Date().getFullYear()} Sisaket Charity. All rights reserved.</span>
                  
                  {/* 👇 เพิ่มปุ่ม Admin ลับๆ ตรงนี้ */}
                  <a href="/admin/login" className="position-absolute end-0 top-50 translate-middle-y text-white-50 hover-text-white p-2" title="Admin Login">
                      <FaUserShield size={12} />
                  </a>
              </div>
            </Container>
          </footer>

          <BackToTop />
          <BootstrapClient />
        </Providers>
      </body>
    </html>
  );
}