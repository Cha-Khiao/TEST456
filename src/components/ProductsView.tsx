// src/components/ProductsView.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { 
  FaShoppingCart, FaTruck, FaBoxOpen, FaArrowDown
} from 'react-icons/fa';
import { Product } from '@/types';

interface ProductsViewProps {
  initialProducts: Product[];
  // ❌ ลบ sizeChart prop ออก
}

const ITEMS_PER_PAGE = 12;

export default function ProductsView({ initialProducts }: ProductsViewProps) {
  
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  const sortedProducts = [...initialProducts].sort((a, b) => {
    if (a.type === 'normal') return -1;
    if (b.type === 'normal') return 1;
    return 0;
  });

  const visibleProducts = sortedProducts.slice(0, displayCount);
  const hasMore = displayCount < sortedProducts.length;

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header Section */}
      <div className="position-relative py-5 mb-5 text-center overflow-hidden">
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
        
        {/* ❌ ลบส่วนตารางไซส์ออกไปแล้ว */}

        {/* Product Grid */}
        <Row className="g-3 g-lg-4 mb-4">
          {visibleProducts.length === 0 ? (
             <div className="text-center py-5 w-100">
                <div className="bg-light p-4 rounded-circle d-inline-block mb-3">
                   <FaBoxOpen size={40} className="text-muted opacity-50"/>
                </div>
                <p className="text-muted">ยังไม่มีสินค้าในระบบ</p>
             </div>
          ) : visibleProducts.map((product) => {
            const isMourning = product.type === 'mourning';
            const themeColor = isMourning ? '#333' : '#6f6af8';

            return (
            <Col xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden product-hover-effect" style={{transition: 'transform 0.2s'}}>
                {/* Image Area */}
                <div className="position-relative bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ height: '250px' }}>
                   <div className="position-absolute top-0 start-0 p-2 z-2">
                      <Badge bg={isMourning ? 'dark' : 'primary'} className="shadow-sm fw-normal">
                         {isMourning ? 'ไว้ทุกข์' : 'สีปกติ'}
                      </Badge>
                   </div>
                   <div className="position-relative w-100 h-100 p-4">
                     <Image 
                       src={product.imageUrl || '/images/placeholder.png'} 
                       alt={product.name} 
                       fill 
                       style={{ objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} 
                       className="hover-zoom"
                     />
                   </div>
                </div>

                {/* Content Area */}
                <Card.Body className="d-flex flex-column p-3">
                   <h6 className={`fw-bold mb-1 text-truncate ${isMourning ? 'text-dark' : 'text-primary'}`} title={product.name}>
                      {product.name}
                   </h6>
                   
                   {/* รายละเอียดแบบย่อ */}
                   <p className="text-muted small mb-3 line-clamp-2" style={{minHeight: '40px', fontSize: '0.8rem'}}>
                      {product.description || "-"}
                   </p>
                   
                   <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                         <h5 className="fw-bold text-dark mb-0">฿{product.price}</h5>
                         <small className="text-success d-flex align-items-center" style={{fontSize: '0.75rem'}}>
                            <FaTruck className="me-1"/> ส่ง 50.-
                         </small>
                      </div>

                      <Link href={`/order/create?type=${product.type}`} className={`btn w-100 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2`} 
                            style={{
                                backgroundColor: themeColor, 
                                borderColor: themeColor,
                                color: 'white',
                                fontSize: '0.9rem',
                                padding: '10px'
                            }}
                      >
                         <FaShoppingCart size={14}/> สั่งซื้อทันที
                      </Link>
                   </div>
                </Card.Body>
              </Card>
            </Col>
          )})}
        </Row>

        {/* Load More Button */}
        {hasMore && (
            <div className="text-center py-4">
                <Button 
                    variant="light" 
                    className="rounded-pill px-5 py-2 border text-secondary shadow-sm hover-scale"
                    onClick={loadMore}
                >
                    โหลดสินค้าเพิ่มเติม <FaArrowDown className="ms-2"/>
                </Button>
                <p className="text-muted small mt-2">
                    แสดง {visibleProducts.length} จาก {sortedProducts.length} รายการ
                </p>
            </div>
        )}

      </Container>
    </div>
  );
}