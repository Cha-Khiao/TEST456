// src/app/order/success/[id]/page.tsx
'use client';

import { useSession } from "next-auth/react"; // ✅ 1. Import Session
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  FaCheckCircle, FaCopy, FaFileInvoiceDollar, 
  FaHome, FaLine, FaFacebook 
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const BANK_INFO = {
  bankName: 'ธนาคารกรุงเทพ (Bangkok Bank)',
  accName: 'บจ. ประชารัฐรักสามัคคีศรีสะเกษ (วิสาหกิจเพื่อสังคม)',
  accNo: '333-4-23368-5',
  branch: 'สาขาศรีสะเกษ',
  logo: '/images/bank_logos/bbl.svg'
};

const primaryColorHex = '#4F46E5'; 

export default function OrderSuccessPage() {
  const { data: session } = useSession(); // ✅ 2. เรียกใช้ Session
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchOrder = async () => {
      // ✅ 3. เช็ค Session ก่อน (ถ้ายังโหลดไม่เสร็จให้รอก่อน)
      if (!session) return;

      try {
        const res = await fetch(API_ENDPOINTS.ORDER_DETAILS(id as string), {
            // ✅ 4. แนบ Token
            headers: {
                'Authorization': `Bearer ${(session as any)?.accessToken}`
            }
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                throw new Error('ไม่มีสิทธิ์เข้าถึงข้อมูล (Unauthorized)');
            }
            throw new Error('ไม่พบข้อมูลคำสั่งซื้อ');
        }
        
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
        fetchOrder();
    }
  }, [id, session]); // เพิ่ม session ใน dependency

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_INFO.accNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" className="mb-3"/>
        <div className="text-primary fw-bold animate-pulse">กำลังสรุปรายการสั่งซื้อ...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger" className="d-inline-block px-5 py-4 rounded-4 shadow-sm">
           <h4 className="fw-bold mb-2">เกิดข้อผิดพลาด</h4>
           <p className="mb-4">{error || 'รหัสคำสั่งซื้อไม่ถูกต้อง'}</p>
           <Link href="/">
             <Button variant="outline-danger" className="rounded-pill px-4">กลับหน้าหลัก</Button>
           </Link>
        </Alert>
      </Container>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '120px', backgroundColor: '#f8fafc' }}>
      
      {/* Success Header Animation */}
      <div className="text-center py-5 bg-white shadow-sm position-relative overflow-hidden">
         <div className="position-absolute top-0 start-0 w-100 h-100 bg-success bg-opacity-10"></div>
         <div className="position-relative z-1 animate-pop">
            <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3 shadow-lg" style={{width: 80, height: 80}}>
               <FaCheckCircle className="text-white" size={40} />
            </div>
            <h2 className="fw-bold text-success mb-1">บันทึกคำสั่งซื้อสำเร็จ!</h2>
            <p className="text-secondary mb-0">รหัสคำสั่งซื้อ: <span className="fw-bold text-dark">#{order._id.slice(-6).toUpperCase()}</span></p>
         </div>
      </div>

      <Container className="mt-n4 position-relative z-2" style={{marginTop: '-30px'}}>
        <Row className="justify-content-center g-4">
           
           {/* 1. ยอดเงิน & บัญชีธนาคาร */}
           <Col lg={5}>
              <Card className="border-0 shadow-lg rounded-4 overflow-hidden h-100 card-border-teal">
                 <div className="card-header-gradient-teal p-4 text-center text-white">
                    <h5 className="fw-bold mb-0 opacity-75">ยอดที่ต้องชำระ</h5>
                    <h1 className="fw-bold display-4 mb-0">฿{order.totalPrice.toLocaleString()}</h1>
                    <small>กรุณาโอนเงินภายใน 24 ชม.</small>
                 </div>
                 
                 <Card.Body className="p-4 bg-white">
                    <div className="bg-light rounded-4 p-3 border border-2 mb-4">
                       <div className="d-flex align-items-center mb-3">
                          <div className="bg-white p-2 rounded-3 shadow-sm me-3 border" style={{width: 60, height: 60}}>
                             <div className="w-100 h-100 bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold">
                                BBL
                             </div>
                          </div>
                          <div>
                             <h6 className="fw-bold text-dark mb-0">{BANK_INFO.bankName}</h6>
                             <small className="text-muted">{BANK_INFO.accName}</small>
                          </div>
                       </div>
                       
                       <div className="position-relative">
                          <div className="bg-white border rounded-3 p-3 d-flex justify-content-between align-items-center">
                             <span className="fw-bold fs-4 text-primary" style={{letterSpacing: '1px'}}>{BANK_INFO.accNo}</span>
                             <Button 
                               variant={copied ? "success" : "outline-secondary"} 
                               size="sm" 
                               className="rounded-pill px-3 fw-bold transition-all"
                               onClick={handleCopy}
                             >
                                {copied ? <><FaCheckCircle className="me-1"/> คัดลอกแล้ว</> : <><FaCopy className="me-1"/> คัดลอก</>}
                             </Button>
                          </div>
                       </div>
                    </div>

                    <div className="text-center">
                       <p className="text-secondary small mb-3">หรือสแกน QR Code เพื่อชำระเงิน</p>
                       <div className="p-2 border rounded-3 d-inline-block shadow-sm bg-white">
                          <div className="position-relative" style={{width: 180, height: 180}}>
                             <Image src="/images/qrcode.png" alt="Payment QR" fill style={{objectFit: 'contain'}} />
                          </div>
                       </div>
                    </div>
                 </Card.Body>
              </Card>
           </Col>

           {/* 2. ปุ่มดำเนินการต่อ */}
           <Col lg={5}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                 <Card.Body className="p-4 p-lg-5 d-flex flex-column justify-content-center">
                    <h4 className="fw-bold text-dark mb-4 text-center">ขั้นตอนต่อไป</h4>
                    
                    <div className="d-flex mb-4">
                       <div className="flex-shrink-0">
                          <div className="rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center" style={{width: 40, height: 40, border: `2px solid ${primaryColorHex}`}}>1</div>
                       </div>
                       <div className="ms-3">
                          <h6 className="fw-bold mb-1">โอนเงินผ่านแอปธนาคาร</h6>
                          <p className="text-muted small mb-0">ใช้เลขบัญชีหรือ QR Code ด้านซ้ายมือ</p>
                       </div>
                    </div>

                    <div className="d-flex mb-4">
                       <div className="flex-shrink-0">
                          <div className="rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center" style={{width: 40, height: 40, border: `2px solid ${primaryColorHex}`}}>2</div>
                       </div>
                       <div className="ms-3">
                          <h6 className="fw-bold mb-1">แจ้งชำระเงิน (อัปโหลดสลิป)</h6>
                          <p className="text-muted small mb-0">เพื่อให้เจ้าหน้าที่ตรวจสอบยอดเงิน</p>
                       </div>
                    </div>

                    <hr className="my-4 opacity-10" />

                    <Link href={`/payment/notify/${order._id}`} className="text-decoration-none mb-3">
                       <Button 
                         className="w-100 rounded-pill py-3 fw-bold shadow-lg btn-gradient-warning d-flex align-items-center justify-content-center fs-5"
                       >
                          <FaFileInvoiceDollar className="me-2"/> แจ้งชำระเงิน / ส่งสลิป
                       </Button>
                    </Link>

                    <div className="row g-2">
                       <div className="col-6">
                          <Link href="/dashboard">
                             <Button variant="outline-secondary" className="w-100 rounded-pill py-2 fw-bold btn-outline-hover">
                                ประวัติสั่งซื้อ
                             </Button>
                          </Link>
                       </div>
                       <div className="col-6">
                          <Link href="/">
                             <Button variant="outline-secondary" className="w-100 rounded-pill py-2 fw-bold btn-outline-hover">
                                <FaHome className="me-1"/> หน้าหลัก
                             </Button>
                          </Link>
                       </div>
                    </div>

                    <div className="mt-4 text-center pt-3 border-top">
                       <small className="text-muted d-block mb-2">ติดปัญหาการใช้งาน?</small>
                       <div className="d-flex justify-content-center gap-3">
                          <a href="#" className="text-success fs-4 hover-scale"><FaLine /></a>
                          <a href="#" className="text-primary fs-4 hover-scale"><FaFacebook /></a>
                       </div>
                    </div>

                 </Card.Body>
              </Card>
           </Col>
        </Row>
      </Container>
    </div>
  );
}