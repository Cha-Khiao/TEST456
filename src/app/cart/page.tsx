'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus, FaArrowRight, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  if (cart.length === 0) {
      return (
          <Container className="text-center py-5 d-flex flex-column align-items-center justify-content-center" style={{minHeight: '60vh'}}>
              <div className="mb-4 p-4 bg-light rounded-circle">
                <FaShoppingBag size={60} className="text-muted opacity-50"/>
              </div>
              <h3 className="fw-bold text-dark">ตะกร้าของคุณว่างเปล่า</h3>
              <p className="text-muted mb-4">เลือกซื้อสินค้าที่ถูกใจแล้วกลับมาใหม่นะครับ</p>
              <Link href="/products">
                <Button className="btn-gradient-primary rounded-pill px-5 py-3 fw-bold shadow hover-lift">
                    ไปเลือกซื้อสินค้า
                </Button>
              </Link>
          </Container>
      );
  }

  return (
    <Container className="py-5">
        <div className="d-flex align-items-center mb-4">
            <Link href="/products" className="text-decoration-none text-secondary me-3">
                <FaArrowLeft />
            </Link>
            <h2 className="fw-bold mb-0 text-dark">ตะกร้าสินค้า <span className="text-muted fs-4">({cart.length})</span></h2>
        </div>

        <Row className="g-4">
            {/* รายการสินค้า */}
            <Col lg={8}>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="bg-light p-3 px-4 d-none d-md-flex text-secondary fw-bold small">
                        <div style={{width: '50%'}}>สินค้า</div>
                        <div style={{width: '20%'}} className="text-center">ราคา</div>
                        <div style={{width: '20%'}} className="text-center">จำนวน</div>
                        <div style={{width: '10%'}}></div>
                    </div>

                    {cart.map((item) => (
                        <div key={item.uniqueKey} className="d-flex align-items-center p-3 border-bottom bg-white">
                            {/* รูป + ชื่อ */}
                            <div className="d-flex align-items-center" style={{width: '50%'}}>
                                <div className="position-relative rounded-3 overflow-hidden border flex-shrink-0 me-3" style={{width: 70, height: 70}}>
                                    <Image src={item.imageUrl} alt={item.name} fill style={{objectFit:'cover'}}/>
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1 text-dark text-truncate" style={{maxWidth: '200px'}}>{item.name}</h6>
                                    <div className="text-muted small">ไซส์: <span className="badge bg-light text-dark border">{item.size}</span></div>
                                </div>
                            </div>

                            {/* ราคา (Desktop) */}
                            <div className="d-none d-md-block text-center fw-bold text-primary" style={{width: '20%'}}>
                                ฿{(item.price * item.quantity).toLocaleString()}
                            </div>

                            {/* ปุ่มเพิ่มลด */}
                            <div className="d-flex align-items-center justify-content-center" style={{width: '20%'}}>
                                <div className="d-flex align-items-center border rounded-pill px-2 py-1">
                                    <Button variant="link" size="sm" className="p-0 text-secondary" onClick={() => updateQuantity(item.uniqueKey, -1)}><FaMinus size={10}/></Button>
                                    <span className="fw-bold mx-2" style={{minWidth:'20px', textAlign:'center'}}>{item.quantity}</span>
                                    <Button variant="link" size="sm" className="p-0 text-primary" onClick={() => updateQuantity(item.uniqueKey, 1)}><FaPlus size={10}/></Button>
                                </div>
                            </div>

                            {/* ปุ่มลบ */}
                            <div className="text-end" style={{width: '10%'}}>
                                <Button variant="link" className="text-danger opacity-50 hover-opacity-100" onClick={() => removeFromCart(item.uniqueKey)}><FaTrash/></Button>
                            </div>
                        </div>
                    ))}

                    {/* Mobile Total & Clear */}
                    <div className="p-3 bg-light d-flex justify-content-between align-items-center">
                        <Button variant="link" className="text-danger text-decoration-none small p-0" onClick={clearCart}>ล้างตะกร้าทั้งหมด</Button>
                        <span className="d-md-none fw-bold">รวม: ฿{cartTotal.toLocaleString()}</span>
                    </div>
                </Card>
            </Col>

            {/* สรุปยอด */}
            <Col lg={4}>
                <Card className="border-0 shadow-lg rounded-4 p-4 sticky-top" style={{top: '100px', background: 'linear-gradient(to bottom right, #ffffff, #f8f9fa)'}}>
                    <h5 className="fw-bold mb-4 text-dark">สรุปคำสั่งซื้อ</h5>
                    
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary">ยอดรวมสินค้า</span>
                        <span className="fw-bold">฿{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-4">
                        <span className="text-secondary">ค่าจัดส่ง</span>
                        <span className="text-success fw-bold small bg-success bg-opacity-10 px-2 rounded">คำนวณหน้าถัดไป</span>
                    </div>
                    
                    <hr className="border-secondary opacity-10"/>
                    
                    <div className="d-flex justify-content-between mb-4 align-items-center">
                        <span className="fs-5 fw-bold text-dark">ยอดสุทธิ</span>
                        <span className="fs-3 fw-bold text-primary">฿{cartTotal.toLocaleString()}</span>
                    </div>
                    
                    <Link href="/checkout" className="text-decoration-none"> 
                        <Button className="w-100 btn-gradient-primary py-3 rounded-pill fw-bold shadow-sm hover-lift d-flex align-items-center justify-content-center">
                            ดำเนินการสั่งซื้อ <FaArrowRight className="ms-2"/>
                        </Button>
                    </Link>
                    
                    <div className="text-center mt-3">
                        <Link href="/products" className="text-secondary small text-decoration-none">ซื้อสินค้าเพิ่มเติม</Link>
                    </div>
                </Card>
            </Col>
        </Row>
    </Container>
  );
}