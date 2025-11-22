// src/app/orders/details/[id]/page.tsx
'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal } from 'react-bootstrap';
import { 
  FaArrowLeft, FaBoxOpen, FaTruck, FaMapMarkerAlt, 
  FaUser, FaPhone, FaReceipt, FaCheckCircle, FaClock, FaSearch, FaTimesCircle
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const primaryColorHex = '#4F46E5';

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
            headers: {
                'Authorization': `Bearer ${(session as any)?.accessToken}`
            }
        });

        if (!res.ok) throw new Error('Failed to fetch order');
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, session]);

  // --- Timeline Logic ---
  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    const statusOrder = ['pending_payment', 'verification', 'shipping', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentStatus === 'cancelled') return 'cancelled';
    if (currentIndex >= stepIndex) return 'active';
    return 'inactive';
  };

  const renderTimeline = () => {
    if (!order) return null;
    if (order.status === 'cancelled') {
        return (
            <div className="bg-danger bg-opacity-10 border border-danger text-danger p-3 rounded-3 text-center mb-4">
                <FaTimesCircle className="me-2" size={20}/> คำสั่งซื้อนี้ถูกยกเลิกแล้ว
            </div>
        );
    }

    const steps = [
      { label: 'รอชำระเงิน', icon: FaClock },
      { label: 'ตรวจสอบ', icon: FaSearch },
      { label: 'กำลังจัดส่ง', icon: FaTruck },
      { label: 'สำเร็จ', icon: FaCheckCircle },
    ];

    return (
      <div className="position-relative d-flex justify-content-between align-items-center mb-5 px-2">
        {/* Progress Line (Background) */}
        <div className="position-absolute top-50 start-0 w-100 bg-secondary bg-opacity-25 rounded-pill" style={{height: '4px', zIndex: 0}}></div>
        
        {/* Progress Line (Active) */}
        <div 
            className="position-absolute top-50 start-0 bg-primary rounded-pill transition-all" 
            style={{
                height: '4px', 
                zIndex: 0,
                width: `${(['pending_payment', 'verification', 'shipping', 'completed'].indexOf(order.status) / 3) * 100}%`
            }}
        ></div>

        {steps.map((step, index) => {
          const status = getStepStatus(index, order.status);
          const isActive = status === 'active';
          const Icon = step.icon;

          return (
            <div key={index} className="position-relative z-1 text-center" style={{width: '80px'}}>
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm transition-all`}
                style={{
                    width: 40, 
                    height: 40, 
                    backgroundColor: isActive ? primaryColorHex : '#fff',
                    border: isActive ? `none` : '2px solid #e5e7eb',
                    color: isActive ? '#fff' : '#9ca3af'
                }}
              >
                <Icon size={16} />
              </div>
              <small className={`fw-bold d-block ${isActive ? 'text-primary' : 'text-muted'}`} style={{fontSize: '0.75rem'}}>
                {step.label}
              </small>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="min-vh-100 d-flex justify-content-center align-items-center"><Spinner animation="border" variant="primary"/></div>;
  if (!order) return <div className="min-vh-100 d-flex justify-content-center align-items-center">ไม่พบข้อมูล</div>;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '120px', backgroundColor: '#f1f5f9' }}>
      
      {/* Header Navbar */}
      <div className="bg-white shadow-sm py-3 mb-4 sticky-top" style={{top: 0, zIndex: 100}}>
        <Container>
            <div className="d-flex align-items-center">
                <Link href="/dashboard" className="text-secondary me-3">
                    <FaArrowLeft size={20}/>
                </Link>
                <div>
                    <h5 className="fw-bold mb-0 text-dark">รายละเอียดคำสั่งซื้อ</h5>
                    <small className="text-muted">#{order._id.slice(-6).toUpperCase()}</small>
                </div>
            </div>
        </Container>
      </div>

      <Container>
        {/* Timeline Section */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <Card.Body className="p-4">
                <h6 className="fw-bold text-secondary mb-4">สถานะสินค้า</h6>
                {renderTimeline()}
                
                {order.status === 'pending_payment' && (
                    <div className="bg-warning bg-opacity-10 border border-warning p-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                        <div className="d-flex align-items-center text-warning-emphasis">
                            <FaClock className="me-2"/>
                            <span>กรุณาชำระเงินภายใน 24 ชม.</span>
                        </div>
                        <Link href={`/payment/notify/${order._id}`}>
                            <Button size="sm" className="btn-gradient-warning border-0 rounded-pill fw-bold px-3">
                                แจ้งชำระเงินทันที
                            </Button>
                        </Link>
                    </div>
                )}
            </Card.Body>
        </Card>

        <Row className="g-4">
            {/* Left Column: Items */}
            <Col lg={8}>
                <Card className="border-0 shadow-sm rounded-4 mb-4">
                    <div className="p-3 border-bottom bg-light rounded-top-4">
                        <h6 className="fw-bold mb-0 text-dark"><FaBoxOpen className="me-2 text-primary"/> รายการสินค้า</h6>
                    </div>
                    <Card.Body className="p-0">
                        {order.items.map((item: any, i: number) => (
                            <div key={i} className="d-flex p-3 border-bottom align-items-center">
                                
                                {/* ✅ ส่วนที่แก้ไข: แสดงรูปภาพ (ถ้ามี) หรือแสดงไอคอน (ถ้าไม่มี) */}
                                <div className="position-relative rounded-3 overflow-hidden border me-3 flex-shrink-0" style={{width: 60, height: 60}}>
                                    {item.imageUrl ? (
                                        <Image 
                                            src={item.imageUrl} 
                                            alt={item.productName} 
                                            fill 
                                            style={{objectFit: 'cover'}} 
                                        />
                                    ) : (
                                        <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center">
                                             <FaBoxOpen className="text-secondary opacity-50"/>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow-1">
                                    <div className="fw-bold text-dark">{item.productName}</div>
                                    <div className="text-muted small">ไซส์: <Badge bg="light" text="dark" className="border">{item.size}</Badge> x {item.quantity} ตัว</div>
                                </div>
                                <div className="text-end fw-bold">
                                    ฿{(item.price * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        
                        {/* Summary Footer */}
                        <div className="p-3 bg-light bg-opacity-50">
                            <div className="d-flex justify-content-between mb-2 small">
                                <span className="text-secondary">ยอดรวมสินค้า</span>
                                <span className="fw-bold">฿{(order.totalPrice - (order.isShipping ? (order.totalPrice >= 1000 ? 0 : 50) : 0)).toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2 small">
                                <span className="text-secondary">ค่าจัดส่ง</span>
                                <span className="fw-bold">{order.isShipping ? '฿50' : 'ฟรี (รับเอง)'}</span>
                            </div>
                            <hr className="my-2 opacity-25"/>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold text-primary">ยอดสุทธิ</span>
                                <span className="fw-bold text-primary fs-5">฿{order.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* Payment Proof Section */}
                {order.paymentProofUrl && (
                    <Card className="border-0 shadow-sm rounded-4">
                        <div className="p-3 border-bottom bg-light rounded-top-4 d-flex justify-content-between align-items-center">
                            <h6 className="fw-bold mb-0 text-dark"><FaReceipt className="me-2 text-success"/> หลักฐานการโอนเงิน</h6>
                            <Badge bg="success" className="rounded-pill fw-normal">แนบแล้ว</Badge>
                        </div>
                        <Card.Body className="p-4 text-center">
                            <div className="position-relative rounded-3 overflow-hidden border cursor-pointer mx-auto hover-zoom" style={{width: '100%', maxWidth: '300px', height: '200px'}} onClick={() => setShowSlip(true)}>
                                <Image 
                                    src={order.paymentProofUrl} 
                                    alt="Slip" 
                                    fill 
                                    style={{objectFit: 'cover'}}
                                />
                                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25 d-flex align-items-center justify-content-center opacity-0 hover-opacity-100 transition-all">
                                    <span className="text-white fw-bold"><FaSearch className="me-1"/> กดเพื่อขยาย</span>
                                </div>
                            </div>
                            <div className="text-muted small mt-2">อัปโหลดเมื่อ: {formatDate(order.updatedAt)}</div>
                        </Card.Body>
                    </Card>
                )}
            </Col>

            {/* Right Column: Info */}
            <Col lg={4}>
                <Card className="border-0 shadow-sm rounded-4 mb-4 h-100">
                    <div className="p-3 border-bottom bg-light rounded-top-4">
                        <h6 className="fw-bold mb-0 text-dark"><FaUser className="me-2 text-info"/> ข้อมูลผู้รับ</h6>
                    </div>
                    <Card.Body className="p-4">
                        <div className="mb-3">
                            <small className="text-secondary d-block">ชื่อ-นามสกุล</small>
                            <span className="fw-bold">{order.customerName}</span>
                        </div>
                        <div className="mb-3">
                            <small className="text-secondary d-block">เบอร์โทรศัพท์</small>
                            <div className="d-flex align-items-center">
                                <FaPhone className="text-success me-2" size={14}/>
                                <span className="fw-bold">{order.phone}</span>
                            </div>
                        </div>
                        <hr className="opacity-10"/>
                        <div>
                            <small className="text-secondary d-block mb-1"><FaMapMarkerAlt className="me-1 text-danger"/> ที่อยู่จัดส่ง</small>
                            <p className="mb-0 small text-dark bg-light p-3 rounded-3 border border-light-subtle">
                                {order.isShipping ? order.address : 'รับด้วยตนเองที่หอการค้าจังหวัดศรีสะเกษ'}
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        {/* Slip Modal */}
        <Modal show={showSlip} onHide={() => setShowSlip(false)} centered size="lg">
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold fs-6">หลักฐานการโอนเงิน</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0 bg-dark text-center">
                {order.paymentProofUrl && (
                    <img src={order.paymentProofUrl} alt="Full Slip" style={{maxWidth: '100%', maxHeight: '80vh'}} />
                )}
            </Modal.Body>
        </Modal>

      </Container>
    </div>
  );
}