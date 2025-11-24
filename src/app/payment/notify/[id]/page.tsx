'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { 
  FaCloudUploadAlt, FaFileInvoiceDollar, FaCheckCircle, FaTimes, 
  FaArrowLeft, FaImage, FaReceipt, FaCamera
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const warningGradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

export default function PaymentNotifyPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- LOGIC SECTION ---
  useEffect(() => {
    if (!id || !session) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ORDER_DETAILS(id as string), {
            headers: {
                'Authorization': `Bearer ${(session as any)?.accessToken}`
            }
        });

        if (!res.ok) throw new Error('ไม่พบข้อมูลคำสั่งซื้อ หรือไม่มีสิทธิ์เข้าถึง');
        const data = await res.json();
        
        if (data.status !== 'pending_payment') {
           if (data.status === 'verification' || data.status === 'shipping' || data.status === 'completed') {
               router.push(`/order/success/${id}`);
           } else {
               router.push('/dashboard');
           }
           return;
        }

        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, router, session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
      if (file.size > 5 * 1024 * 1024) return alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!selectedFile || !id || !session) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('slip', selectedFile);
    formData.append('orderId', id as string);

    try {
      const res = await fetch(API_ENDPOINTS.UPLOAD_SLIP, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${(session as any)?.accessToken}`
        },
        body: formData, 
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');

      router.push('/dashboard'); 

    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  // --- UI SECTION ---

  if (loading) {
      return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-white">
          <Spinner animation="border" variant="warning" style={{width: '3rem', height: '3rem'}} />
          <p className="mt-3 text-muted animate-pulse">กำลังตรวจสอบข้อมูล...</p>
        </div>
      );
  }

  if (!order) return <div className="text-center py-5">ไม่พบข้อมูล</div>;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px', backgroundColor: '#f4f7fe' }}>
      
      {/* Full-Width Header */}
      <div className="position-relative overflow-hidden pt-5 pb-5" 
           style={{
               background: 'linear-gradient(to bottom, #fff7ed, #f4f7fe)', 
               borderBottomLeftRadius: '30px',
               borderBottomRightRadius: '30px'
           }}>
         <div className="position-absolute top-0 start-0 translate-middle bg-warning opacity-10 rounded-circle animate-pulse" style={{width: '300px', height: '300px', filter: 'blur(60px)'}}></div>
         <div className="position-absolute top-0 end-0 translate-middle bg-danger opacity-5 rounded-circle animate-pulse" style={{width: '250px', height: '250px', filter: 'blur(50px)', animationDelay: '1s'}}></div>
         
         <Container className="text-center position-relative z-1 pt-3 pb-5">
            <div className="mb-3 d-inline-block">
                <div className="rounded-circle bg-warning text-white d-flex align-items-center justify-content-center shadow-lg animate-bounce" 
                     style={{width: 80, height: 80, margin: '0 auto', background: warningGradient, border: '4px solid white'}}>
                    <FaFileInvoiceDollar size={35} />
                </div>
            </div>
            <h1 className="fw-bold text-dark mb-2">แจ้งชำระเงิน</h1>
            <p className="text-secondary mb-4 fs-5">แนบหลักฐานการโอนเงินเพื่อยืนยันคำสั่งซื้อ</p>
         </Container>
      </div>

      <Container className="mt-n5 position-relative z-2" style={{marginTop: '-5rem'}}>
         <Row className="justify-content-center g-4">
            
            {/* Left Card: Receipt Summary */}
            <Col lg={5}>
               <Card className="rounded-4 overflow-hidden h-100 hover-lift shadow-lg card-border-orange position-relative">
                  
                  {/* Header */}
                  <div className="p-4 text-center text-white position-relative" 
                       style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                     <div className="position-relative z-1">
                        <small className="text-uppercase fw-bold opacity-75 letter-spacing-2 fs-6">ยอดที่ต้องชำระ / Amount</small>
                        <h1 className="fw-bold display-4 my-2">฿{order.totalPrice.toLocaleString()}</h1>
                        <Badge bg="white" text="dark" className="rounded-pill px-3 py-2 shadow-sm text-warning-emphasis">
                            <span className="blink-me me-1">●</span> รอแจ้งโอน
                        </Badge>
                     </div>
                     <div className="position-absolute bottom-0 start-0 translate-middle-x bg-white rounded-circle" style={{width: 20, height: 20, marginBottom: -10}}></div>
                     <div className="position-absolute bottom-0 end-0 translate-middle-x bg-white rounded-circle" style={{width: 20, height: 20, marginBottom: -10, marginRight: -20}}></div>
                  </div>

                  <Card.Body className="p-4 bg-white">
                     <div className="bg-light rounded-3 p-3 mb-4 border border-dashed text-center animate-slide-up">
                        <small className="text-muted d-block text-uppercase mb-1" style={{letterSpacing: '1px'}}>Order ID</small>
                        <span className="fw-bold text-dark font-monospace fs-4">#{order._id.slice(-6).toUpperCase()}</span>
                        <div className="mt-2 text-muted small">
                           จำนวน {order.items?.length || 0} รายการ
                        </div>
                     </div>

                     <div className="text-center animate-slide-up" style={{animationDelay: '0.1s'}}>
                        <div className="d-inline-flex align-items-center gap-2 text-secondary bg-white border rounded-pill px-3 py-1 shadow-sm">
                           <FaReceipt className="text-warning"/>
                           <span className="small">กรุณาตรวจสอบยอดเงินก่อนโอน</span>
                        </div>
                     </div>
                  </Card.Body>
                  <div className="position-absolute bottom-0 start-0 w-100" style={{height: '6px', backgroundImage: 'linear-gradient(45deg, transparent 50%, #ffffff 50%), linear-gradient(-45deg, transparent 50%, #ffffff 50%)', backgroundSize: '12px 12px', backgroundRepeat: 'repeat-x', marginBottom: '0px'}}></div>
               </Card>
            </Col>

            {/* Right Card: Upload Form */}
            <Col lg={5}>
               <Card className="rounded-4 overflow-hidden h-100 shadow-sm card-border-orange">
                  
                  <Card.Body className="p-4 p-lg-5">
                     <h4 className="fw-bold text-dark mb-4">อัปโหลดสลิป</h4>

                     {error && (
                        <Alert variant="danger" className="border-0 shadow-sm rounded-3 mb-4 animate-slide-down">
                            <div className="d-flex align-items-center gap-2">
                                <FaTimes className="text-danger"/> 
                                <span>{error}</span>
                            </div>
                        </Alert>
                     )}

                     <Form>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="d-none"/>

                        {/* Dropzone */}
                        <div 
                           className={`upload-zone position-relative rounded-4 border-2 border-dashed p-4 text-center cursor-pointer transition-all ${previewUrl ? 'border-success bg-success bg-opacity-10' : 'border-warning bg-warning bg-opacity-10 hover-bg-warning-light'}`}
                           style={{minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s ease'}}
                           onClick={() => !previewUrl && fileInputRef.current?.click()}
                        >
                           {previewUrl ? (
                              <div className="position-relative w-100 h-100 animate-slide-up">
                                 <div className="bg-white p-2 rounded-3 shadow-sm d-inline-block mx-auto mb-3">
                                     <div style={{maxHeight: '200px', overflow: 'hidden'}} className="rounded-2">
                                         <img src={previewUrl} alt="Slip Preview" style={{maxWidth: '100%', maxHeight: '200px', objectFit: 'contain'}} />
                                     </div>
                                 </div>
                                 <div>
                                     <Button variant="light" size="sm" className="rounded-pill px-3 shadow-sm text-danger fw-bold hover-scale border" onClick={(e) => { e.stopPropagation(); handleClearFile(); }}>
                                        <FaTimes className="me-1"/> ยกเลิกรูปนี้
                                     </Button>
                                 </div>
                                 <p className="text-success fw-bold mt-2 mb-0 animate-pulse small"><FaCheckCircle className="me-1"/> รูปพร้อมส่งแล้ว</p>
                              </div>
                           ) : (
                              <div className="opacity-75 hover-opacity-100 transition-all py-3">
                                 <div className="mb-3 bg-white d-inline-flex p-3 rounded-circle shadow-sm text-warning animate-bounce">
                                     <FaCloudUploadAlt size={32}/>
                                 </div>
                                 <h6 className="fw-bold text-dark mb-2">แตะเพื่ออัปโหลดสลิป</h6>
                                 <p className="text-muted small mb-3">รองรับไฟล์ .jpg, .png</p>
                                 
                                 <div className="d-flex gap-2 justify-content-center">
                                    <Badge bg="white" text="secondary" className="border shadow-sm py-2 px-3 fw-normal">
                                        <FaImage className="me-1"/> เลือกรูป
                                    </Badge>
                                    <Badge bg="white" text="secondary" className="border shadow-sm py-2 px-3 fw-normal">
                                        <FaCamera className="me-1"/> ถ่ายรูป
                                    </Badge>
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                            <Button 
                            className="w-100 py-3 rounded-pill fw-bold shadow-lg fs-5 btn-gradient-warning border-0 hover-scale"
                            style={{background: warningGradient}}
                            disabled={!selectedFile || uploading}
                            onClick={handleSubmit}
                            >
                            {uploading ? <><Spinner animation="border" size="sm" className="me-2"/> กำลังส่งข้อมูล...</> : <><FaCheckCircle className="me-2"/> ยืนยันการแจ้งโอน</>}
                            </Button>
                        </div>

                        <div className="text-center mt-3">
                           <Button variant="light" className="text-secondary text-decoration-none rounded-pill px-4 hover-bg-light small" onClick={() => router.back()}>
                               <FaArrowLeft className="me-1"/> ย้อนกลับ
                           </Button>
                        </div>

                     </Form>
                  </Card.Body>
               </Card>
            </Col>
         </Row>
      </Container>
    </div>
  );
}