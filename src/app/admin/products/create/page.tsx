'use client';

import { useSession } from "next-auth/react"; // ✅ 1. Import Session
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaImage, FaTimes } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const STANDARD_SIZES = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];

export default function CreateProductPage() {
  const { data: session } = useSession(); // ✅ 2. เรียกใช้ Session
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // ... (State และ Refs เหมือนเดิม ไม่ต้องแก้) ...
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [initialQuantities, setInitialQuantities] = useState<Record<string, number>>({ S: 10, M: 10, L: 10, XL: 10 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [typeInput, setTypeInput] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const toggleSize = (size: string) => {
      if (selectedSizes.includes(size)) {
          setSelectedSizes(prev => prev.filter(s => s !== size));
          const newQty = { ...initialQuantities }; delete newQty[size]; setInitialQuantities(newQty);
      } else {
          const newSelection = [...selectedSizes, size].sort((a, b) => STANDARD_SIZES.indexOf(a) - STANDARD_SIZES.indexOf(b));
          setSelectedSizes(newSelection);
          setInitialQuantities(prev => ({ ...prev, [size]: 0 }));
      }
  };

  const handleQuantityChange = (size: string, value: string) => {
      setInitialQuantities(prev => ({ ...prev, [size]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedSizes.length === 0) return alert('กรุณาเลือกอย่างน้อย 1 ไซส์');
      if (!typeInput) return alert('กรุณาระบุประเภทสินค้า');
      
      setSubmitting(true);
      const formData = new FormData();
      
      formData.append('name', nameRef.current?.value || '');
      formData.append('price', priceRef.current?.value || '0');
      formData.append('description', descRef.current?.value || '');
      formData.append('type', typeInput);
      
      if (fileRef.current?.files?.[0]) {
          formData.append('image', fileRef.current.files[0]);
      }

      const stockData = selectedSizes.map(size => ({
          size,
          quantity: initialQuantities[size] || 0,
          sold: 0
      }));
      formData.append('stock', JSON.stringify(stockData));

      try {
          const res = await fetch(API_ENDPOINTS.PRODUCTS, { 
              method: 'POST', 
              // ✅ 3. แนบ Token ใน Header (FormData ไม่ต้องใส่ Content-Type)
              headers: {
                  'Authorization': `Bearer ${(session as any)?.accessToken}`
              },
              body: formData 
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.error || 'Failed to create product');
          
          alert('บันทึกสินค้าเรียบร้อย!');
          router.push('/admin/products'); 
      } catch (error: any) {
          console.error(error);
          alert(`เกิดข้อผิดพลาด: ${error.message}`);
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <Container className="pb-5 pt-3">
        {/* ... (ส่วน UI เหมือนเดิมทุกอย่าง ก๊อปปี้ไฟล์เดิมมาวางทับส่วนนี้ได้เลย หรือใช้โค้ดจากรอบที่แล้ว) ... */}
        {/* เพื่อความกระชับ ผมขอละส่วน UI ไว้ เพราะเราแก้แค่ Logic submit ครับ */}
       <div className="d-flex align-items-center mb-4">
           <Button variant="light" className="me-3 rounded-circle shadow-sm" onClick={() => router.back()}><FaArrowLeft/></Button>
           <h3 className="fw-bold mb-0">เพิ่มสินค้าใหม่</h3>
       </div>

       <Form onSubmit={handleSubmit}>
       <Row className="g-4">
           <Col lg={8}>
               <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                   <h5 className="fw-bold text-primary mb-3">ข้อมูลทั่วไป</h5>
                   <Row className="g-3">
                       <Col md={12}>
                           <Form.Group>
                               <Form.Label>ชื่อสินค้า</Form.Label>
                               <Form.Control ref={nameRef} required type="text" placeholder="เช่น เสื้อรุ่น 243 ปี" className="bg-light border-0"/>
                           </Form.Group>
                       </Col>
                       <Col md={6}>
                            <Form.Group>
                                <Form.Label>ประเภท</Form.Label>
                                <Form.Control 
                                    list="types" 
                                    value={typeInput} 
                                    onChange={(e) => setTypeInput(e.target.value)} 
                                    required 
                                    placeholder="พิมพ์เอง หรือเลือกจากรายการ" 
                                    className="bg-light border-0"
                                />
                                <datalist id="types">
                                    <option value="normal">normal (สีปกติ)</option>
                                    <option value="mourning">mourning (ไว้ทุกข์)</option>
                                </datalist>
                            </Form.Group>
                       </Col>
                       <Col md={6}>
                            <Form.Group>
                                <Form.Label>ราคาขาย (บาท)</Form.Label>
                                <Form.Control ref={priceRef} required type="number" defaultValue={198} className="bg-light border-0"/>
                            </Form.Group>
                       </Col>
                       <Col md={12}>
                            <Form.Group>
                                <Form.Label>รายละเอียด</Form.Label>
                                <Form.Control ref={descRef} as="textarea" rows={4} className="bg-light border-0"/>
                            </Form.Group>
                       </Col>
                   </Row>
               </Card>

               <Card className="border-0 shadow-sm rounded-4 p-4">
                   <h5 className="fw-bold text-primary mb-3">ขนาดและสต็อกเริ่มต้น</h5>
                   <div className="d-flex flex-wrap gap-2 mb-3">
                       {STANDARD_SIZES.map(size => (
                           <div key={size} 
                                onClick={() => toggleSize(size)}
                                className={`px-3 py-2 rounded-3 border cursor-pointer user-select-none ${selectedSizes.includes(size) ? 'bg-primary text-white border-primary' : 'bg-white text-secondary'}`}
                           >
                               {size}
                           </div>
                       ))}
                   </div>
                   <Row className="g-3 bg-light p-3 rounded-3 border">
                        {selectedSizes.length === 0 && <div className="text-center text-muted py-3">ยังไม่ได้เลือกขนาด</div>}
                        {selectedSizes.map(size => (
                            <Col xs={6} md={4} lg={3} key={size}>
                                <InputGroup size="sm">
                                    <InputGroup.Text className="bg-white fw-bold" style={{width: '45px', justifyContent: 'center'}}>{size}</InputGroup.Text>
                                    <Form.Control 
                                        type="number" 
                                        min={0}
                                        value={initialQuantities[size]}
                                        onChange={(e) => handleQuantityChange(size, e.target.value)}
                                        className="text-center text-primary fw-bold"
                                    />
                                </InputGroup>
                            </Col>
                        ))}
                   </Row>
               </Card>
           </Col>

           <Col lg={4}>
               <Card className="border-0 shadow-sm rounded-4 p-4 mb-4 text-center">
                   <h5 className="fw-bold text-primary mb-3">รูปภาพสินค้า</h5>
                   <div className="bg-light rounded-4 border-2 border-dashed d-flex align-items-center justify-content-center mb-3 overflow-hidden position-relative" style={{height: '300px'}}>
                       {imagePreview ? (
                           <>
                               <img src={imagePreview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                               <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-2 rounded-circle" onClick={() => { setImagePreview(null); if(fileRef.current) fileRef.current.value=''; }}><FaTimes/></Button>
                           </>
                       ) : (
                           <div className="text-muted">
                               <FaImage size={40} className="mb-2 opacity-50"/>
                               <p className="small mb-0">คลิกเลือกไฟล์</p>
                           </div>
                       )}
                   </div>
                   <Form.Control ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
               </Card>

               <Button type="submit" disabled={submitting} className="w-100 py-3 rounded-pill fw-bold shadow-lg btn-gradient-primary">
                   {submitting ? <Spinner size="sm"/> : <><FaSave className="me-2"/> บันทึกสินค้า</>}
               </Button>
           </Col>
       </Row>
       </Form>
    </Container>
  );
}