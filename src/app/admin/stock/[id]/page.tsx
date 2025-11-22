// src/app/admin/stock/[id]/page.tsx
'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Card, Button, Row, Col, Spinner, Table, Form, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaBox, FaTag, FaInfoCircle, FaHashtag, FaChartLine } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

// ✅ ประกาศไซส์มาตรฐานให้ครบ
const ALL_SIZES = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];

export default function ManageStockDetailPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [addInputs, setAddInputs] = useState<Record<string, number>>({}); // เก็บค่าที่ต้องการ "เพิ่ม"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
          const res = await fetch(`${API_ENDPOINTS.PRODUCTS}?admin=true`);
          const data = await res.json();
          const found = data.find((p: any) => p._id === id);
          setProduct(found);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    if(id) fetchProduct();
  }, [id]);

  const handleSave = async () => {
      setSaving(true);
      try {
          // 🚨 แก้ไขจุดที่ 1: วนลูปตาม ALL_SIZES เพื่อเช็คทุกช่องที่กรอก (แม้ไซส์นั้นจะยังไม่มีใน DB)
          for (const size of ALL_SIZES) {
             const addAmount = addInputs[size] || 0;
             
             if (addAmount !== 0) {
                 // หาจำนวนเดิม (ถ้าไม่มีใน DB ให้ถือเป็น 0)
                 const stockItem = product.stock.find((s: any) => s.size === size);
                 const currentQty = stockItem ? stockItem.quantity : 0;

                 const newTotal = currentQty + addAmount;

                 // ป้องกันค่าติดลบ
                 if (newTotal < 0) {
                     alert(`ไม่สามารถบันทึกได้: ไซส์ ${size} จะเหลือต่ำกว่า 0 (${newTotal})`);
                     setSaving(false);
                     return; // หยุดทันที
                 }

                 // ส่ง API
                 await fetch(API_ENDPOINTS.PRODUCT_STOCK(id as string), {
                     method: 'PATCH',
                     headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${(session as any)?.accessToken}`
                     },
                     body: JSON.stringify({ size: size, quantity: newTotal, mode: 'set' })
                 });
             }
          }
          alert('อัปเดตสต็อกเรียบร้อย');
          setAddInputs({}); 
          window.location.reload(); 
      } catch (error) { alert('Error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-5"><Spinner animation="border"/></div>;
  if (!product) return <div className="text-center py-5">ไม่พบสินค้า</div>;

  const currentTotalStock = product.stock.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  let totalAddedAmount = 0;
  ALL_SIZES.forEach(size => {
      totalAddedAmount += (addInputs[size] || 0);
  });
  
  const newGrandTotal = currentTotalStock + totalAddedAmount;

  return (
    <Container className="pb-5">
        <div className="d-flex align-items-center mb-4">
            <Button variant="light" className="me-3 rounded-circle shadow-sm" onClick={() => router.back()}><FaArrowLeft/></Button>
            <h3 className="fw-bold mb-0">จัดการสต็อกสินค้า</h3>
        </div>

        {/* Product Info Card */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <Card.Body className="p-4">
                <div className="d-flex flex-column flex-md-row align-items-start gap-4">
                    <div className="position-relative rounded-4 overflow-hidden border flex-shrink-0 shadow-sm" style={{width: 150, height: 150}}>
                        <Image src={product.imageUrl} alt={product.name} fill style={{objectFit:'cover'}} />
                    </div>
                    <div className="flex-grow-1 w-100">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                            <div>
                                <h4 className="fw-bold text-primary mb-1">{product.name}</h4>
                                <small className="text-muted d-flex align-items-center gap-1" style={{fontSize: '0.85rem'}}>
                                    <FaHashtag size={12}/> รหัส: <span className="font-monospace select-all bg-light px-1 rounded border">{product._id}</span>
                                </small>
                            </div>
                            <Badge bg={currentTotalStock > 0 ? 'success' : 'danger'} className="fs-6 px-3 py-2 shadow-sm mt-2 mt-md-0">
                                <FaBox className="me-2"/> รวมปัจจุบัน {currentTotalStock.toLocaleString()} ตัว
                            </Badge>
                        </div>

                        <div className="d-flex flex-wrap gap-3 mb-3">
                            <div className="px-3 py-2 bg-light rounded-3 border d-flex align-items-center gap-2">
                                <FaTag className="text-secondary"/>
                                <div><small className="d-block text-muted lh-1" style={{fontSize: '0.7rem'}}>ประเภท</small><span className="fw-bold text-dark">{product.type}</span></div>
                            </div>
                            <div className="px-3 py-2 bg-light rounded-3 border d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark" style={{fontSize: '1.2rem'}}>฿{product.price.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-light rounded-3 border border-light-subtle">
                            <div className="d-flex align-items-center gap-2 mb-1 text-secondary">
                                <FaInfoCircle size={14}/> <small className="fw-bold">รายละเอียดสินค้า</small>
                            </div>
                            <p className="mb-0 text-dark small text-break" style={{whiteSpace: 'pre-wrap'}}>{product.description || '-'}</p>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>

        {/* Stock Calculator Table */}
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-warning bg-opacity-10 border-bottom-0 p-3 text-center">
                 <h5 className="fw-bold text-dark mb-0">🧮 ตารางคำนวณสต็อก (Real-time)</h5>
                 <small className="text-muted">กรอกจำนวนที่ต้องการเพิ่ม (+) หรือลด (-) ในช่องสีขาว</small>
            </div>
            <Card.Body className="p-0">
                <Table responsive hover className="align-middle mb-0 text-center">
                    <thead className="bg-light text-secondary">
                        <tr>
                            <th className="py-3" style={{width: '20%'}}>ขนาด (Size)</th>
                            <th className="py-3" style={{width: '20%'}}>จำนวนเดิม</th>
                            <th className="py-3 text-primary" style={{width: '30%'}}>เพิ่ม/ลด</th>
                            <th className="py-3 bg-success bg-opacity-10 fw-bold text-success" style={{width: '30%'}}>ยอดรวมใหม่</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ALL_SIZES.map((size) => {
                            // หาข้อมูลสต็อก (ถ้าไม่มีให้เป็น 0)
                            const stockItem = product.stock.find((s: any) => s.size === size);
                            const currentQty = stockItem ? stockItem.quantity : 0;
                            const hasRecord = !!stockItem;

                            // ดึงค่าที่กรอก (ถ้าไม่มีคือ 0)
                            const addQty = addInputs[size] || 0;
                            const newTotal = currentQty + addQty;
                            
                            const isNegative = newTotal < 0;

                            return (
                                <tr key={size}>
                                    <td className="fw-bold fs-5">{size}</td>
                                    
                                    <td>
                                        {hasRecord ? (
                                            <span className="badge bg-secondary fs-6 fw-normal px-3">{currentQty}</span>
                                        ) : (
                                            <span className="badge bg-light text-muted border px-2">-</span>
                                        )}
                                    </td>

                                    <td>
                                        <div className="d-flex justify-content-center align-items-center">
                                            {/* 🚨 แก้ไขจุดที่ 2: ใส่ value เป็น addInputs[size] || '' เพื่อแก้ปัญหา Uncontrolled Input */}
                                            <Form.Control 
                                                type="number" 
                                                className="text-center border-primary fw-bold text-primary shadow-sm"
                                                style={{maxWidth: '120px', fontSize: '1.1rem'}}
                                                placeholder="0"
                                                value={addInputs[size] === undefined || addInputs[size] === 0 ? '' : addInputs[size]} 
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    // ถ้าลบจนหมดให้เป็น 0
                                                    setAddInputs({...addInputs, [size]: val === '' ? 0 : Number(val)})
                                                }}
                                            />
                                        </div>
                                    </td>

                                    <td className={isNegative ? "bg-danger bg-opacity-10" : "bg-success bg-opacity-10"}>
                                        <span className={`fs-5 fw-bold ${isNegative ? 'text-danger' : 'text-success'}`}>
                                            {newTotal}
                                        </span>
                                        {isNegative && <small className="d-block text-danger fw-bold" style={{fontSize: '0.7rem'}}>(ติดลบ!)</small>}
                                        {!isNegative && newTotal !== currentQty && <small className="d-block text-muted" style={{fontSize: '0.7rem'}}>(เดิม {currentQty} {addQty >= 0 ? '+' : '-'} {Math.abs(addQty)})</small>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card.Body>
            
            <div className="card-footer bg-white p-4 border-top shadow-sm">
                 <Row className="align-items-center g-3">
                    <Col md={8}>
                        <div className="d-flex flex-column flex-md-row gap-3 gap-md-5 p-3 bg-light rounded-3 border">
                            <div>
                                <small className="text-muted d-block">ยอดรวมเดิม</small>
                                <span className="fw-bold fs-5">{currentTotalStock.toLocaleString()}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <FaChartLine className="text-secondary me-3 d-none d-md-block"/>
                                <div>
                                    <small className="text-muted d-block">เปลี่ยนแปลงสุทธิ</small>
                                    <span className={`fw-bold fs-5 ${totalAddedAmount > 0 ? 'text-success' : (totalAddedAmount < 0 ? 'text-danger' : 'text-dark')}`}>
                                        {totalAddedAmount > 0 ? '+' : ''}{totalAddedAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="ms-md-auto ps-md-4 border-start-md">
                                <small className="text-success fw-bold d-block">ยอดรวมใหม่ทั้งหมด</small>
                                <span className={`fw-bold fs-3 ${newGrandTotal < 0 ? 'text-danger' : 'text-success'}`}>
                                    {newGrandTotal.toLocaleString()}
                                </span> 
                                <span className="text-muted small ms-1">ตัว</span>
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="text-end">
                         <Button 
                            size="lg" 
                            className="w-100 rounded-pill px-4 fw-bold shadow btn-gradient-primary"
                            onClick={handleSave}
                            disabled={saving || newGrandTotal < 0}
                         >
                            {saving ? <Spinner size="sm"/> : <><FaSave className="me-2"/> ยืนยันการอัปเดต</>}
                         </Button>
                    </Col>
                 </Row>
            </div>
        </Card>
    </Container>
  );
}