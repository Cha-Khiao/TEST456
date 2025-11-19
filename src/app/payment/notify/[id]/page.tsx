// src/app/payment/notify/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import { 
  FaCloudUploadAlt, FaFileInvoiceDollar, FaCheckCircle, FaTimes, 
  FaArrowLeft, FaImage, FaMoneyBillWave
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

// Theme Constants
const warningGradient = 'linear-gradient(45deg, #f59e0b, #d97706)';

export default function PaymentNotifyPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 1. Fetch Order Details
  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.ORDER_DETAILS(id as string));
        if (!res.ok) throw new Error('ไม่พบข้อมูลคำสั่งซื้อ');
        const data = await res.json();
        
        // ถ้าสถานะไม่ใช่ pending_payment ให้ดีดกลับ Dashboard (กันส่งซ้ำ)
        if (data.status !== 'pending_payment') {
           alert('ออร์เดอร์นี้แจ้งชำระเงินไปแล้ว หรือถูกยกเลิก');
           router.push(`/orders/details/${id}`); // หรือไปหน้า Dashboard
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
  }, [id, router]);

  // 2. Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate File Type
      if (!file.type.startsWith('image/')) {
        alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
        return;
      }
      // Validate Size (e.g. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create Preview
    }
  };

  // 3. Clear Selected File
  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 4. Submit Upload
  const handleSubmit = async () => {
    if (!selectedFile || !id) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('slip', selectedFile);
    formData.append('orderId', id as string);

    try {
      // เรียก API ที่เราทำไว้ใน Backend (paymentRoutes.ts)
      const res = await fetch(API_ENDPOINTS.UPLOAD_SLIP, {
        method: 'POST',
        body: formData, 
        // ⚠️ สำคัญ: ไม่ต้อง set Header Content-Type 
        // Browser จะจัดการ Boundary ให้เองเมื่อใช้ FormData
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'อัปโหลดไม่สำเร็จ');

      // สำเร็จ!
      alert('แจ้งชำระเงินเรียบร้อย ทางเราจะรีบตรวจสอบโดยเร็วที่สุด');
      router.push('/dashboard'); // กลับไปหน้าประวัติ

    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  // --- Render ---

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="warning"/></div>;
  if (!order) return <div className="text-center py-5">ไม่พบข้อมูล</div>;

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px', backgroundColor: '#fffbeb' }}>
      
      {/* Header */}
      <div className="py-5 text-center position-relative overflow-hidden bg-white shadow-sm">
        <Container>
           <h2 className="fw-bold text-dark mb-1">แจ้งชำระเงิน</h2>
           <p className="text-muted">แนบหลักฐานการโอนเงินเพื่อยืนยันคำสั่งซื้อ</p>
        </Container>
      </div>

      <Container className="mt-4">
         <Row className="justify-content-center">
            <Col md={8} lg={6}>
               
               {/* Order Summary Card */}
               <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                  <div className="p-3 d-flex justify-content-between align-items-center bg-light border-bottom">
                     <span className="text-secondary fw-bold">รหัสสั่งซื้อ</span>
                     <span className="fw-bold text-primary">#{order._id.slice(-6).toUpperCase()}</span>
                  </div>
                  <Card.Body className="p-4 text-center">
                     <p className="text-secondary mb-1">ยอดที่ต้องชำระ</p>
                     <h1 className="fw-bold display-4 text-dark mb-0">฿{order.totalPrice.toLocaleString()}</h1>
                     
                     <div className="mt-3 d-flex justify-content-center gap-2">
                        <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill bg-opacity-25 text-warning-emphasis border border-warning">
                           <FaMoneyBillWave className="me-1"/> รอการโอนเงิน
                        </Badge>
                     </div>
                  </Card.Body>
               </Card>

               {/* Upload Form */}
               <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                  <div className="p-3 text-center text-white" style={{background: warningGradient}}>
                     <h5 className="fw-bold mb-0"><FaFileInvoiceDollar className="me-2"/> อัปโหลดสลิปโอนเงิน</h5>
                  </div>
                  
                  <Card.Body className="p-4 p-lg-5">
                     {error && <Alert variant="danger"><FaTimes className="me-2"/> {error}</Alert>}

                     <Form>
                        {/* Hidden Input */}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="d-none"
                        />

                        {/* Dropzone / Preview Area */}
                        <div 
                           className={`upload-zone rounded-4 border-2 border-dashed p-4 text-center cursor-pointer transition-all ${previewUrl ? 'border-success bg-success bg-opacity-10' : 'border-secondary bg-light'}`}
                           style={{minHeight: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}
                           onClick={() => !previewUrl && fileInputRef.current?.click()}
                        >
                           {previewUrl ? (
                              <div className="position-relative w-100 h-100">
                                 <div style={{maxHeight: '400px', overflow: 'hidden'}} className="rounded-3 shadow-sm">
                                     {/* Preview Image */}
                                     <img src={previewUrl} alt="Slip Preview" style={{maxWidth: '100%', maxHeight: '300px', objectFit: 'contain'}} />
                                 </div>
                                 <Button 
                                   variant="danger" 
                                   size="sm" 
                                   className="position-absolute top-0 end-0 m-2 rounded-circle shadow"
                                   style={{width: 32, height: 32, padding: 0}}
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleClearFile();
                                   }}
                                 >
                                    <FaTimes />
                                 </Button>
                                 <p className="text-success fw-bold mt-3 mb-0"><FaCheckCircle className="me-1"/> รูปพร้อมส่งแล้ว</p>
                              </div>
                           ) : (
                              <div className="opacity-50 hover-opacity-100 transition-all">
                                 <FaCloudUploadAlt size={60} className="mb-3 text-secondary"/>
                                 <h5 className="fw-bold text-dark">แตะเพื่อเลือกรูปสลิป</h5>
                                 <p className="text-muted small">รองรับไฟล์ .jpg, .png (ไม่เกิน 5MB)</p>
                                 <Button variant="outline-secondary" size="sm" className="rounded-pill px-3 mt-2 pointer-events-none">
                                    <FaImage className="me-1"/> เลือกจากอัลบั้ม
                                 </Button>
                              </div>
                           )}
                        </div>

                        {/* Submit Button */}
                        <Button 
                          className="w-100 mt-4 py-3 rounded-pill fw-bold shadow-lg fs-5"
                          style={{background: warningGradient, border: 'none'}}
                          disabled={!selectedFile || uploading}
                          onClick={handleSubmit}
                        >
                           {uploading ? (
                              <><Spinner animation="border" size="sm" className="me-2"/> กำลังอัปโหลด...</>
                           ) : (
                              <><FaCheckCircle className="me-2"/> ยืนยันการโอนเงิน</>
                           )}
                        </Button>

                        <div className="text-center mt-3">
                           <Button variant="link" className="text-secondary text-decoration-none" onClick={() => router.back()}>
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