'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal } from 'react-bootstrap';
import { 
  FaArrowLeft, FaBoxOpen, FaTruck, FaMapMarkerAlt, 
  FaUser, FaPhone, FaReceipt, FaCheckCircle, FaClock, FaSearch, FaTimesCircle,
  FaChevronRight, FaShoppingBag,
  FaTimes
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

// --- Utilities ---
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const STEP_INFO: Record<string, string> = {
    pending_payment: 'รอชำระ',
    verification: 'ตรวจสอบ',
    shipping: 'ขนส่ง',
    completed: 'สำเร็จ'
};

// Helper: เลือก Class สีตามสถานะ (ใช้ชื่อ Class จาก globals.css)
const getStatusTheme = (status: string) => {
    switch (status) {
        case 'pending_payment': return { 
            borderClass: 'border-status-warning', 
            bgClass: 'bg-status-warning',     
            text: '#9a3412', iconColor: '#f97316',
            label: 'รอชำระเงิน', desc: 'กรุณาชำระเงินและแนบสลิปเพื่อดำเนินการต่อ', icon: FaClock 
        };
        case 'verification': return { 
            borderClass: 'border-status-info', 
            bgClass: 'bg-status-info',
            text: '#075985', iconColor: '#0ea5e9',
            label: 'กำลังตรวจสอบ', desc: 'เจ้าหน้าที่กำลังตรวจสอบยอดเงินและหลักฐาน', icon: FaSearch 
        };
        case 'shipping': return { 
            borderClass: 'border-status-primary', 
            bgClass: 'bg-status-primary',
            text: '#3730a3', iconColor: '#6366f1',
            label: 'กำลังจัดส่ง', desc: 'สินค้าอยู่ระหว่างการขนส่งไปยังที่อยู่ของคุณ', icon: FaTruck 
        };
        case 'completed': return { 
            borderClass: 'border-status-success', 
            bgClass: 'bg-status-success',
            text: '#065f46', iconColor: '#10b981',
            label: 'สำเร็จ', desc: 'คำสั่งซื้อเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ', icon: FaCheckCircle 
        };
        case 'cancelled': return { 
            borderClass: 'border-status-danger', 
            bgClass: 'bg-status-danger',
            text: '#991b1b', iconColor: '#ef4444',
            label: 'ยกเลิก', desc: 'รายการนี้ถูกยกเลิกแล้ว', icon: FaTimesCircle 
        };
        default: return { 
            borderClass: 'border-status-general', 
            bgClass: 'bg-status-general',
            text: '#374151', iconColor: '#6b7280',
            label: 'สถานะทั่วไป', desc: '', icon: FaBoxOpen 
        };
    }
};

export default function OrderDetailsPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSlip, setShowSlip] = useState(false);

  useEffect(() => {
    if (!id || !session) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ORDER_DETAILS(id as string), {
            headers: { 'Authorization': `Bearer ${(session as any)?.accessToken}` }
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setOrder(data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchOrder();
  }, [id, session]);

  // --- Components ---
  const TimelineHorizontal = () => {
      if (!order || order.status === 'cancelled') return null;
      const steps = ['pending_payment', 'verification', 'shipping', 'completed'];
      const currentIdx = steps.indexOf(order.status);
      const theme = getStatusTheme(order.status);
      
      return (
          <div className="d-flex align-items-center justify-content-between position-relative mt-4 mb-2 px-2 w-100">
              {/* Background Line */}
              <div className="position-absolute top-0 start-0 w-100 translate-middle-y" style={{top: '14px', zIndex: 0}}>
                  <div className="w-100 bg-dark bg-opacity-10 rounded-pill" style={{height: '4px'}}></div>
              </div>
              
              {/* Active Line */}
              <div className="position-absolute top-0 start-0 translate-middle-y transition-all rounded-pill" 
                   style={{top: '14px', zIndex: 0, width: `${(currentIdx / 3) * 100}%`, height: '4px', backgroundColor: theme.iconColor}}>
              </div>
              
              <div className="d-flex justify-content-between position-relative z-1 w-100">
                  {steps.map((step, idx) => {
                      const isPassed = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      
                      return (
                          <div key={step} className="d-flex flex-column align-items-center" style={{width: '60px'}}>
                              {/* Dot / Icon */}
                              <div className={`rounded-circle d-flex align-items-center justify-content-center transition-all shadow-sm mb-2`}
                                   style={{
                                       width: isPassed ? 28 : 20, 
                                       height: isPassed ? 28 : 20,
                                       backgroundColor: isPassed ? theme.iconColor : '#fff',
                                       border: isPassed ? `2px solid #fff` : `3px solid ${theme.bgClass.includes('f3f4f6') ? '#e5e7eb' : theme.iconColor + '40'}`,
                                       color: isPassed ? '#fff' : theme.iconColor,
                                       marginTop: isPassed ? 0 : 4,
                                       transform: isCurrent ? 'scale(1.2)' : 'scale(1)'
                                   }}>
                                   {isPassed && <FaCheckCircle size={12}/>}
                              </div>
                              
                              <small className={`fw-bold text-nowrap ${isCurrent ? 'text-dark' : 'text-muted'}`} 
                                     style={{fontSize: '0.75rem', opacity: isPassed ? 1 : 0.6}}>
                                  {STEP_INFO[step]}
                              </small>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  }

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><Spinner animation="border" variant="primary"/></div>;
  if (!order) return <div className="vh-100 d-flex justify-content-center align-items-center">ไม่พบข้อมูล</div>;

  const theme = getStatusTheme(order.status);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', paddingBottom: '80px' }}>
      
      {/* Header Section */}
      <div className="pt-5 pb-4" style={{ background: 'linear-gradient(to bottom, #eef2ff, #f1f5f9)' }}>
          <Container>
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <Link href="/dashboard" className="text-decoration-none d-inline-flex align-items-center gap-3 group">
                      <div className="bg-white p-2 rounded-circle shadow-sm text-primary d-flex align-items-center justify-content-center hover-icon-scale" style={{width: 50, height: 50}}>
                         <FaArrowLeft size={20} />
                      </div>
                      <div>
                          <h2 className="fw-bold text-dark mb-0 display-6" style={{fontSize: '1.75rem'}}>รายละเอียดคำสั่งซื้อ</h2>
                          <small className="text-muted fs-6">ย้อนกลับไปหน้าหลัก</small>
                      </div>
                  </Link>
                  
                  <div className="d-flex gap-2 align-self-start align-self-md-center">
                      <Badge bg="white" text="dark" className="border shadow-sm fs-6 px-4 py-2 rounded-pill d-flex align-items-center gap-2">
                          <span className="text-muted fw-normal">Order ID:</span>
                          <span className="font-monospace text-primary fw-bold">#{order._id.slice(-6).toUpperCase()}</span>
                      </Badge>
                  </div>
              </div>
          </Container>
      </div>

      <Container className="mt-3">
          <Row className="g-4">
              
              {/* --- LEFT COLUMN (Main Content) --- */}
              <Col lg={8}>
                  
                  {/* Status Banner */}
                  {/* ใช้ Class ขอบสีจาก globals.css */}
                  <Card className={`shadow-sm rounded-4 overflow-hidden mb-4 hover-card-up ${theme.borderClass}`}>
                      
                      <div className={`p-4 p-lg-5 d-flex flex-column flex-md-row align-items-center gap-4 ${theme.bgClass}`}>
                          <div className="p-4 rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center flex-shrink-0 animate-bounce-slow"
                               style={{ width: 80, height: 80, color: theme.iconColor }}>
                              <theme.icon size={40} />
                          </div>
                          
                          <div className="text-center text-md-start flex-grow-1 w-100">
                              <h3 className="fw-bold mb-2" style={{color: theme.text}}>{theme.label}</h3>
                              <p className="mb-3 fw-medium opacity-75" style={{color: theme.text}}>{theme.desc}</p>
                              <TimelineHorizontal />
                          </div>
                      </div>
                  </Card>

                  {/* Items List */}
                  {/* ใช้ border-status-primary */}
                  <Card className="shadow-sm rounded-4 mb-4 overflow-hidden border-status-primary">
                      <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-white">
                          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                              <FaShoppingBag className="text-primary"/> รายการที่สั่งซื้อ
                          </h5>
                          <Badge bg="primary" className="rounded-pill px-3 py-2">{order.items.length} รายการ</Badge>
                      </div>
                      <Card.Body className="p-0">
                          {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="d-flex align-items-center p-3 p-md-4 border-bottom hover-bg-light transition-all bg-white">
                                  <div className="flex-shrink-0 me-3 me-md-4">
                                      <div className="position-relative rounded-3 overflow-hidden border bg-white shadow-sm" style={{width: 80, height: 80}}>
                                          {item.imageUrl ? (
                                              <Image src={item.imageUrl} alt={item.productName} fill style={{objectFit: 'cover'}} />
                                          ) : (
                                              <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light"><FaBoxOpen className="text-secondary"/></div>
                                          )}
                                      </div>
                                  </div>
                                  <div className="flex-grow-1">
                                      <h6 className="fw-bold text-dark mb-1">{item.productName}</h6>
                                      <div className="d-flex align-items-center gap-2 text-muted small">
                                          <Badge bg="light" text="dark" className="border fw-normal">Size: {item.size}</Badge>
                                          <span>x {item.quantity}</span>
                                      </div>
                                  </div>
                                  <div className="text-end">
                                      <div className="fw-bold text-primary fs-5">฿{(item.price * item.quantity).toLocaleString()}</div>
                                  </div>
                              </div>
                          ))}
                      </Card.Body>
                  </Card>

                  {/* Slip Preview */}
                  {order.paymentProofUrl && (
                      /* ใช้ border-status-success */
                      <Card className="shadow-sm rounded-4 overflow-hidden mb-4 hover-card-up border-status-success">
                          <div className="p-4 border-bottom bg-white">
                              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                                  <FaReceipt className="text-success"/> หลักฐานการโอนเงิน
                              </h5>
                          </div>
                          <Card.Body className="p-4 bg-white">
                              <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                                  <div className="position-relative rounded-4 overflow-hidden shadow-sm cursor-pointer hover-icon-scale border" 
                                       style={{width: 140, height: 140}} onClick={() => setShowSlip(true)}>
                                      <Image src={order.paymentProofUrl} alt="Slip" fill style={{objectFit: 'cover'}} />
                                      <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-40 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-all">
                                          <FaSearch className="text-white" size={24}/>
                                      </div>
                                  </div>
                                  <div>
                                      <Badge bg="success" className="mb-2 px-3 py-2 rounded-pill"><FaCheckCircle className="me-1"/> ตรวจสอบแล้ว</Badge>
                                      <p className="text-muted small mb-1">อัปโหลดเมื่อ: {formatDate(order.updatedAt)}</p>
                                      <Button variant="link" className="p-0 text-decoration-none fw-bold" onClick={() => setShowSlip(true)}>
                                          คลิกเพื่อดูรูปขยาย
                                      </Button>
                                  </div>
                              </div>
                          </Card.Body>
                      </Card>
                  )}
              </Col>

              {/* --- RIGHT COLUMN (Sidebar & Actions) --- */}
              <Col lg={4}>
                  <div className="sticky-top" style={{top: '30px'}}>
                      
                      {/* Action Card (Pay Now) */}
                      {order.status === 'pending_payment' && (
                          /* ใช้ border-status-warning */
                          <Card className="shadow rounded-4 mb-4 overflow-hidden hover-card-up border-status-warning">
                              <Card.Body className="p-4 text-center bg-white">
                                  <div className="d-inline-flex p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-3 shadow-sm">
                                     <FaReceipt size={30}/>
                                  </div>
                                  <h6 className="fw-bold text-secondary mb-1">ยอดที่ต้องชำระทั้งหมด</h6>
                                  <h1 className="display-5 fw-bolder text-dark mb-3">฿{order.totalPrice.toLocaleString()}</h1>
                                  <p className="text-danger small fw-bold mb-4 bg-danger bg-opacity-10 p-2 rounded-pill d-inline-block px-4">
                                      <FaClock className="me-1"/> กรุณาชำระภายใน 24 ชม.
                                  </p>
                                  
                                  <Link href={`/payment/notify/${order._id}`} className="d-block w-100">
                                      <Button className="w-100 btn-gradient-warning border-0 rounded-pill py-3 fw-bold shadow-lg hover-scale fs-5">
                                          แจ้งชำระเงิน <FaChevronRight className="ms-1"/>
                                      </Button>
                                  </Link>
                              </Card.Body>
                          </Card>
                      )}

                      {/* Summary & Info Card */}
                      {/* ใช้ border-status-general */}
                      <Card className="shadow-sm rounded-4 overflow-hidden mb-4 border-status-general">
                          <div className="p-3 bg-white border-bottom">
                              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                                  <FaReceipt className="text-secondary"/> สรุปข้อมูลคำสั่งซื้อ
                              </h6>
                          </div>
                          <Card.Body className="p-4 bg-white">
                              {/* Price Breakdown */}
                              <div className="mb-4 pb-3 border-bottom">
                                  <div className="d-flex justify-content-between mb-2 text-secondary">
                                      <span>ยอดรวมสินค้า</span>
                                      <span>฿{(order.totalPrice - (order.isShipping ? (order.totalPrice >= 1000 ? 0 : 50) : 0)).toLocaleString()}</span>
                                  </div>
                                  <div className="d-flex justify-content-between mb-2 text-secondary">
                                      <span>ค่าจัดส่ง</span>
                                      <span className={order.isShipping ? '' : 'text-success fw-bold'}>{order.isShipping ? '฿50' : 'ฟรี'}</span>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-3">
                                      <span className="fw-bold text-dark">ยอดสุทธิ</span>
                                      <span className="fw-bolder text-primary fs-4">฿{order.totalPrice.toLocaleString()}</span>
                                  </div>
                              </div>

                              {/* Customer & Address */}
                              <div className="d-flex flex-column gap-3">
                                  <div className="d-flex gap-3 align-items-start">
                                      <div className="bg-light p-2 rounded-circle text-secondary"><FaUser/></div>
                                      <div>
                                          <small className="fw-bold d-block text-dark">ผู้รับ</small>
                                          <span className="small text-secondary">{order.customerName} | {order.phone}</span>
                                      </div>
                                  </div>
                                  <div className="d-flex gap-3 align-items-start">
                                      <div className="bg-light p-2 rounded-circle text-danger"><FaMapMarkerAlt/></div>
                                      <div>
                                          <small className="fw-bold d-block text-dark">ที่อยู่จัดส่ง</small>
                                          <p className="small text-secondary mb-0 lh-sm">
                                              {order.isShipping ? order.address : 'รับด้วยตนเองที่มหาวิทยาลัยราชภัฏศรีสะเกษ'}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          </Card.Body>
                      </Card>

                  </div>
              </Col>
          </Row>
      </Container>

      {/* Modal */}
      <Modal show={showSlip} onHide={() => setShowSlip(false)} centered size="lg" contentClassName="bg-transparent border-0 shadow-none">
          <Modal.Body className="p-0 text-center position-relative">
              <Button variant="light" className="position-absolute top-0 end-0 m-3 rounded-circle shadow-lg z-3 p-2 hover-icon-scale" onClick={() => setShowSlip(false)}>
                  <FaTimes size={20}/>
              </Button>
              {order.paymentProofUrl && (
                  <img src={order.paymentProofUrl} alt="Full Slip" className="rounded-4 shadow-lg bg-white" style={{maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain'}} />
              )}
          </Modal.Body>
      </Modal>
    </div>
  );
}