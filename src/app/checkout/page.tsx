'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaUser, FaTruck, FaMapMarkerAlt, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { useSession } from "next-auth/react";
import { useCart } from '@/context/CartContext';
import API_ENDPOINTS from '@/lib/api';

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // เพิ่มตัวแปรเช็คสถานะความสำเร็จ
  const [isSuccess, setIsSuccess] = useState(false); 
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', address: '', isShipping: true
  });

  useEffect(() => {
      if (session?.user) {
          // @ts-ignore
          const userPhone = session.user.name || ''; 
          if (!isNaN(Number(userPhone))) {
              setFormData(prev => ({ ...prev, phone: userPhone }));
          }
      }
  }, [session]);

  // ปรับ Logic Redirect: ถ้าตะกร้าว่าง AND ยังไม่ได้สั่งซื้อสำเร็จ ถึงค่อยดีดกลับ
  useEffect(() => {
      if (cart.length === 0 && !isSuccess) {
          router.replace('/products');
      }
  }, [cart, router, isSuccess]);

  const shippingCost = formData.isShipping ? 50 + (Math.max(0, cartCount - 1) * 10) : 0;
  const grandTotal = cartTotal + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!session) return router.push('/auth/login');
    if (formData.isShipping && !formData.address) return setError('กรุณากรอกที่อยู่จัดส่ง');

    setSubmitting(true);

    const payload = {
      customerName: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      address: formData.isShipping ? formData.address : 'มหาวิทยาลัยราชภัฏศรีสะเกษ',
      isShipping: formData.isShipping,
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const res = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(session as any)?.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'สั่งซื้อไม่สำเร็จ');

      // ตั้งค่าว่าเป็น Success แล้ว (เพื่อกันไม่ให้ useEffect ดีดกลับ)
      setIsSuccess(true);

      // ล้างตะกร้า
      clearCart();
      
      // ไปหน้า Success
      router.push(`/orders/success/${data._id}`); 

    } catch (error: any) {
      console.error(error);
      setError(error.message);
      setSubmitting(false);
    } 
  };

  if (cart.length === 0 && !isSuccess) return null; 

  return (
    <Container className="py-5">
       <h2 className="fw-bold text-center mb-4">ยืนยันคำสั่งซื้อ</h2>
       
       <Form onSubmit={handleSubmit}>
       <Row className="g-4 justify-content-center">
           
           {/* Left: ข้อมูลผู้รับ */}
           <Col lg={7}>
               <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                   <div className="p-3 px-4 bg-light border-bottom d-flex align-items-center">
                       <div className="bg-white p-2 rounded-circle shadow-sm me-3 text-primary"><FaUser/></div>
                       <h5 className="mb-0 fw-bold text-dark">ข้อมูลผู้รับสินค้า</h5>
                   </div>
                   <Card.Body className="p-4">
                       <Row className="g-3 mb-3">
                           <Col md={6}>
                               <Form.Group>
                                   <Form.Label className="small fw-bold">ชื่อจริง</Form.Label>
                                   <Form.Control name="firstName" value={formData.firstName} onChange={handleChange} required className="bg-light border-0 py-2"/>
                               </Form.Group>
                           </Col>
                           <Col md={6}>
                               <Form.Group>
                                   <Form.Label className="small fw-bold">นามสกุล</Form.Label>
                                   <Form.Control name="lastName" value={formData.lastName} onChange={handleChange} required className="bg-light border-0 py-2"/>
                               </Form.Group>
                           </Col>
                           <Col md={12}>
                               <Form.Group>
                                   <Form.Label className="small fw-bold">เบอร์โทรศัพท์ (ใช้ติดตามสถานะ)</Form.Label>
                                   <Form.Control name="phone" type="tel" value={formData.phone} onChange={handleChange} required maxLength={10} className="bg-light border-0 py-2 fw-bold text-primary"/>
                               </Form.Group>
                           </Col>
                       </Row>

                       <h6 className="fw-bold mt-4 mb-3 text-dark d-flex align-items-center"><FaTruck className="me-2 text-primary"/> วิธีการจัดส่ง</h6>
                       <div className="d-flex gap-2 mb-3">
                           <div 
                               className={`flex-grow-1 p-3 rounded-3 border cursor-pointer transition-all text-center ${formData.isShipping ? 'bg-primary bg-opacity-10 border-primary text-primary' : 'bg-white'}`}
                               onClick={() => setFormData(prev => ({ ...prev, isShipping: true }))}
                           >
                               <div className="fw-bold">📮 จัดส่งพัสดุ</div>
                               <small>+50 บาท</small>
                           </div>
                           <div 
                               className={`flex-grow-1 p-3 rounded-3 border cursor-pointer transition-all text-center ${!formData.isShipping ? 'bg-primary bg-opacity-10 border-primary text-primary' : 'bg-white'}`}
                               onClick={() => setFormData(prev => ({ ...prev, isShipping: false }))}
                           >
                               <div className="fw-bold">🏢 รับเอง</div>
                               <small>ฟรี (มหาวิทยาลัยราชภัฏศรีสะเกษ)</small>
                           </div>
                       </div>

                       {formData.isShipping && (
                           <Form.Group className="animate-fade-in">
                               <Form.Label className="small fw-bold"><FaMapMarkerAlt className="me-1"/> ที่อยู่จัดส่ง</Form.Label>
                               <Form.Control as="textarea" name="address" rows={3} value={formData.address} onChange={handleChange} required className="bg-light border-0"/>
                           </Form.Group>
                       )}
                   </Card.Body>
               </Card>
           </Col>

           {/* Right: สรุปยอด */}
           <Col lg={5}>
               <Card className="border-0 shadow-lg rounded-4 overflow-hidden sticky-top" style={{top: '100px'}}>
                   <div className="p-3 px-4 bg-primary text-white d-flex align-items-center">
                       <FaClipboardList className="me-2"/> <h5 className="mb-0 fw-bold">สรุปรายการ</h5>
                   </div>
                   <Card.Body className="p-4">
                       <div className="mb-4" style={{maxHeight: '200px', overflowY: 'auto'}}>
                           {cart.map(item => (
                               <div key={item.uniqueKey} className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
                                   <div>
                                       <div className="fw-bold text-dark small">{item.name}</div>
                                       <div className="text-muted small">Size: {item.size} x {item.quantity}</div>
                                   </div>
                                   <div className="fw-bold">฿{(item.price * item.quantity).toLocaleString()}</div>
                               </div>
                           ))}
                       </div>

                       <div className="d-flex justify-content-between mb-2 text-secondary">
                           <span>ยอดรวมสินค้า</span>
                           <span>฿{cartTotal.toLocaleString()}</span>
                       </div>
                       <div className="d-flex justify-content-between mb-3 text-secondary">
                           <span>ค่าจัดส่ง</span>
                           <span>{shippingCost > 0 ? `฿${shippingCost}` : 'ฟรี'}</span>
                       </div>
                       
                       <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                           <span className="fw-bold text-dark fs-5">ยอดสุทธิ</span>
                           <span className="fw-bold text-primary fs-3">฿{grandTotal.toLocaleString()}</span>
                       </div>

                       {error && <Alert variant="danger" className="mt-3 small">{error}</Alert>}

                       <Button 
                            type="submit" 
                            className="w-100 btn-gradient-primary py-3 rounded-pill fw-bold shadow mt-4 hover-lift"
                            disabled={submitting}
                       >
                           {submitting ? <Spinner size="sm"/> : <><FaCheckCircle className="me-2"/> ยืนยันการสั่งซื้อ</>}
                       </Button>
                   </Card.Body>
               </Card>
           </Col>

       </Row>
       </Form>
    </Container>
  );
}