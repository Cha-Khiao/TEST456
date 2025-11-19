// src/components/HomeView.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Carousel } from 'react-bootstrap';
import { 
  FaShoppingCart, FaTshirt, FaTruck, FaTag, 
  FaLine, FaFacebook, FaMoneyBillWave, FaChartPie, FaBoxOpen, FaRulerCombined, FaClipboardList
} from 'react-icons/fa';
import { Product } from '@/types';

// --- Types ---
interface StockStat {
  size: string;
  count: number;
}

interface HomeViewProps {
  products: Product[];
  salesStats: {
    total: { sold: number };
    normal: { sold: number };
    mourning: { sold: number };
  };
  sizeStatsTotal: StockStat[];
  sizeStatsNormal: StockStat[];
  sizeStatsMourning: StockStat[];
}

// --- Helper Data ---
const sizeChartData = [
  { size: 'SSS', chest: 34, length: 24 },
  { size: 'SS', chest: 36, length: 25 },
  { size: 'S', chest: 38, length: 26 },
  { size: 'M', chest: 40, length: 27 },
  { size: 'L', chest: 42, length: 28 },
  { size: 'XL', chest: 44, length: 29 },
  { size: '2XL', chest: 46, length: 30 },
  { size: '3XL', chest: 48, length: 31 },
  { size: '4XL', chest: 50, length: 32 },
  { size: '5XL', chest: 52, length: 33 },
  { size: '6XL', chest: 54, length: 34 },
  { size: '7XL', chest: 56, length: 35 },
  { size: '8XL', chest: 58, length: 36 },
  { size: '9XL', chest: 60, length: 37 },
  { size: '10XL', chest: 62, length: 38 },
];

// --- Helper Components ---
const SizeGrid = ({ data, title }: { data: StockStat[], title: string }) => {
  return (
    <div className="mb-2">
      <h6 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
        <span className="badge bg-warning text-dark rounded-pill px-3 py-1 shadow-sm">{title}</span>
        <small className="text-muted fw-normal" style={{fontSize: '0.75rem'}}>อัปเดตล่าสุด (Real-time)</small>
      </h6>
      <div className="d-flex flex-wrap align-items-center gap-1">
        {data.map((item, index) => (
          <div key={index} className="stock-item-flexible border-warning text-dark bg-white" style={{borderColor: '#ffc107', minWidth: '55px'}}>
             <div className="fw-bold small text-secondary">{item.size}</div>
             <div className="fw-bold" style={{fontSize: '0.9rem'}}>
                {item.count > 0 ? item.count.toLocaleString() : <span className="text-danger text-opacity-50">-</span>}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SmartImage = ({ src, alt, type = 'product' }: { src: string, alt: string, type?: 'product'|'qr' }) => {
  const [error, setError] = useState(false);
  if (error || !src) return <div className={`d-flex align-items-center justify-content-center text-muted bg-light rounded-3 border border-dashed ${type === 'qr' ? 'w-100 h-100' : 'w-100'}`} style={type === 'product' ? {height: '300px'} : {}}><div className="text-center opacity-50 p-2">{type === 'qr' ? <FaClipboardList size={20}/> : <FaTshirt size={40}/>}<div style={{fontSize: '0.7rem', marginTop: '5px'}}>No Image</div></div></div>;
  
  return (
    <div className={`position-relative ${type === 'qr' ? 'w-100 h-100' : 'w-100 h-100'}`}>
        <Image 
            src={src} 
            alt={alt} 
            fill 
            style={{ objectFit: 'contain', filter: type === 'product' ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' : 'none' }} 
            onError={() => setError(true)} 
        />
    </div>
  );
};

export default function HomeView({ products, salesStats, sizeStatsTotal }: HomeViewProps) {
  
  return (
    <>
      {/* Hero Section */}
      <section className="pt-5 pb-3">
        <Container>
          <div 
            className="bg-white rounded-4 p-4 p-lg-5 position-relative"
            style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', margin: '10px' }}
          >
            <Row className="align-items-center gy-4">
              <Col lg={6} className="order-2 order-lg-1">
                <div className="d-inline-block bg-white border px-3 py-2 rounded-pill mb-3 shadow-sm">
                  <span className="text-primary fw-bold small">🎉 กิจกรรมพิเศษ 243 ปี</span>
                </div>
                <h1 className="display-5 fw-bold mb-3 text-dark" style={{lineHeight: '1.2'}}>
                  ร่วมเฉลิมฉลอง<br/><span className="text-primary">เมืองศรีสะเกษ 243 ปี</span>
                </h1>
                <p className="lead text-secondary mb-4 fw-normal fs-6">
                  สั่งซื้อเสื้อที่ระลึก "สู่ขวัญบ้าน บายศรีเมือง รุ่งเรือง 243 ปี"<br className="d-none d-md-block"/>
                  รายได้สมทบทุนจัดกิจกรรมสร้างสรรค์เพื่อบ้านเกิดของเรา
                </p>
                <div className="d-flex gap-3 justify-content-lg-start hero-buttons-mobile-center">
                  <Link href="/order/create" className="btn btn-primary btn-lg fw-bold px-4 shadow d-inline-flex align-items-center hover-lift">
                    <FaShoppingCart className="me-2" /> สั่งซื้อเลย
                  </Link>
                </div>
              </Col>
              <Col lg={6} className="order-1 order-lg-2">
                 <div className="w-100 position-relative hero-carousel-wrapper" style={{height: '400px'}}>
                    <Carousel controls={true} indicators={products.length > 1} interval={3000} touch={true} variant="dark" fade={false} className="h-100 hero-carousel-custom carousel-controls-mobile-visible">
                      {products.length > 0 ? (
                          products.map((p, idx) => (
                            <Carousel.Item key={idx} className="h-100">
                              <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '400px' }}>
                                <SmartImage src={p.imageUrl} alt={p.name} type="product" />
                              </div>
                            </Carousel.Item>
                          ))
                      ) : (
                        <Carousel.Item className="h-100">
                           <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '400px' }}>
                             <div className="text-muted bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: 200, height: 200}}>
                                <FaTshirt size={80} className="opacity-25"/>
                             </div>
                           </div>
                        </Carousel.Item>
                      )}
                    </Carousel>
                 </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      <Container className="pb-5">
        
        {/* 1. Product Card Section */}
        <Row className="justify-content-center mb-5 mt-2">
            <Col xl={10}>
              <div className="product-carousel-wrapper"> 
                <Carousel controls={true} indicators={products.length > 1} interval={5000} variant="dark" fade={false} className="pb-0 product-carousel-custom carousel-controls-mobile-visible">
                  {products.map((product) => {
                      const isMourning = product.type === 'mourning';
                      const textColor = isMourning ? 'text-dark' : 'text-primary';
                      const bgColor = isMourning ? 'btn-dark' : 'btn-gradient-primary';
                      const priceTagBg = isMourning ? '#f0f0f0' : '#ececff';
                      const priceTagColor = isMourning ? '#333' : '#6f6af8';

                      return (
                        <Carousel.Item key={product._id}>
                          <div 
                            className="bg-white rounded-4 p-4 p-lg-5 position-relative" 
                            style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', margin: '10px' }}
                          >
                            <Row className="align-items-center g-5">
                              <Col md={6} className="text-center">
                                  <div className="position-relative w-100" style={{height: '350px'}}>
                                      <SmartImage src={product.imageUrl} alt={product.name} type="product" />
                                  </div>
                              </Col>
                              <Col md={6}>
                                  <h2 className={`fw-bold mb-3 ${textColor}`}>{product.name}</h2>
                                  
                                  {/* ✅ แก้ไข Point 2: อิงข้อมูลจาก Database เท่านั้น */}
                                  <p className="text-secondary mb-4 line-clamp-3" style={{lineHeight: '1.7', fontSize: '1rem', minHeight: '60px'}}>
                                      {product.description || "-"}
                                  </p>

                                  <div className="d-flex flex-wrap gap-3 mb-4">
                                    <div className="px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold" style={{backgroundColor: priceTagBg, color: priceTagColor}}>
                                        <FaTag /> <span>ราคา {product.price.toLocaleString()} บาท</span>
                                    </div>
                                    <div className="px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold" style={{backgroundColor: '#e6f8ed', color: '#059669'}}>
                                        <FaTruck /> <span>ค่าส่งเริ่มต้น 50.-</span>
                                    </div>
                                  </div>
                                  
                                  <Link href={`/order/create?type=${product.type}`} className={`btn ${bgColor} text-white w-100 py-3 fs-5 shadow-lg d-inline-flex justify-content-center align-items-center text-decoration-none rounded-4 hover-lift`} style={{transition: 'all 0.3s ease'}}>
                                    <FaShoppingCart className="me-2"/> สั่งซื้อทันที
                                  </Link>
                              </Col>
                            </Row>
                          </div>
                        </Carousel.Item>
                      );
                  })}
                  {products.length === 0 && <div className="text-center py-5 bg-white rounded-4">กำลังโหลดข้อมูลสินค้า...</div>}
                </Carousel>
              </div>
            </Col>
        </Row>

        {/* Stats Section */}
        <div className="mb-4">
           <Card className="shadow-sm rounded-4 overflow-hidden card-border-purple">
             <div className="card-header-gradient-purple p-3 px-4">
                <h5 className="fw-bold mb-0 text-white d-flex align-items-center"><FaChartPie className="me-2"/> ภาพรวมยอดจำหน่าย</h5>
             </div>
             <Card.Body className="p-4">
                <Row className="g-3">
                   <Col lg={4} xs={12}>
                      <div className="p-3 bg-light rounded-4 h-100 text-center border border-2 shadow-sm">
                         <h6 className="text-secondary fw-bold mb-3">รวมทั้งสิ้น (Total)</h6>
                         <h2 className="fw-bold text-primary mb-0">{salesStats.total.sold.toLocaleString()}</h2>
                         <small className="text-muted">ตัวที่ขายได้</small>
                      </div>
                   </Col>
                   <Col lg={4} xs={12}>
                      <div className="p-3 bg-white rounded-4 h-100 text-center border border-primary border-opacity-25 shadow-sm">
                         <h6 className="text-primary fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                            <span className="bg-primary rounded-circle" style={{width:10, height:10}}></span> เสื้อสีปกติ
                         </h6>
                         <h4 className="fw-bold text-dark mb-0">{salesStats.normal.sold.toLocaleString()}</h4>
                         <small className="text-muted">ตัวที่ขายได้</small>
                      </div>
                   </Col>
                   <Col lg={4} xs={12}>
                      <div className="p-3 bg-white rounded-4 h-100 text-center border border-secondary border-opacity-25 shadow-sm">
                         <h6 className="text-secondary fw-bold mb-3 d-flex align-items-center justify-content-center gap-2">
                            <span className="bg-dark rounded-circle" style={{width:10, height:10}}></span> เสื้อไว้ทุกข์
                         </h6>
                         <h4 className="fw-bold text-dark mb-0">{salesStats.mourning.sold.toLocaleString()}</h4>
                         <small className="text-muted">ตัวที่ขายได้</small>
                      </div>
                   </Col>
                </Row>
             </Card.Body>
           </Card>
        </div>

        {/* ✅ Layout ใหม่: ไม่ Stretch และจัด Payment ให้พอดี */}
        <Row className="g-4 mb-5">
           {/* Col Left: Size Chart */}
           <Col lg={6}>
              <Card className="shadow-sm rounded-4 overflow-hidden card-border-teal h-100">
                 <div className="card-header-gradient-teal p-3 px-4">
                    <h4 className="fw-bold mb-0 d-flex align-items-center text-white"><FaRulerCombined className="me-3"/> ตารางไซส์ (Size Chart)</h4>
                 </div>
                 <Card.Body className="p-0">
                    <table className="table-custom table-striped-custom text-center mb-0 h-100">
                      <thead>
                        <tr>
                          <th>SIZE</th>
                          <th>รอบอก (นิ้ว)</th>
                          <th>ความยาว (นิ้ว)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeChartData.map((row, i) => (
                          <tr key={i}>
                            <td className="fw-bold text-success">{row.size}</td>
                            <td>{row.chest}</td>
                            <td className="text-muted">{row.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </Card.Body>
              </Card>
           </Col>

           {/* Col Right: Stock & Payment */}
           <Col lg={6}>
              <div className="d-flex flex-column gap-4">
                  
                  {/* 1. Stock (เฉพาะยอดรวม) */}
                  <Card className="shadow-sm rounded-4 overflow-hidden card-border-orange">
                     <div className="card-header-gradient-orange p-3 px-4">
                        <h4 className="fw-bold mb-0 d-flex align-items-center text-white"><FaBoxOpen className="me-3"/> สต็อกคงเหลือ (รวมทุกสี)</h4>
                     </div>
                     <Card.Body className="p-4">
                        <SizeGrid title="ยอดรวมคงเหลือ" data={sizeStatsTotal} />
                     </Card.Body>
                  </Card>

                  {/* 2. Payment & Contact (ปรับให้พอดีเนื้อหา) */}
                  <Card className="shadow-sm overflow-hidden rounded-4 card-border-purple">
                     <div className="card-header-gradient-purple p-3 px-4">
                        <h4 className="fw-bold mb-0 text-white d-flex align-items-center"><FaMoneyBillWave className="me-3"/> ช่องทางชำระเงิน</h4>
                     </div>
                     <Card.Body className="p-4">
                        {/* Bank Info */}
                        <div className="d-flex flex-row align-items-center gap-3 mb-4 p-3 bg-light rounded-4 border border-2 shadow-sm">
                             {/* ✅ แก้ไข Point 3: ใส่พื้นหลังสีน้ำเงินให้ไอคอนขาวมองเห็น */}
                             <div className="rounded-4 shadow-sm d-flex align-items-center justify-content-center flex-shrink-0 p-2" style={{width: 60, height: 60, backgroundColor: '#1e4598'}}>
                                <Image src="/images/bank_logos/bbl.svg" alt="Bank" width={40} height={40} style={{objectFit: 'contain'}} /> 
                             </div>
                             <div>
                                <h6 className="text-muted mb-0 small">ธนาคารกรุงเทพ</h6>
                                <h4 className="fw-bold text-primary mb-0" style={{letterSpacing: '1px'}}>333-4-23368-5</h4>
                                <small className="text-dark d-block mt-1" style={{fontSize: '0.75rem'}}>บจ. ประชารัฐรักสามัคคีศรีสะเกษ</small>
                             </div>
                        </div>

                        {/* Contact Channels */}
                        <div className="d-flex justify-content-between align-items-center gap-2">
                           <div className="d-flex gap-3">
                               <div className="text-center">
                                  <div className="bg-white border rounded-3 p-1 mb-1 shadow-sm" style={{width: 60, height: 60}}>
                                     <SmartImage src="/images/qrcode.png" alt="QR" type="qr" />
                                  </div>
                                  <small className="fw-bold text-success d-block" style={{fontSize: '0.7rem'}}><FaLine/> LINE</small>
                               </div>
                               <div className="text-center">
                                  <div className="bg-white border rounded-3 p-1 mb-1 shadow-sm" style={{width: 60, height: 60}}>
                                     <SmartImage src="/images/qrcode.png" alt="QR" type="qr" />
                                  </div>
                                  <small className="fw-bold text-primary d-block" style={{fontSize: '0.7rem'}}><FaFacebook/> Page</small>
                               </div>
                           </div>
                           <div className="text-end">
                               <h6 className="fw-bold text-secondary mb-1">สอบถามเพิ่มเติม</h6>
                               <a href="tel:0933581622" className="text-decoration-none text-dark fw-bold fs-5 d-block">093-358-1622</a>
                           </div>
                        </div>
                     </Card.Body>
                  </Card>
              </div>
           </Col>
        </Row>

      </Container>
    </>
  );
}