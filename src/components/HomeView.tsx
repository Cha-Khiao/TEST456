// src/components/HomeView.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Carousel } from 'react-bootstrap';
import { 
  FaShoppingCart, FaTshirt, FaTruck, FaTag, 
  FaLine, FaFacebook, FaMoneyBillWave, FaClipboardList, FaChartPie, FaBoxOpen, FaRulerCombined
} from 'react-icons/fa';

// --- Types ---
interface StockStat {
  size: string;
  count: number;
}

interface HomeViewProps {
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

const heroSlides = [
  { src: '/images/100.png', alt: 'มุมมองด้านหน้า' },
  { src: '/images/200.png', alt: 'มุมมองด้านหลัง' },
  // { src: '/images/300.png', alt: 'รายละเอียดลาย' },
];

const productVariants = [
  {
    id: 'normal',
    title: 'เสื้อที่ระลึก 243 ปี',
    description: 'เนื้อผ้า Micro Polyester เกรดพรีเมียม สัมผัสนุ่ม ใส่สบาย ระบายอากาศดีเยี่ยม ลวดลายเอกลักษณ์ "ศรีสะเกษ" ที่คุณภูมิใจ',
    image: '/images/100.png', 
    theme: 'primary', 
    textColor: 'text-primary',
    bgColor: 'bg-primary'
  },
  {
    id: 'mourning',
    title: 'เสื้อที่ระลึก 243 ปี (โทนขาว-ดำ)',
    description: 'ออกแบบด้วยโทนสีสุภาพ ขาว-ดำ เรียบหรู เหมาะสำหรับการสวมใส่ในวาระโอกาสสำคัญ หรือร่วมพิธีการต่างๆ',
    image: '/images/200.png', 
    theme: 'dark', 
    textColor: 'text-dark',
    bgColor: 'bg-dark'
  }
];

// --- Helper Components ---
const SizeGrid = ({ data, title, themeColor }: { data: StockStat[], title: string, themeColor: string }) => {
  let badgeClass = "bg-secondary";
  let borderClass = "border-secondary text-secondary";
  
  if (themeColor === 'primary') {
    badgeClass = "bg-primary";
    borderClass = "border-primary text-primary";
  } else if (themeColor === 'dark') {
    badgeClass = "bg-dark";
    borderClass = "border-dark text-dark";
  } else if (themeColor === 'warning') {
    badgeClass = "bg-warning text-dark";
    borderClass = "border-warning text-dark";
  }

  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-2 d-flex align-items-center">
        <span className={`badge ${badgeClass} rounded-pill px-3 py-1 shadow-sm me-2`}>{title}</span>
      </h6>
      <div className="d-flex flex-wrap align-items-center gap-1">
        {data.map((item, index) => (
          <div key={index} className={`stock-item-flexible ${borderClass}`} style={{borderColor: 'currentColor'}}>
             <div className="fw-bold small text-dark">{item.size}</div>
             <div className="fw-bold" style={{fontSize: '0.8rem'}}>
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
  if (error) return <div className={`d-flex align-items-center justify-content-center text-muted bg-light rounded-3 border border-dashed ${type === 'qr' ? 'w-100 h-100' : 'w-100'}`} style={type === 'product' ? {height: '300px'} : {}}><div className="text-center opacity-50 p-2">{type === 'qr' ? <FaClipboardList size={20}/> : <FaTshirt size={40}/>}<div style={{fontSize: '0.7rem', marginTop: '5px'}}>Not Found</div></div></div>;
  return <div className={`position-relative ${type === 'qr' ? 'w-100 h-100' : 'w-100 h-100'}`}><Image src={src} alt={alt} fill style={{ objectFit: 'contain', filter: type === 'product' ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' : 'none' }} onError={() => setError(true)} /></div>;
};

export default function HomeView({ salesStats, sizeStatsTotal, sizeStatsNormal, sizeStatsMourning }: HomeViewProps) {
  const isLoggedIn = false; // หรือดึงจาก session ถ้าต้องการ

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
                  <Link href="/order/create" className="btn btn-primary btn-lg fw-bold px-4 shadow d-inline-flex align-items-center">
                    <FaShoppingCart className="me-2" /> สั่งซื้อเลย
                  </Link>
                </div>
              </Col>
              <Col lg={6} className="order-1 order-lg-2">
                 <div className="w-100 position-relative hero-carousel-wrapper" style={{height: '400px'}}>
                    <Carousel controls={true} indicators={true} interval={3000} touch={true} variant="dark" fade={false} className="h-100 hero-carousel-custom carousel-controls-mobile-visible">
                      {heroSlides.map((slide, index) => (
                        <Carousel.Item key={index} className="h-100">
                          <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '400px' }}>
                            <SmartImage src={slide.src} alt={slide.alt} type="product" />
                          </div>
                        </Carousel.Item>
                      ))}
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
                <Carousel controls={true} indicators={true} interval={5000} variant="dark" fade={false} className="pb-0 product-carousel-custom carousel-controls-mobile-visible">
                  {productVariants.map((variant) => (
                    <Carousel.Item key={variant.id}>
                      <div 
                        className="bg-white rounded-4 p-4 p-lg-5 position-relative" 
                        style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', margin: '10px' }}
                      >
                        <Row className="align-items-center g-5">
                          <Col md={6} className="text-center">
                              <div className="position-relative w-100" style={{height: '350px'}}>
                                  <SmartImage src={variant.image} alt={variant.title} type="product" />
                              </div>
                          </Col>
                          <Col md={6}>
                              <h2 className={`fw-bold mb-3 ${variant.textColor}`}>{variant.title}</h2>
                              <p className="text-secondary mb-4" style={{lineHeight: '1.7', fontSize: '1rem'}}>{variant.description}</p>
                              <div className="d-flex flex-wrap gap-3 mb-4">
                                <div className="px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold" style={{backgroundColor: variant.theme === 'dark' ? '#f0f0f0' : '#ececff', color: variant.theme === 'dark' ? '#333' : '#6f6af8'}}>
                                    <FaTag /> <span>ราคา 198 บาท</span>
                                </div>
                                <div className="px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-bold" style={{backgroundColor: '#e6f8ed', color: '#059669'}}>
                                    <FaTruck /> <span>ค่าส่งเริ่มต้น 50.-</span>
                                </div>
                              </div>
                              <Link href={`/order/create?type=${variant.id}`} className={`btn ${variant.bgColor} text-white w-100 py-3 fs-5 shadow-lg d-inline-flex justify-content-center align-items-center text-decoration-none rounded-4 hover-lift`} style={{transition: 'all 0.3s ease'}}>
                                <FaShoppingCart className="me-2"/> สั่งซื้อ{variant.id === 'mourning' ? 'แบบไว้ทุกข์' : ''}ทันที
                              </Link>
                          </Col>
                        </Row>
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            </Col>
        </Row>

        {/* 2. สถิติยอดขายรวม (จาก Database จริง) */}
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

        {/* 3. ตารางไซส์ & จำนวนสินค้า (จาก Database จริง) */}
        <Row className="g-4 mb-5 align-items-start">
           <Col lg={6}>
              <Card className="shadow-sm rounded-4 overflow-hidden card-border-teal">
                 <div className="card-header-gradient-teal p-3 px-4">
                    <h4 className="fw-bold mb-0 d-flex align-items-center"><FaRulerCombined className="me-3"/> ตารางไซส์ (Size Chart)</h4>
                 </div>
                 <Card.Body className="p-0">
                    <table className="table-custom table-striped-custom text-center">
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

           <Col lg={6}>
              <Card className="shadow-sm rounded-4 overflow-hidden card-border-orange">
                 <div className="card-header-gradient-orange p-3 px-4">
                    <h4 className="fw-bold mb-0 d-flex align-items-center"><FaBoxOpen className="me-3"/> สต็อกคงเหลือแต่ละไซส์</h4>
                 </div>
                 <Card.Body className="p-4">
                    <SizeGrid title="รวมทั้งสิ้น" data={sizeStatsTotal} themeColor="warning"/>
                    <hr className="my-4 opacity-10"/>
                    <SizeGrid title="เสื้อสีปกติ" data={sizeStatsNormal} themeColor="primary"/>
                    <hr className="my-4 opacity-10"/>
                    <SizeGrid title="เสื้อไว้ทุกข์" data={sizeStatsMourning} themeColor="dark"/>
                 </Card.Body>
              </Card>
           </Col>
        </Row>

        {/* 4. ช่องทางการสั่งซื้อ & ชำระเงิน */}
        <Card className="shadow-sm overflow-hidden rounded-4 mb-5 card-border-purple">
           <div className="card-header-gradient-purple p-3 px-4">
              <h4 className="fw-bold mb-0 text-white d-flex align-items-center"><FaMoneyBillWave className="me-3"/> ช่องทางการสั่งซื้อ & ชำระเงิน</h4>
           </div>
           <Card.Body className="p-4 p-lg-5">
              <Row className="g-5 payment-section-mobile-no-border">
                 <Col md={5} className="border-end-md text-center text-md-start">
                    <h5 className="fw-bold text-secondary mb-4">🛒 สั่งซื้อได้ 2 ช่องทาง</h5>
                    <div className="d-flex gap-4 justify-content-center justify-content-md-start">
                       <div className="text-center">
                          <div className="bg-white border rounded-3 p-2 mb-2 shadow-sm" style={{width: 130, height: 130}}>
                             <SmartImage src="/images/qrcode.png" alt="QR Line" type="qr" />
                          </div>
                          <div className="fw-bold text-success"><FaLine size={20}/> LINE</div>
                       </div>
                       <div className="text-center">
                          <div className="bg-white border rounded-3 p-2 mb-2 shadow-sm" style={{width: 130, height: 130}}>
                             <SmartImage src="/images/qrcode.png" alt="QR Page" type="qr" />
                          </div>
                          <div className="fw-bold text-primary"><FaFacebook size={20}/> Page</div>
                       </div>
                    </div>
                    <div className="mt-4 text-muted small">
                       หรือติดต่อเบอร์: <span className="fw-bold text-dark fs-6">093-358-1622</span> (บริษัท ประชารัฐฯ)
                    </div>
                 </Col>

                 <Col md={7} className="text-center text-md-start">
                    <h5 className="fw-bold text-secondary mb-4">💳 บัญชีธนาคารสำหรับโอนเงิน</h5>
                    <div className="d-flex flex-column flex-md-row align-items-center gap-4 mb-4 p-4 bg-light rounded-4 border border-2 shadow-sm">
                       <div className="rounded-4 shadow-sm d-flex align-items-center justify-content-center flex-shrink-0" 
                           style={{width: 80, height: 80, backgroundColor: '#1a3a71', padding: '10px'}}>
                          <Image src="/images/bank_logos/bbl.svg" alt="Bangkok Bank Logo" width={60} height={60} style={{objectFit: 'contain'}} /> 
                       </div>
                       <div className="text-center text-md-start">
                          <h6 className="text-muted mb-1">ธนาคารกรุงเทพ (Bangkok Bank)</h6>
                          <h2 className="fw-bold text-primary mb-0" style={{letterSpacing: '2px'}}>333-4-23368-5</h2>
                       </div>
                    </div>
                    <p className="text-muted mb-0 ps-2 border-start border-4 border-warning text-md-start" style={{textAlign: 'center'}}>
                       <span className="fw-bold text-dark">ชื่อบัญชี:</span> บจ. ประชารัฐรักสามัคคีศรีสะเกษ (วิสาหกิจเพื่อสังคม)<br/>
                       <small className="text-danger">* กรุณาตรวจสอบเลขบัญชีและชื่อบัญชีก่อนโอนเงินทุกครั้ง</small>
                    </p>
                 </Col>
              </Row>
           </Card.Body>
        </Card>

      </Container>
    </>
  );
}