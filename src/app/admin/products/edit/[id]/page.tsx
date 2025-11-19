'use client';

import { useSession } from "next-auth/react"; // ✅
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Card, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaImage } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

export default function EditProductPage() {
  const { data: session } = useSession(); // ✅
  const { id } = useParams();
  const router = useRouter();
  
  // ... (State และ Refs เหมือนเดิม) ...
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
     const fetchData = async () => {
         try {
             const res = await fetch(`${API_ENDPOINTS.PRODUCTS}?admin=true`);
             const data = await res.json();
             const found = data.find((p: any) => p._id === id);
             if(found) { setProduct(found); setImagePreview(found.imageUrl); }
         } catch(e) { console.error(e); } finally { setLoading(false); }
     };
     fetchData();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', nameRef.current?.value || '');
      formData.append('price', priceRef.current?.value || '0');
      formData.append('description', descRef.current?.value || '');
      formData.append('type', typeRef.current?.value || '');
      
      if (fileRef.current?.files?.[0]) {
          formData.append('image', fileRef.current.files[0]);
      }

      try {
          const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
              method: 'PUT',
              // ✅ แนบ Token
              headers: {
                  'Authorization': `Bearer ${(session as any)?.accessToken}`
              },
              body: formData
          });
          if (!res.ok) throw new Error('Failed');
          alert('แก้ไขข้อมูลเรียบร้อย');
          router.push('/admin/products');
      } catch (error) {
          alert('เกิดข้อผิดพลาด');
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border"/></div>;
  if (!product) return <div className="text-center py-5">ไม่พบสินค้า</div>;

  return (
      // ... (ใช้ Code UI เดิมจากข้อที่แล้วได้เลยครับ ไม่มีการเปลี่ยนแปลง) ...
      <Container className="pb-5">
       <div className="d-flex align-items-center mb-4">
           <Button variant="light" className="me-3 rounded-circle shadow-sm" onClick={() => router.back()}><FaArrowLeft/></Button>
           <h3 className="fw-bold mb-0">แก้ไขข้อมูลสินค้า</h3>
       </div>
       <Form onSubmit={handleSubmit}>
           <Row className="g-4">
               <Col lg={8}>
                   <Card className="border-0 shadow-sm rounded-4 p-4">
                       <Row className="g-3">
                           <Col md={12}><Form.Group><Form.Label>ชื่อสินค้า</Form.Label><Form.Control ref={nameRef} defaultValue={product.name} required /></Form.Group></Col>
                           <Col md={6}><Form.Group><Form.Label>ประเภท</Form.Label><Form.Control ref={typeRef} defaultValue={product.type} required /></Form.Group></Col>
                           <Col md={6}><Form.Group><Form.Label>ราคา</Form.Label><Form.Control ref={priceRef} type="number" defaultValue={product.price} required /></Form.Group></Col>
                           <Col md={12}><Form.Group><Form.Label>รายละเอียด</Form.Label><Form.Control ref={descRef} as="textarea" rows={4} defaultValue={product.description} /></Form.Group></Col>
                       </Row>
                   </Card>
               </Col>
               <Col lg={4}>
                   <Card className="border-0 shadow-sm rounded-4 p-4 text-center">
                       <div className="bg-light rounded-4 border mb-3 overflow-hidden position-relative" style={{height: '250px'}}>
                           {imagePreview ? <img src={imagePreview} style={{width: '100%', height: '100%', objectFit: 'contain'}} /> : <FaImage size={30}/>}
                       </div>
                       <Form.Control ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
                   </Card>
                   <Button type="submit" disabled={submitting} className="w-100 mt-4 py-3 rounded-pill fw-bold shadow btn-gradient-primary">
                       {submitting ? <Spinner size="sm"/> : <><FaSave className="me-2"/> บันทึกการเปลี่ยนแปลง</>}
                   </Button>
               </Col>
           </Row>
       </Form>
    </Container>
  );
}