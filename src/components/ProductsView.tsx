// src/components/ProductsView.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { 
  FaShoppingCart, FaTruck, FaCheckCircle, FaInfoCircle, FaRulerCombined, FaBoxOpen
} from 'react-icons/fa';

// รับ Props จาก Server
interface ProductsViewProps {
  products: any[];
  stockTableData: any[];
}

export default function ProductsView({ products, stockTableData }: ProductsViewProps) {
  
  // จัดเรียงสินค้า: ให้ Normal มาก่อน Mourning เสมอ
  const sortedProducts = [...products].sort((a, b) => {
    if (a.type === 'normal') return -1; // normal มาก่อน
    if (b.type === 'normal') return 1;
    return 0;
  });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div className="position-relative py-5 mb-4 text-center overflow-hidden">
        <div className="position-absolute top-50 start-50 translate-middle" 
             style={{ width: '60%', height: '100%', background: 'radial-gradient(circle, rgba(111, 106, 248, 0.15) 0%, transparent 70%)', zIndex: -1, filter: 'blur(60px)' }}>
        </div>
        <Container className="position-relative z-1">
          <h1 className="fw-bold mb-3 display-5" style={{letterSpacing: '-1px'}}>
            <span className="text-dark">เลือกแบบเสื้อที่คุณ</span> <span className="text-primary">ภูมิใจ</span>
          </h1>
          <p className="text-secondary mx-auto" style={{maxWidth: '600px', fontSize: '1.1rem'}}>
            ร่วมเป็นส่วนหนึ่งในการเฉลิมฉลอง 243 ปี ศรีสะเกษ ด้วยเสื้อที่ระลึกคุณภาพดี <br className="d-none d-md-block"/>
            สินค้ามีจำนวนจำกัด หมดแล้วหมดเลย
          </p>
        </Container>
      </div>

      <Container>
        {/* Product Grid */}
        <Row className="g-4 justify-content-center mb-5">
          {sortedProducts.length === 0 ? (
             <div className="text-center py-5">
                <p className="text-muted">กำลังโหลดข้อมูลสินค้า หรือยังไม่มีสินค้าในระบบ...</p>
             </div>
          ) : sortedProducts.map((product) => (
            <Col lg={5} md={6} key={product._id}>
              <div className="product-card-wrapper h-100">
                <div className="h-100 product-hover-effect" style={{borderRadius: '24px'}}> 
                  
                  <Card className="h-100" style={{
                      border: `3px solid ${product.type === 'mourning' ? '#333' : '#6f6af8'}`,
                      borderRadius: '24px',
                      boxShadow: `0 10px 30px ${product.type === 'mourning' ? 'rgba(0,0,0,0.1)' : 'rgba(111, 106, 248, 0.15)'}`,
                      backgroundColor: '#fff',
                      overflow: 'hidden'
                  }}>
                    
                    <div className="position-relative bg-light bg-opacity-50 d-flex align-items-center justify-content-center" style={{ height: '380px' }}>
                      <div className="position-absolute top-0 start-0 p-3 z-2">
                         <Badge 
                            bg={product.type === 'mourning' ? 'dark' : 'primary'} 
                            className="me-1 shadow-sm fw-normal px-3 py-2 rounded-pill"
                          >
                            {product.type === 'mourning' ? 'Limited Edition' : 'Best Seller'}
                          </Badge>
                      </div>
                      <div className="position-relative w-75 h-75">
                        <Image 
                          src={product.imageUrl || '/images/placeholder.png'} 
                          alt={product.name} 
                          fill 
                          style={{ objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.12))' }} 
                          className="hover-zoom"
                        />
                      </div>
                    </div>

                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="mb-3">
                        <h4 className={`fw-bold mb-2 text-${product.type === 'mourning' ? 'dark' : 'primary'}`}>
                          {product.name}
                        </h4>
                        <div className="d-flex align-items-center gap-3">
                           <div className="px-3 py-1 rounded-3 bg-light border d-flex align-items-center gap-2">
                              <span className="fw-bold text-dark fs-5">฿{product.price.toLocaleString()}</span>
                           </div>
                           <span className="text-muted small"><FaTruck className="me-1 text-success"/> ส่งด่วนทั่วไทย 50.-</span>
                        </div>
                      </div>

                      <hr className="opacity-10 my-3" />

                      <div className="mb-4 flex-grow-1">
                        <h6 className="fw-bold text-secondary mb-3"><FaInfoCircle className="me-2"/> รายละเอียด</h6>
                        <p className="text-muted small mb-0" style={{lineHeight: '1.6'}}>
                           {product.description || "เนื้อผ้า Micro Polyester 100% พิมพ์ลายคมชัด ระบายอากาศดีเยี่ยม"}
                        </p>
                      </div>

                      <Link 
                        href={`/order/create?type=${product.type}`} 
                        className={`btn btn-${product.type === 'mourning' ? 'dark' : 'primary'} w-100 py-3 rounded-4 fw-bold shadow-sm hover-lift d-flex align-items-center justify-content-center gap-2`}
                      >
                        <FaShoppingCart /> เลือกแบบนี้ & สั่งซื้อ
                      </Link>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Col>
          ))}
        </Row>
        
        {/* Stock Table Section */}
        <Row className="justify-content-center">
           <Col xl={10}>
              <Card 
                className="shadow-sm rounded-4 overflow-hidden"
                style={{
                    border: '3px solid #6f6af8', 
                    boxShadow: '0 10px 30px rgba(111, 106, 248, 0.15)' 
                }}
              >
                 <div className="p-4" style={{background: 'linear-gradient(135deg, #0061ff 0%, #60efff 100%)'}}>
                    <h4 className="fw-bold mb-0 text-white d-flex align-items-center">
                        <FaRulerCombined className="me-3"/> ตารางไซส์ & เช็คสต็อกสินค้า
                    </h4>
                    <p className="text-white text-opacity-75 mb-0 small mt-1">
                        ข้อมูลสินค้าคงคลังอัปเดตล่าสุด (Real-time)
                    </p>
                 </div>
                 
                 <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle text-center mb-0" style={{minWidth: '600px'}}>
                            <thead className="bg-light">
                                <tr>
                                    <th className="py-3 text-secondary border-0" style={{width: '15%'}}>ไซส์</th>
                                    <th className="py-3 text-secondary border-0" style={{width: '15%'}}>รอบอก (นิ้ว)</th>
                                    <th className="py-3 text-secondary border-0" style={{width: '15%'}}>ความยาว (นิ้ว)</th>
                                    <th className="py-3 text-primary border-0 fw-bold bg-primary bg-opacity-10">
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <span className="bg-primary rounded-circle" style={{width:8, height:8}}></span>
                                            คงเหลือ (สีปกติ)
                                        </div>
                                    </th>
                                    <th className="py-3 text-dark border-0 fw-bold bg-dark bg-opacity-10">
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <span className="bg-dark rounded-circle" style={{width:8, height:8}}></span>
                                            คงเหลือ (ไว้ทุกข์)
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockTableData.map((item: any, index: number) => (
                                    <tr key={index} style={{borderBottom: '1px solid #f0f0f0'}}>
                                        <td className="py-3 fw-bold text-primary bg-white">{item.size}</td>
                                        <td className="text-muted">{item.chest}</td>
                                        <td className="text-muted">{item.length}</td>
                                        
                                        <td className="bg-primary bg-opacity-10">
                                            {item.normal > 0 ? (
                                                <span className="fw-bold text-primary">{item.normal.toLocaleString()}</span>
                                            ) : (
                                                <span className="badge bg-danger text-white rounded-pill px-3">หมด</span>
                                            )}
                                        </td>

                                        <td className="bg-dark bg-opacity-10">
                                            {item.mourning > 0 ? (
                                                <span className="fw-bold text-dark">{item.mourning.toLocaleString()}</span>
                                            ) : (
                                                <span className="badge bg-secondary text-white rounded-pill px-3">หมด</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </Card.Body>
                 <div className="card-footer bg-light p-3 text-center border-top-0">
                    <small className="text-muted">
                        <FaBoxOpen className="me-1"/> หากสินค้าหมด สามารถติดต่อเจ้าหน้าที่เพื่อสอบถามรอบการผลิตถัดไป
                    </small>
                 </div>
              </Card>
           </Col>
        </Row>

      </Container>
    </div>
  );
}