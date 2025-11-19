// src/app/order/create/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { 
  FaUser, FaTruck, FaChevronRight, FaChevronLeft, FaTshirt, 
  FaClipboardList, FaCheckCircle, FaExclamationCircle, FaRegCircle, FaCheckCircle as FaCheckCircleSolid
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

// --- Theme Colors ---
const primaryColorHex = '#4F46E5'; 
const primaryGradientStart = '#4F46E5'; 
const primaryGradientEnd = '#7c3aed';   
const importantColorHex = '#ff6b6b';
const importantGradientStart = '#ff6b6b';
const importantGradientEnd = '#ff8e53';

const sizes = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];

// Define Interface เพื่อความปลอดภัยของ Type
interface ProductVariant {
  size: string;
  quantity: number;
}
interface ProductData {
  _id: string;
  name: string;
  type: 'normal' | 'mourning';
  price: number;
  imageUrl: string;
  stock: ProductVariant[];
}

function OrderFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialType = (searchParams.get('type') as 'normal' | 'mourning') || 'normal';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // เก็บข้อมูลสินค้าแบบ Map เพื่อให้เรียกใช้ง่าย: productsMap['normal']
  const [productsMap, setProductsMap] = useState<Record<string, ProductData>>({}); 
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '', address: '', isShipping: false
  });

  const [currentTab, setCurrentTab] = useState<'normal' | 'mourning'>(initialType);
  const [cart, setCart] = useState<{ [key: string]: number }>({
    // เริ่มต้นยังไม่เลือกสินค้า บังคับให้ลูกค้ากดเลือกเองเพื่อความชัวร์
  });

  // ✅ 1. Fetch สินค้าจริงจาก API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ใช้ no-store เพื่อให้ได้สต็อกล่าสุดเสมอ
        const res = await fetch(API_ENDPOINTS.PRODUCTS, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const data: ProductData[] = await res.json();

        const map: Record<string, ProductData> = {};
        data.forEach((p) => {
          map[p.type] = p;
        });
        setProductsMap(map);
        
        // ถ้า URL ระบุ type มา ให้ set tab ไปที่ type นั้น
        const typeParam = searchParams.get('type');
        if (typeParam && (typeParam === 'normal' || typeParam === 'mourning')) {
            setCurrentTab(typeParam);
        }

      } catch (error) {
        console.error("Error loading products:", error);
        alert("ไม่สามารถโหลดข้อมูลสินค้าได้ กรุณาลองรีเฟรชหน้าจอ");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  // คำนวณรายการสินค้า (Prepare Data for Display & Submit)
  const orderItemsForSummary = Object.entries(cart).map(([key, quantity]) => {
    const [type, size] = key.split('-');
    const product = productsMap[type];
    
    // Safety check
    if (!product) return null;

    return { 
      type: type as 'normal' | 'mourning',
      productId: product._id, 
      productName: product.name,
      price: product.price,
      image: product.imageUrl,
      size, 
      quantity 
    };
  }).filter(item => item !== null) as any[]; // Filter null out

  // คำนวณราคา
  const totalQuantity = orderItemsForSummary.reduce((sum, item) => sum + item.quantity, 0);
  
  // Logic ค่าส่ง: ตัวแรก 50, ตัวต่อไป +10 (เฉพาะกรณีเลือกส่ง)
  const shippingCost = formData.isShipping ? 50 + (Math.max(0, totalQuantity - 1) * 10) : 0;
  
  const itemsTotal = orderItemsForSummary.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const grandTotal = itemsTotal + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const checked = e.target.checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleQuantityChange = (size: string, increment: number) => {
    const key = `${currentTab}-${size}`;
    
    // เช็คสต็อกก่อนเพิ่ม
    const product = productsMap[currentTab];
    const stockItem = product?.stock.find(s => s.size === size);
    const maxStock = stockItem?.quantity || 0;

    setCart(prev => {
      const currentQty = prev[key] || 0;
      let newQty = currentQty + increment;
      
      // ห้ามติดลบ
      newQty = Math.max(0, newQty);
      // ห้ามเกินสต็อกจริง
      newQty = Math.min(newQty, maxStock);

      const newCart = { ...prev };
      if (newQty > 0) newCart[key] = newQty;
      else delete newCart[key];
      
      return newCart;
    });
  };

  // ✅ 2. Submit Order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalQuantity === 0) {
        alert('กรุณาเลือกสินค้าอย่างน้อย 1 ชิ้น');
        return;
    }
    
    setSubmitting(true);

    const payload = {
      customerName: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      address: formData.isShipping ? formData.address : 'รับเองที่หอการค้าฯ',
      isShipping: formData.isShipping,
      totalPrice: grandTotal, // ส่งไปให้ Backend ใช้ Validate หรือบันทึก
      items: orderItemsForSummary.map(item => ({
        productId: item.productId,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const res = await fetch(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'สั่งซื้อไม่สำเร็จ');
      }

      // ✅ Redirect ไปหน้า Success พร้อม Order ID เพื่อจ่ายเงิน
      router.push(`/order/success/${data._id}`);

    } catch (error: any) {
      console.error("Submit Error:", error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const unifiedCardStyle = {
    border: `2px solid ${primaryColorHex}`, 
    borderRadius: '24px',
    boxShadow: `0 15px 40px rgba(79, 70, 229, 0.15)`,
    backgroundColor: '#fff',
    overflow: 'hidden',
    transition: 'transform 0.3s ease'
  };
  const inputStyle = "form-control-lg bg-white border-secondary-subtle shadow-sm rounded-3 text-dark";

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
        <span className="ms-3 text-primary fw-bold">กำลังโหลดข้อมูลสินค้า...</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px', backgroundColor: '#e0e7ff' }}>
      
      {/* Header */}
      <div className="position-relative py-5 mb-4 text-center overflow-hidden">
        <div className="position-absolute top-50 start-50 translate-middle" 
             style={{ width: '60%', height: '100%', background: `radial-gradient(circle, ${primaryColorHex}15 0%, transparent 70%)`, zIndex: -1, filter: 'blur(60px)' }}>
        </div>
        <Container className="position-relative z-1">
           <h1 className="fw-bold mb-3 display-5" style={{letterSpacing: '-1px'}}>
             <span className="text-dark">แบบฟอร์ม</span> 
             <span style={{background: `linear-gradient(to right, ${primaryGradientStart}, ${primaryGradientEnd})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}> สั่งจองสินค้า</span>
           </h1>
           <p className="text-secondary mx-auto" style={{maxWidth: '600px', fontSize: '1.1rem'}}>
             กรอกข้อมูลและเลือกสินค้าเพื่อเป็นเจ้าของเสื้อที่ระลึก 243 ปี ศรีสะเกษ
           </p>
        </Container>
      </div>

      <Container>
        <Form onSubmit={handleSubmit}>
            <Row className="g-4 justify-content-center">
            
            {/* 1. Main Form */}
            <Col lg={8}>
                <Card style={unifiedCardStyle}>
                    {/* Stepper */}
                    <div className="d-flex align-items-center justify-content-center px-3 py-4 bg-light border-bottom">
                        <div className={`d-flex align-items-center ${step >= 1 ? 'text-primary' : 'text-muted'}`}>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold me-2 ${step >= 1 ? 'text-white shadow-sm' : 'bg-white border'}`} style={{width:36, height:36, transition:'0.3s', backgroundColor: step >= 1 ? primaryColorHex : 'transparent'}}>1</div>
                            <span className="fw-bold d-none d-sm-block">ข้อมูลผู้สั่ง</span>
                        </div>
                        <div className="mx-3 bg-secondary bg-opacity-25 rounded-pill" style={{height: '4px', width: '60px'}}>
                            <div className="rounded-pill h-100" style={{backgroundColor: primaryColorHex, width: step === 2 ? '100%' : '0%', transition: '0.5s ease'}}></div>
                        </div>
                        <div className={`d-flex align-items-center ${step === 2 ? 'text-primary' : 'text-muted'}`}>
                            <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold me-2 ${step === 2 ? 'text-white shadow-sm' : 'bg-white border'}`} style={{width:36, height:36, transition:'0.3s', backgroundColor: step === 2 ? primaryColorHex : 'transparent'}}>2</div>
                            <span className="fw-bold d-none d-sm-block">เลือกสินค้า</span>
                        </div>
                    </div>

                    <Card.Body className="p-4 p-md-5">
                        {/* Step 1: ข้อมูลผู้สั่ง */}
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <h4 className="fw-bold text-dark mb-4"><FaUser className="me-2" style={{color: primaryColorHex}}/> ข้อมูลส่วนตัว</h4>
                                <Row className="g-3 mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">ชื่อจริง *</Form.Label>
                                            <Form.Control id="firstName" name="firstName" placeholder="ระบุชื่อจริง" value={formData.firstName} onChange={handleChange} required className={inputStyle} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">นามสกุล *</Form.Label>
                                            <Form.Control id="lastName" name="lastName" placeholder="ระบุนามสกุล" value={formData.lastName} onChange={handleChange} required className={inputStyle} />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="g-3 mb-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">เบอร์โทรศัพท์ *</Form.Label>
                                            <Form.Control id="phone" name="phone" placeholder="0xx-xxx-xxxx" type="tel" value={formData.phone} onChange={handleChange} required maxLength={10} className={inputStyle} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold">อีเมล (ถ้ามี)</Form.Label>
                                            <Form.Control id="email" name="email" placeholder="name@example.com" type="email" value={formData.email} onChange={handleChange} className={inputStyle} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="my-4">
                                    <h4 className="fw-bold text-dark mb-3"><FaTruck className="me-2" style={{color: primaryColorHex}}/> การจัดส่ง</h4>
                                    <div 
                                        className={`p-3 rounded-4 border cursor-pointer transition-all ${formData.isShipping ? 'bg-opacity-10 shadow-sm' : 'bg-white hover-shadow-sm'}`} 
                                        style={{borderColor: formData.isShipping ? primaryColorHex : '#dee2e6', backgroundColor: formData.isShipping ? `${primaryColorHex}15` : '#fff'}}
                                        onClick={() => setFormData({...formData, isShipping: !formData.isShipping})}
                                    >
                                        <div className="d-flex align-items-center">
                                            <Form.Check 
                                                type="switch"
                                                id="isShipping"
                                                name="isShipping"
                                                checked={formData.isShipping}
                                                onChange={handleChange}
                                                className="fs-4 me-3 pointer-events-none"
                                            />
                                            <div>
                                                <span className="fw-bold text-dark d-block fs-6">ต้องการจัดส่งทางไปรษณีย์</span>
                                                <small className="text-secondary">ค่าส่งเริ่มต้น 50 บาท (บวกเพิ่ม 10 บาท/ตัว)</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {formData.isShipping && (
                                    <Form.Group className="mb-3 animate-slide-down">
                                         <Form.Label className="small fw-bold">ที่อยู่สำหรับจัดส่ง *</Form.Label>
                                         <Form.Control as="textarea" id="address" name="address" placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" style={{ height: '100px' }} value={formData.address} onChange={handleChange} required={formData.isShipping} className={inputStyle}/>
                                    </Form.Group>
                                )}

                                <div className="text-end mt-5">
                                    <Button 
                                        size="lg" 
                                        className="rounded-pill px-5 fw-bold shadow-lg hover-lift" 
                                        style={{
                                            background: `linear-gradient(to right, ${primaryGradientStart}, ${primaryGradientEnd})`, 
                                            border: 'none'
                                        }}
                                        onClick={() => {
                                            if (!formData.firstName || !formData.lastName || !formData.phone) {
                                              alert("กรุณากรอกข้อมูล ชื่อ และ เบอร์โทรศัพท์ ให้ครบถ้วน");
                                              return;
                                            }
                                            if (formData.isShipping && !formData.address) {
                                              alert("กรุณากรอกที่อยู่จัดส่ง");
                                              return;
                                            }
                                            setStep(2);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        ถัดไป <FaChevronRight className="ms-2" size={14}/>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: เลือกสินค้า */}
                        {step === 2 && (
                            <div className="animate-fade-in">
                                <h4 className="fw-bold text-dark mb-4"><FaTshirt className="me-2" style={{color: primaryColorHex}}/> เลือกรายการสินค้า</h4>
                                
                                <Row className="g-3 mb-5 justify-content-center">
                                {Object.values(productsMap).map((product) => (
                                    <Col xs={12} sm={6} md={5} key={product._id}>
                                        <Card 
                                            className={`h-100 rounded-4 text-center cursor-pointer transition-all`} 
                                            onClick={() => setCurrentTab(product.type)}
                                            style={{
                                                border: currentTab === product.type ? `3px solid ${primaryColorHex}` : '1px solid #e5e7eb',
                                                backgroundColor: currentTab === product.type ? '#fff' : '#f8f9fa',
                                                transform: currentTab === product.type ? 'translateY(-5px)' : 'none',
                                                boxShadow: currentTab === product.type ? `0 10px 25px ${primaryColorHex}30` : 'none'
                                            }}
                                        >
                                            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3 p-md-4">
                                                <div className="position-relative mb-2 mx-auto" style={{width: 120, height: 120}}>
                                                    <Image 
                                                        src={product.imageUrl || '/images/placeholder.png'} 
                                                        alt={product.name} 
                                                        fill 
                                                        style={{objectFit:'contain', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.15))'}} 
                                                    />
                                                </div>
                                                <h6 className="fw-bold text-dark mb-1">{product.name}</h6>
                                                <div className="mt-2">
                                                    {currentTab === product.type ? (
                                                        <FaCheckCircleSolid size={28} style={{color: primaryColorHex}} className="animate-pop" />
                                                    ) : (
                                                        <FaRegCircle size={24} className="text-muted opacity-50" />
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                                </Row>

                                <div className="d-flex align-items-center mb-3">
                                    <h5 className="fw-bold text-dark mb-0 me-2">เลือกขนาดและจำนวน</h5>
                                    <span className="badge rounded-pill px-3 py-2 bg-primary">
                                        {productsMap[currentTab]?.name}
                                    </span>
                                </div>
                                
                                <Row className="g-3 mb-4">
                                {sizes.map(size => {
                                    const key = `${currentTab}-${size}`;
                                    const qty = cart[key] || 0;
                                    const isSelected = qty > 0;
                                    
                                    // เช็คสต็อกจริงจาก API
                                    const variant = productsMap[currentTab]?.stock?.find((s) => s.size === size);
                                    const remaining = variant?.quantity || 0;
                                    const isOutOfStock = remaining <= 0;

                                    return (
                                        <Col xs={6} sm={4} md={3} key={size}>
                                            <Card 
                                                className={`rounded-4 transition-all h-100 ${isOutOfStock ? 'opacity-50 bg-light' : ''}`}
                                                style={{
                                                    border: isSelected ? `2px solid ${primaryColorHex}` : '1px solid #e5e7eb',
                                                    backgroundColor: isSelected ? '#eef2ff' : '#fff', 
                                                }}
                                            >
                                                <Card.Body className="p-2 text-center d-flex flex-column justify-content-between">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                      <h6 className={`fw-bold mb-0 ${isSelected ? 'text-dark' : 'text-secondary'}`}>{size}</h6>
                                                      <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                                        เหลือ {remaining}
                                                      </small>
                                                    </div>
                                                    
                                                    {isOutOfStock ? (
                                                      <span className="badge bg-secondary">สินค้าหมด</span>
                                                    ) : (
                                                      <div 
                                                        className="d-flex align-items-center justify-content-center rounded-3 border bg-white"
                                                        style={{ borderColor: isSelected ? primaryColorHex : '#dee2e6' }}
                                                      >
                                                          <Button variant="link" className="text-decoration-none px-2 py-1 text-secondary" onClick={() => handleQuantityChange(size, -1)}><span className="fs-5 fw-bold">-</span></Button>
                                                          <span className={`fw-bold fs-5 px-2 ${isSelected ? 'text-dark' : 'text-muted'}`} style={{minWidth: '30px'}}>{qty}</span>
                                                          <Button variant="link" className="text-decoration-none px-2 py-1 text-primary" onClick={() => handleQuantityChange(size, 1)} disabled={qty >= remaining}><span className="fs-5 fw-bold">+</span></Button>
                                                      </div>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })}
                                </Row>
                                
                                <div className="d-flex justify-content-start mt-4">
                                    <Button 
                                        variant="light"
                                        size="lg" 
                                        className="rounded-pill px-4 fw-bold shadow-sm text-primary border-primary bg-white hover-scale" 
                                        onClick={() => setStep(1)}
                                    >
                                        <FaChevronLeft className="me-2" size={14}/> ย้อนกลับ
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </Col>

            {/* 2. Summary Sidebar */}
            <Col lg={4}>
                <div className="sticky-top" style={{top: '100px', zIndex: 10}}>
                    <Card style={unifiedCardStyle}>
                        <div className="p-3 text-white text-center" style={{background: `linear-gradient(to right, ${primaryGradientStart}, ${primaryGradientEnd})`}}>
                            <h5 className="fw-bold mb-0 text-white"><FaClipboardList className="me-2"/> สรุปรายการสั่งซื้อ</h5>
                        </div>
                        <Card.Body className="p-4 bg-white">
                            {/* List สินค้า */}
                            <div className="d-flex flex-column gap-3 mb-4" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                {totalQuantity === 0 ? (
                                    <div className="text-center py-4 bg-light rounded-3 border border-dashed">
                                        <FaTshirt size={30} className="text-muted mb-2 opacity-50"/>
                                        <p className="text-muted mb-0 small">ยังไม่ได้เลือกสินค้า</p>
                                    </div>
                                ) : (
                                    orderItemsForSummary.map((item, i) => (
                                    <div key={i} className="d-flex align-items-center justify-content-between pb-2 border-bottom border-light">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="position-relative flex-shrink-0" style={{width: 40, height: 40}}>
                                                    <Image 
                                                        src={item.image || '/images/placeholder.png'} 
                                                        alt="shirt" 
                                                        fill 
                                                        style={{objectFit:'contain'}} 
                                                    />
                                                </div>
                                                <div className="lh-1 text-start">
                                                    <div className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>
                                                        {item.productName}
                                                    </div>
                                                    <small className="text-muted" style={{fontSize: '0.8rem'}}>ไซส์ {item.size} x {item.quantity}</small>
                                                </div>
                                            </div>
                                            <span className="fw-bold text-dark">฿{(item.quantity * item.price).toLocaleString()}</span>
                                    </div>
                                    ))
                                )}
                            </div>

                            <div className="d-flex justify-content-between align-items-center small mb-2 text-secondary">
                                <span><FaTruck className="me-1"/> ค่าจัดส่ง ({totalQuantity} ตัว)</span>
                                <span className="fw-bold text-dark">{formData.isShipping ? `฿${shippingCost.toLocaleString()}` : 'ฟรี (รับเอง)'}</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-3 border-top border-2 mt-2">
                                <span className="fw-bold fs-5 text-primary">ยอดรวมทั้งสิ้น</span>
                                <h3 className="fw-bold mb-0 text-primary">฿{grandTotal.toLocaleString()}</h3>
                            </div>

                            <hr className="my-4"/>

                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-100 rounded-pill fw-bold shadow-lg" 
                                style={{
                                    background: `linear-gradient(to right, ${primaryGradientStart}, ${primaryGradientEnd})`, 
                                    border: 'none'
                                }}
                                disabled={totalQuantity === 0 || submitting} 
                            >
                                {submitting ? (
                                  <>กำลังบันทึก...</>
                                ) : (
                                  <><FaCheckCircle className="me-2"/> ยืนยันการสั่งจอง</>
                                )}
                            </Button>

                        </Card.Body>
                    </Card>
                </div>
            </Col>
            </Row>

            {/* Important Info */}
            <Row className="mt-4 justify-content-center">
                <Col lg={8}>
                  <Card style={{
                    border: `2px solid ${importantColorHex}`, 
                    borderRadius: '24px',
                    boxShadow: `0 15px 40px rgba(255, 107, 107, 0.15)`,
                    backgroundColor: '#fff',
                    overflow: 'hidden'
                  }}>
                      <div className="p-3 text-center" style={{background: `linear-gradient(to right, ${importantGradientStart}, ${importantGradientEnd})`}}>
                          <h5 className="fw-bold mb-0 text-white"><FaExclamationCircle className="me-2"/> ข้อมูลสำคัญ</h5>
                      </div>
                      <Card.Body className="p-4 bg-white text-center text-secondary small">
                          <p className="mb-1">กรุณาตรวจสอบข้อมูล ชื่อ-ที่อยู่ และ เบอร์โทรศัพท์ ให้ถูกต้องก่อนกดยืนยัน</p>
                          <p className="mb-0">หากข้อมูลผิดพลาดอาจทำให้การจัดส่งล่าช้า</p>
                      </Card.Body>
                  </Card>
                </Col>
            </Row>
        </Form>
      </Container>
    </div>
  );
}

export default function OrderCreatePage() {
  return (
    <Suspense fallback={<div className="d-flex justify-content-center align-items-center min-vh-100">Loading...</div>}>
      <OrderFormContent />
    </Suspense>
  );
}