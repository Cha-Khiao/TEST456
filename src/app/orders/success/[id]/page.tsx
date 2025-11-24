'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { 
  FaCheckCircle, FaCopy, FaFileInvoiceDollar, 
  FaHome, FaLine, FaFacebook, FaReceipt, FaCheck 
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const BANK_INFO = {
  bankName: 'ธนาคารกรุงเทพ',
  accName: 'บจ. ประชารัฐรักสามัคคีศรีสะเกษ',
  accNo: '333-4-23368-5',
  branch: 'สาขาศรีสะเกษ',
  logo: '/images/bank_logos/bbl.svg' 
};

export default function OrderSuccessPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      if (!session) return;
      try {
        const res = await fetch(API_ENDPOINTS.ORDER_DETAILS(id as string), {
            headers: { 'Authorization': `Bearer ${(session as any)?.accessToken}` }
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) throw new Error('Unauthorized Access');
            throw new Error('Order not found');
        }
        
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchOrder();
  }, [id, session]);

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_INFO.accNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} />
        <p className="mt-3 text-muted animate-pulse">กำลังสรุปข้อมูลคำสั่งซื้อ...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-5 text-center mt-5">
         <div className="bg-white p-5 rounded-4 shadow-sm mx-auto" style={{maxWidth: '500px'}}>
            <div className="text-danger mb-3"><FaCheckCircle size={50} style={{transform: 'rotate(45deg)'}}/></div>
            <h3 className="fw-bold text-dark">ไม่พบคำสั่งซื้อ</h3>
            <p className="text-muted">{error || 'กรุณาตรวจสอบความถูกต้องอีกครั้ง'}</p>
            <Link href="/"><Button variant="outline-dark" className="rounded-pill px-4">กลับหน้าหลัก</Button></Link>
         </div>
      </Container>
    );
  }

  return (
      <div style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#f4f7fe' }}>
      
      {/* Full-Width Header Background */}
      <div className="position-relative overflow-hidden pt-5 pb-5" 
           style={{
               background: 'linear-gradient(to bottom, #e6fffa, #f4f7fe)',
               borderBottomLeftRadius: '30px',
               borderBottomRightRadius: '30px'
           }}>
           
           <div className="position-absolute top-0 start-0 translate-middle bg-success opacity-10 rounded-circle animate-pulse" style={{width: '300px', height: '300px', filter: 'blur(50px)'}}></div>
           <div className="position-absolute top-0 end-0 translate-middle bg-primary opacity-10 rounded-circle animate-pulse" style={{width: '250px', height: '250px', filter: 'blur(50px)', animationDelay: '1s'}}></div>

           <Container className="text-center position-relative z-1 pt-3 pb-5">
                <div className="mb-3 d-inline-block position-relative">
                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-lg animate-bounce" 
                        style={{width: 80, height: 80, margin: '0 auto', border: '4px solid white'}}>
                        <FaCheck size={40} />
                    </div>
                </div>
                
                <h1 className="fw-bold text-dark mb-2">จองสินค้าสำเร็จ!</h1>
                <p className="text-secondary mb-4 fs-5">ขอบคุณที่ร่วมสนับสนุนโครงการ 243 ปี ศรีสะเกษ</p>
                
                <div className="d-inline-flex align-items-center bg-white border px-4 py-2 rounded-pill shadow-sm">
                    <span className="text-muted me-2 small">Order ID:</span>
                    <span className="fw-bold text-primary font-monospace select-all fs-5">#{order._id.slice(-6).toUpperCase()}</span>
                </div>
           </Container>
      </div>

      <Container className="mt-n5 position-relative z-2" style={{marginTop: '-5rem'}}>
        <Row className="justify-content-center g-4">
           
           {/* LEFT CARD: PAYMENT TICKET */}
           <Col lg={5}>
              <Card className="rounded-4 overflow-hidden h-100 hover-lift shadow-lg card-border-teal position-relative">
                 
                 {/* Ticket Header */}
                 <div className="p-4 text-center text-white position-relative" 
                      style={{background: 'linear-gradient(135deg, #20c997 0%, #0ca678 100%)'}}>
                    <div className="position-relative z-1">
                        <small className="text-uppercase fw-bold opacity-75 letter-spacing-2 fs-6">ยอดชำระทั้งสิ้น / Total</small>
                        <h1 className="fw-bold display-4 my-2">฿{order.totalPrice.toLocaleString()}</h1>
                        <Badge bg="white" text="success" className="rounded-pill px-3 py-2 shadow-sm">
                            <span className="blink-me me-1">●</span> รอการโอนเงิน
                        </Badge>
                    </div>
                    {/* Punch Holes */}
                    <div className="position-absolute bottom-0 start-0 translate-middle-x bg-white rounded-circle" style={{width: 20, height: 20, marginBottom: -10}}></div>
                    <div className="position-absolute bottom-0 end-0 translate-middle-x bg-white rounded-circle" style={{width: 20, height: 20, marginBottom: -10, marginRight: -20}}></div>
                 </div>
                 
                 <Card.Body className="p-4 bg-white">
                    <div className="bg-light rounded-3 p-3 mb-4 border border-dashed animate-slide-up">
                        <div className="d-flex align-items-center mb-3">
                            <div className="p-2 rounded-3 shadow-sm me-3 border position-relative d-flex align-items-center justify-content-center" 
                                 style={{width: 70, height: 70, backgroundColor: '#1e3a8a'}}>
                                 <Image 
                                    src={BANK_INFO.logo} 
                                    alt={BANK_INFO.bankName}
                                    width={50} height={50}
                                    style={{objectFit: 'contain'}}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = '<span class="text-white fw-bold">BBL</span>';
                                    }}
                                 />
                            </div>
                            <div>
                                <h5 className="fw-bold text-dark mb-1">{BANK_INFO.bankName}</h5>
                                <span className="text-muted small d-block">{BANK_INFO.accName}</span>
                                <span className="text-muted small d-block">({BANK_INFO.branch})</span>
                            </div>
                        </div>
                        
                        <div className="d-flex align-items-center justify-content-between bg-white border rounded-3 px-3 py-2">
                            <span className="fw-bold text-primary fs-3 font-monospace" style={{letterSpacing: '1px'}}>{BANK_INFO.accNo}</span>
                            
                            <Button 
                                variant={copied ? "success" : "light"} 
                                size="sm" 
                                className={`rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 transition-all ${copied ? 'text-white' : 'text-secondary border'}`} 
                                onClick={handleCopy}
                            >
                                {copied ? <><FaCheckCircle/> คัดลอกแล้ว</> : <><FaCopy/> คัดลอก</>}
                            </Button>
                        </div>
                    </div>

                    <div className="text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
                        <p className="text-muted small mb-2">หรือสแกนเพื่อชำระเงินทันที</p>
                        <div className="d-inline-block p-2 border rounded-3 bg-white shadow-sm hover-scale">
                            <div className="position-relative" style={{width: 160, height: 160}}>
                                <Image src="/images/qrcode.png" alt="QR Payment" fill className="object-fit-contain rounded-2" />
                            </div>
                        </div>
                        <div className="mt-2">
                             <Image src="/images/promptpay-logo.png" alt="PromptPay" width={60} height={24} style={{objectFit:'contain', opacity: 0.8}} onError={(e) => e.currentTarget.style.display='none'}/>
                        </div>
                    </div>
                 </Card.Body>
              </Card>
           </Col>

           {/* RIGHT CARD: TIMELINE & ACTIONS */}
           <Col lg={5}>
              <Card className="shadow-sm rounded-4 h-100 overflow-hidden card-border-orange">

                 <Card.Body className="p-4 p-lg-5 d-flex flex-column">
                    <h4 className="fw-bold text-dark mb-4">ขั้นตอนดำเนินการ</h4>
                    
                    <div className="position-relative ps-3 border-start border-2 border-light mb-4">
                        <div className="mb-4 position-relative">
                            <div className="position-absolute top-0 start-0 translate-middle bg-white border border-2 border-primary rounded-circle" style={{width: 20, height: 20, marginLeft: -1}}></div>
                            <div className="ps-4">
                                <h6 className="fw-bold text-dark mb-1 fs-5">1. โอนเงินตามยอดที่ระบุ</h6>
                                <p className="text-muted mb-0">ผ่านแอปธนาคารใดก็ได้ เข้าบัญชีด้านซ้าย</p>
                            </div>
                        </div>
                        <div className="position-relative">
                            <div className="position-absolute top-0 start-0 translate-middle bg-warning rounded-circle shadow-sm animate-pulse" style={{width: 20, height: 20, marginLeft: -1}}></div>
                            <div className="ps-4">
                                <h6 className="fw-bold text-dark mb-1 fs-5">2. แนบสลิปแจ้งโอน <span className="text-warning small">(สำคัญ)</span></h6>
                                <p className="text-muted mb-0">เมื่อโอนเสร็จแล้ว ให้กดปุ่มด้านล่างเพื่อยืนยัน</p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-light my-4"/>

                    <div className="mt-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
                        <Link href={`/payment/notify/${order._id}`} className="text-decoration-none">
                            <Button className="w-100 rounded-pill py-3 fw-bold shadow-lg btn-gradient-warning d-flex align-items-center justify-content-center gap-2 mb-3 hover-scale text-white border-0 fs-5"
                                    style={{background: 'linear-gradient(45deg, #f59e0b, #d97706)'}}>
                                <FaFileInvoiceDollar size={24}/> แจ้งชำระเงิน / ส่งสลิป
                            </Button>
                        </Link>
                        
                        <div className="d-grid grid-cols-2 gap-2 d-flex">
                           <Link href="/dashboard" className="w-50">
                               <Button variant="light" className="w-100 rounded-pill border py-2 text-muted fw-bold hover-bg-light">
                                  <FaReceipt className="me-2"/>ประวัติ
                               </Button>
                           </Link>
                           <Link href="/" className="w-50">
                               <Button variant="light" className="w-100 rounded-pill border py-2 text-muted fw-bold hover-bg-light">
                                  <FaHome className="me-2"/>หน้าหลัก
                               </Button>
                           </Link>
                        </div>
                    </div>
                    
                    <div className="text-center mt-4 pt-3 border-top border-light">
                        <small className="text-muted d-block mb-2">ติดปัญหา? ติดต่อเราได้ที่</small>
                        <div className="d-flex justify-content-center gap-3">
                            <a href="#" className="text-success bg-success bg-opacity-10 px-4 py-2 rounded-pill small fw-bold text-decoration-none hover-scale"><FaLine className="me-1" size={18}/> Line OA</a>
                            <a href="#" className="text-primary bg-primary bg-opacity-10 px-4 py-2 rounded-pill small fw-bold text-decoration-none hover-scale"><FaFacebook className="me-1" size={18}/> Inbox</a>
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