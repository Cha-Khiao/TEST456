'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Card, Button, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaImage, FaBox, FaTag, FaCloudUploadAlt } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

export default function EditProductPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State สำหรับข้อมูล
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [typeInput, setTypeInput] = useState('');
  const [existingTypes, setExistingTypes] = useState<string[]>([]);

  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const res = await fetch(API_ENDPOINTS.PRODUCTS);
              const data = await res.json();
              
              const found = data.find((p: any) => p._id === id);
              
              if(found) { 
                  setProduct(found); 
                  setImagePreview(found.imageUrl); 
                  
                  setTypeInput(found.type); 
              }

              const types = Array.from(new Set(data.map((p: any) => p.type))).filter(Boolean) as string[];
              setExistingTypes(types);

          } catch(e) { 
              console.error(e); 
          } finally { 
              setLoading(false); 
          }
      };
      if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (product) {
        setTypeInput(product.type);
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setImagePreview(URL.createObjectURL(file));
  };

  const preventNegativeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
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

      try {
          const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
              method: 'PUT',
              headers: {
                  'Authorization': `Bearer ${(session as any)?.accessToken}`
              },
              body: formData
          });
          
          if (!res.ok) throw new Error('Failed');
          
          alert('แก้ไขข้อมูลเรียบร้อย');
          router.push('/admin/products');
      } catch (error) {
          alert('เกิดข้อผิดพลาดในการบันทึก');
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary"/>
    </div>
  );

  if (!product) return <div className="text-center py-5">ไม่พบสินค้า</div>;

  return (
      <Container fluid className="px-4 py-4">
        
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-3">
                <Button variant="white" className="rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center hover-scale" style={{width: 45, height: 45}} onClick={() => router.back()}>
                    <FaArrowLeft className="text-primary"/>
                </Button>
                <div>
                    <h4 className="fw-bold text-dark mb-0">แก้ไขสินค้า</h4>
                    <small className="text-muted">รหัสสินค้า: {product._id}</small>
                </div>
            </div>
        </div>

        <Form onSubmit={handleSubmit}>
            <Row className="g-4 align-items-start">
                
                {/* LEFT COLUMN: Info */}
                <Col lg={8}>
                    <Card className="border-status-primary shadow rounded-4 mb-4 hover-card-up overflow-hidden">
                        <Card.Header className="bg-primary bg-opacity-10 border-bottom py-3 text-center">
                            <h6 className="fw-bold text-primary mb-0 d-inline-flex align-items-center gap-2">
                                <span className="p-2 bg-primary bg-opacity-10 rounded-circle"><FaBox/></span> ข้อมูลทั่วไป
                            </h6>
                        </Card.Header>
                        
                        <Card.Body className="p-4 p-lg-5">
                            <Row className="g-4">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="text-secondary fw-bold small text-uppercase" style={{letterSpacing:'0.5px'}}>ชื่อสินค้า</Form.Label>
                                        <Form.Control 
                                            ref={nameRef} 
                                            defaultValue={product.name}
                                            required 
                                            type="text" 
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
                                                defaultValue={product.price}
                                                required 
                                                type="number" 
                                                min={0}
                                                onKeyDown={preventNegativeInput}
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
                                                defaultValue={product.description}
                                                as="textarea" 
                                                rows={5} 
                                                className="bg-transparent border-0 shadow-none text-dark"
                                                style={{ lineHeight: '1.6' }}
                                            />
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT COLUMN: Image & Save */}
                <Col lg={4}>
                    <Card className="border-status-info shadow rounded-4 mb-4 hover-card-up text-center overflow-hidden h-100">
                        <Card.Header className="bg-info bg-opacity-10 border-bottom py-3">
                            <h6 className="fw-bold text-info mb-0 d-inline-flex align-items-center gap-2">
                                <span className="p-2 bg-info bg-opacity-10 rounded-circle"><FaImage/></span> รูปภาพสินค้า
                            </h6>
                        </Card.Header>
                        
                        <Card.Body className="p-4 d-flex flex-column">
                            <div 
                                    className={`bg-light rounded-4 border-2 border-dashed d-flex align-items-center justify-content-center mb-3 overflow-hidden position-relative cursor-pointer hover-bg-gray transition-all flex-grow-1 ${imagePreview ? 'border-success' : 'border-secondary border-opacity-25'}`}
                                    style={{minHeight: '350px'}}
                                    onClick={() => fileRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                                        <div className="position-absolute bottom-0 start-0 w-100 bg-success bg-opacity-90 text-white py-2 small fw-bold">
                                            คลิกเพื่อเปลี่ยนรูป
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-muted opacity-75 py-5 animate-bounce-slow">
                                        <div className="mb-3 bg-white p-4 rounded-circle shadow-sm d-inline-block">
                                            <FaCloudUploadAlt size={40} className="text-info"/>
                                        </div>
                                        <h6 className="fw-bold text-dark mb-1">อัปโหลดรูปภาพ</h6>
                                        <span className="btn btn-sm btn-outline-primary rounded-pill mt-3 px-4 shadow-sm">เลือกไฟล์...</span>
                                    </div>
                                )}
                            </div>
                            <Form.Control ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="d-none" />
                            
                            <Button type="submit" disabled={submitting} className="w-100 py-3 rounded-pill fw-bold shadow-lg btn-gradient-primary border-0 mt-3 hover-scale fs-5">
                                {submitting ? <Spinner size="sm"/> : <><FaSave className="me-2"/> บันทึกการเปลี่ยนแปลง</>}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Form>
      </Container>
  );
}