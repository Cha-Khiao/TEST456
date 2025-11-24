'use client';

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Card, Button, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaImage, FaTimes, FaBox, FaTag, FaLayerGroup, FaCloudUploadAlt, FaMinus, FaPlus } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const STANDARD_SIZES = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];

export default function CreateProductPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [typeInput, setTypeInput] = useState('');
  const [existingTypes, setExistingTypes] = useState<string[]>([]);

  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const fetchExistingTypes = async () => {
          try {
              const res = await fetch(API_ENDPOINTS.PRODUCTS);
              if (res.ok) {
                  const products = await res.json();
                  const types = Array.from(new Set(products.map((p: any) => p.type))).filter(Boolean) as string[];
                  setExistingTypes(types);
              }
          } catch (err) {
              console.error("Failed to fetch types", err);
          }
      };
      fetchExistingTypes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (['-', '+', 'e', 'E'].includes(e.key)) {
          e.preventDefault();
      }
  };

  const handleStockInputChange = (size: string, value: string) => {
      if (!/^\d*$/.test(value)) return;
      setStockInputs(prev => ({ ...prev, [size]: value }));
  };

  const updateStock = (size: string, delta: number) => {
      const currentVal = parseInt(stockInputs[size] || '0', 10);
      const newVal = Math.max(0, currentVal + delta);
      setStockInputs(prev => ({ ...prev, [size]: newVal === 0 ? '' : newVal.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const validStock = STANDARD_SIZES.filter(size => {
          const qty = parseInt(stockInputs[size] || '0', 10);
          return qty > 0;
      }).map(size => ({
          size,
          quantity: parseInt(stockInputs[size] || '0', 10),
          sold: 0
      }));

      if (validStock.length === 0) return alert('กรุณาระบุจำนวนสินค้าอย่างน้อย 1 ไซส์');
      if (!typeInput) return alert('กรุณาระบุประเภทสินค้า');
      
      const priceVal = parseFloat(priceRef.current?.value || '0');
      if (priceVal < 0) return alert('ราคาขายต้องไม่ต่ำกว่า 0');

      setSubmitting(true);
      const formData = new FormData();
      
      formData.append('name', nameRef.current?.value || '');
      formData.append('price', priceVal.toString());
      formData.append('description', descRef.current?.value || '');
      formData.append('type', typeInput);
      
      if (fileRef.current?.files?.[0]) {
          formData.append('image', fileRef.current.files[0]);
      }

      formData.append('stock', JSON.stringify(validStock));

      try {
          const res = await fetch(API_ENDPOINTS.PRODUCTS, { 
              method: 'POST', 
              headers: { 'Authorization': `Bearer ${(session as any)?.accessToken}` },
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
    <Container fluid className="px-4 py-4">
       
       {/* Header */}
       <div className="d-flex align-items-center justify-content-between mb-4">
           <div className="d-flex align-items-center gap-3">
               <Button variant="white" className="rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center hover-scale bg-white text-primary" style={{width: 45, height: 45}} onClick={() => router.back()}>
                   <FaArrowLeft/>
               </Button>
               <div>
                   <h4 className="fw-bold text-dark mb-0">เพิ่มสินค้าใหม่</h4>
                   <small className="text-muted">กรอกรายละเอียดสินค้าเพื่อนำขึ้นขาย</small>
               </div>
           </div>
       </div>

       <Form onSubmit={handleSubmit}>
       <Row className="g-4 align-items-start">
           
           {/* LEFT COLUMN */}
           <Col lg={8}>
               <Card className="border-status-primary shadow-sm rounded-4 mb-4 hover-card-up overflow-hidden">
                   <Card.Header className="bg-primary bg-opacity-10 border-bottom py-3 text-center">
                       <h6 className="fw-bold text-primary mb-0 d-inline-flex align-items-center justify-content-center gap-2 w-100">
                           <FaBox/> ข้อมูลทั่วไป
                       </h6>
                   </Card.Header>
                   <Card.Body className="p-4 p-lg-5">
                       <Row className="g-4">
                           <Col md={12}>
                               <Form.Group>
                                   <Form.Label className="text-secondary fw-bold small text-uppercase" style={{letterSpacing:'0.5px'}}>ชื่อสินค้า</Form.Label>
                                   <Form.Control 
                                        ref={nameRef} 
                                        required 
                                        type="text" 
                                        placeholder="ระบุชื่อสินค้า..." 
                                        className="bg-light border-0 px-3 rounded-3 shadow-none fw-bold text-dark"
                                        style={{ lineHeight: '1.8', padding: '0.8rem 1rem' }}
                                   />
                               </Form.Group>
                           </Col>
                           <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-secondary fw-bold small text-uppercase" style={{letterSpacing:'0.5px'}}>ประเภทสินค้า</Form.Label>
                                    <InputGroup className="input-group-modern">
                                        <InputGroup.Text className="text-secondary ps-3"><FaTag/></InputGroup.Text>
                                        <Form.Control 
                                            list="typeOptions"
                                            value={typeInput} 
                                            onChange={(e) => setTypeInput(e.target.value)} 
                                            required 
                                            placeholder="พิมพ์ หรือเลือกจากรายการ" 
                                            className="bg-transparent border-0 py-3 shadow-none fw-bold text-dark"
                                            style={{ lineHeight: '1.8', padding: '0.8rem 1rem' }}
                                        />
                                        <datalist id="typeOptions">
                                            {existingTypes.map((type, idx) => (
                                                <option key={idx} value={type} />
                                            ))}
                                        </datalist>
                                    </InputGroup>
                                </Form.Group>
                           </Col>
                           <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="text-secondary fw-bold small text-uppercase" style={{letterSpacing:'0.5px'}}>ราคาขาย</Form.Label>
                                    <InputGroup className="input-group-modern">
                                        <InputGroup.Text className="text-secondary ps-3 fw-bold">฿</InputGroup.Text>
                                        <Form.Control 
                                            ref={priceRef} 
                                            required 
                                            type="number" 
                                            min={0} 
                                            onKeyDown={preventNegativeInput}
                                            placeholder="0.00" 
                                            className="bg-transparent border-0 py-3 shadow-none fw-bold text-dark"
                                            style={{ lineHeight: '1.8', padding: '0.8rem 1rem' }}
                                        />
                                    </InputGroup>
                                </Form.Group>
                           </Col>
                           <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="text-secondary fw-bold small text-uppercase" style={{letterSpacing:'0.5px'}}>รายละเอียดเพิ่มเติม</Form.Label>
                                    <div className="bg-light rounded-3 p-2">
                                        <Form.Control 
                                            ref={descRef} 
                                            as="textarea" 
                                            rows={4} 
                                            placeholder="อธิบายรายละเอียดสินค้า..." 
                                            className="bg-transparent border-0 shadow-none text-dark"
                                            style={{ lineHeight: '1.6' }}
                                        />
                                    </div>
                                </Form.Group>
                           </Col>
                       </Row>
                   </Card.Body>
               </Card>

               {/* Stock Management Card */}
               <Card className="border-status-warning shadow-sm rounded-4 mb-4 hover-card-up overflow-hidden">
                   <Card.Header className="bg-warning bg-opacity-10 border-bottom py-3 text-center">
                        <h6 className="fw-bold text-warning-emphasis mb-0 d-inline-flex align-items-center justify-content-center gap-2 w-100">
                            <FaLayerGroup/> จัดการสต็อก
                        </h6>
                   </Card.Header>
                   
                   <Card.Body className="p-4">
                       <div className="mb-4 text-center">
                           <span className="text-muted small">กด <b>+</b> หรือ <b>-</b> เพื่อเพิ่มลดจำนวน หรือพิมพ์ตัวเลขลงในช่อง (ปล่อยว่างหากไม่มีของ)</span>
                       </div>

                       <div className="stock-grid-container">
                           <Row className="g-3 justify-content-center">
                                {STANDARD_SIZES.map(size => {
                                    const qty = parseInt(stockInputs[size] || '0', 10);
                                    const hasStock = qty > 0;
                                    
                                    return (
                                        <Col xs={12} sm={6} md={4} lg={3} key={size}>
                                            <div className={`p-3 rounded-4 border transition-all text-center ${hasStock ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'border-light bg-light'}`}>
                                                <div className={`fw-bold mb-2 ${hasStock ? 'text-primary' : 'text-secondary'}`}>{size}</div>
                                                
                                                <div className="d-flex align-items-center justify-content-center bg-white rounded-pill shadow-sm p-1 border">
                                                    <Button 
                                                        variant="link" 
                                                        className="text-decoration-none text-secondary p-0 rounded-circle hover-bg-gray" 
                                                        style={{width: 30, height: 30}}
                                                        onClick={() => updateStock(size, -1)}
                                                    >
                                                        <FaMinus size={10}/>
                                                    </Button>
                                                    
                                                    <Form.Control 
                                                        type="text" 
                                                        value={stockInputs[size] || ''}
                                                        onChange={(e) => handleStockInputChange(size, e.target.value)}
                                                        className="text-center border-0 p-0 fw-bold text-dark"
                                                        style={{width: '50px', fontSize: '1.1rem', background: 'transparent', boxShadow: 'none'}}
                                                        placeholder="0"
                                                    />
                                                    
                                                    <Button 
                                                        variant="link" 
                                                        className="text-decoration-none text-primary p-0 rounded-circle hover-bg-gray" 
                                                        style={{width: 30, height: 30}}
                                                        onClick={() => updateStock(size, 1)}
                                                    >
                                                        <FaPlus size={10}/>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    );
                                })}
                           </Row>
                       </div>
                   </Card.Body>
               </Card>
           </Col>

           {/* RIGHT COLUMN */}
           <Col lg={4}>
               <Card className="border-status-info shadow-sm rounded-4 mb-4 hover-card-up text-center overflow-hidden">
                   <Card.Header className="bg-info bg-opacity-10 border-bottom py-3 text-center">
                       <h6 className="fw-bold text-info-emphasis mb-0 d-inline-flex align-items-center justify-content-center gap-2 w-100">
                           <FaImage/> รูปภาพสินค้า
                       </h6>
                   </Card.Header>
                   
                   <Card.Body className="p-4 d-flex flex-column">
                       <div 
                            className={`bg-light rounded-4 border-2 border-dashed d-flex align-items-center justify-content-center mb-3 overflow-hidden position-relative cursor-pointer hover-bg-gray transition-all flex-grow-1 ${imagePreview ? 'border-success' : 'border-secondary border-opacity-25'}`}
                            style={{minHeight: '350px'}}
                            onClick={() => !imagePreview && fileRef.current?.click()}
                       >
                           {imagePreview ? (
                               <>
                                   <img src={imagePreview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                                   <div className="position-absolute top-0 end-0 m-2">
                                        <Button variant="danger" size="sm" className="rounded-circle shadow-sm p-2" 
                                                onClick={(e) => { e.stopPropagation(); setImagePreview(null); if(fileRef.current) fileRef.current.value=''; }}>
                                            <FaTimes size={14}/>
                                        </Button>
                                   </div>
                                   <div className="position-absolute bottom-0 start-0 w-100 bg-success bg-opacity-90 text-white py-2 small fw-bold">
                                       รูปภาพพร้อมอัปโหลด
                                   </div>
                               </>
                           ) : (
                               <div className="text-muted opacity-75 py-5 animate-bounce-slow">
                                   <div className="mb-3 bg-white p-4 rounded-circle shadow-sm d-inline-block">
                                      <FaCloudUploadAlt size={40} className="text-info"/>
                                   </div>
                                   <h6 className="fw-bold text-dark mb-1">อัปโหลดรูปภาพ</h6>
                                   <p className="small mb-0 text-secondary">รองรับไฟล์ .jpg, .png</p>
                                   <span className="btn btn-sm btn-outline-primary rounded-pill mt-3 px-4 shadow-sm">เลือกไฟล์...</span>
                               </div>
                           )}
                       </div>
                       <Form.Control ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="d-none" />
                       
                       <Button type="submit" disabled={submitting} className="w-100 py-3 rounded-pill fw-bold shadow-lg btn-gradient-primary border-0 mt-3 hover-scale fs-5">
                           {submitting ? <Spinner size="sm"/> : <><FaSave className="me-2"/> บันทึกสินค้า</>}
                       </Button>
                   </Card.Body>
               </Card>
           </Col>
       </Row>
       </Form>
    </Container>
  );
}