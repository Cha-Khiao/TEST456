'use client';

import { useSession } from "next-auth/react"; // ✅
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Card, Button, Row, Col, Spinner, Table, Form, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaBox, FaTag, FaInfoCircle, FaHashtag, FaChartLine } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

export default function ManageStockDetailPage() {
  const { data: session } = useSession(); // ✅
  const { id } = useParams();
  const router = useRouter();
  
  // ... (State เดิม) ...
  const [product, setProduct] = useState<any>(null);
  const [addInputs, setAddInputs] = useState<Record<string, number>>({});
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
          for (const stockItem of product.stock) {
             const addAmount = addInputs[stockItem.size] || 0;
             
             if (addAmount !== 0) {
                 const newTotal = stockItem.quantity + addAmount;
                 
                 // ✅ แนบ Token
                 await fetch(API_ENDPOINTS.PRODUCT_STOCK(id as string), {
                     method: 'PATCH',
                     headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${(session as any)?.accessToken}`
                     },
                     body: JSON.stringify({ size: stockItem.size, quantity: newTotal, mode: 'set' })
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
  const totalAddedAmount = product.stock.reduce((sum: number, item: any) => sum + (addInputs[item.size] || 0), 0);
  const newGrandTotal = currentTotalStock + totalAddedAmount;

  return (
      // ... (UI เดิมทั้งหมด ไม่ต้องแก้) ...
    <Container className="pb-5">
        {/* Header Nav */}
        <div className="d-flex align-items-center mb-4">
            <Button variant="light" className="me-3 rounded-circle shadow-sm" onClick={() => router.back()}><FaArrowLeft/></Button>
            <h3 className="fw-bold mb-0">จัดการสต็อกสินค้า</h3>
        </div>

        {/* Product Info Card */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <Card.Body className="p-4">
                <div className="d-flex flex-column flex-md-row align-items-start gap-4">
                    
                    {/* รูปสินค้า */}
                    <div className="position-relative rounded-4 overflow-hidden border flex-shrink-0 shadow-sm" style={{width: 150, height: 150}}>
                        <Image src={product.imageUrl} alt={product.name} fill style={{objectFit:'cover'}} />
                    </div>

                    {/* รายละเอียดสินค้า */}
                    <div className="flex-grow-1 w-100">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                            <div>
                                <h4 className="fw-bold text-primary mb-1">{product.name}</h4>
                                {/* รหัสสินค้า */}
                                <small className="text-muted d-flex align-items-center gap-1" style={{fontSize: '0.85rem'}}>
                                    <FaHashtag size={12}/> รหัส: <span className="font-monospace select-all bg-light px-1 rounded border">{product._id}</span>
                                </small>
                            </div>
                            
                            {/* ยอดรวมสต็อกปัจจุบัน */}
                            <Badge bg={currentTotalStock > 0 ? 'success' : 'danger'} className="fs-6 px-3 py-2 shadow-sm mt-2 mt-md-0">
                                <FaBox className="me-2"/> รวมปัจจุบัน {currentTotalStock.toLocaleString()} ตัว
                            </Badge>
                        </div>

                        <div className="d-flex flex-wrap gap-3 mb-3">
                            <div className="px-3 py-2 bg-light rounded-3 border d-flex align-items-center gap-2">
                                <FaTag className="text-secondary"/>
                                <div>
                                    <small className="d-block text-muted lh-1" style={{fontSize: '0.7rem'}}>ประเภท</small>
                                    <span className="fw-bold text-dark">{product.type}</span>
                                </div>
                            </div>
                            <div className="px-3 py-2 bg-light rounded-3 border d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark" style={{fontSize: '1.2rem'}}>฿{product.price.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="p-3 bg-light rounded-3 border border-light-subtle">
                            <div className="d-flex align-items-center gap-2 mb-1 text-secondary">
                                <FaInfoCircle size={14}/> <small className="fw-bold">รายละเอียดสินค้า</small>
                            </div>
                            <p className="mb-0 text-dark small text-break" style={{whiteSpace: 'pre-wrap'}}>
                                {product.description || '- ไม่มีรายละเอียดเพิ่มเติม -'}
                            </p>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>

        {/* Stock Calculator Table */}
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-warning bg-opacity-10 border-bottom-0 p-3 text-center">
                 <h5 className="fw-bold text-dark mb-0">🧮 ตารางคำนวณสต็อก (Real-time)</h5>
                 <small className="text-muted">กรอกจำนวนที่ต้องการเพิ่ม/ลด ในช่องสีขาว ระบบจะคำนวณยอดรวมให้อัตโนมัติ</small>
            </div>
            <Card.Body className="p-0">
                <Table responsive hover className="align-middle mb-0 text-center">
                    <thead className="bg-light text-secondary">
                        <tr>
                            <th className="py-3" style={{width: '20%'}}>ขนาด (Size)</th>
                            <th className="py-3" style={{width: '20%'}}>จำนวนเดิม</th>
                            <th className="py-3 text-primary" style={{width: '30%'}}>ต้องการเพิ่ม/ลด (+/-)</th>
                            <th className="py-3 bg-success bg-opacity-10 fw-bold text-success" style={{width: '30%'}}>ยอดรวมใหม่</th>
                        </tr>
                    </thead>
                    <tbody>
                        {product.stock.map((stockItem: any) => {
                            const currentQty = stockItem.quantity;
                            const addQty = addInputs[stockItem.size] || 0;
                            const newTotal = currentQty + addQty;

                            return (
                                <tr key={stockItem.size}>
                                    <td className="fw-bold fs-5">{stockItem.size}</td>
                                    
                                    {/* จำนวนเดิม */}
                                    <td>
                                        <span className="badge bg-secondary fs-6 fw-normal px-3">{currentQty}</span>
                                    </td>

                                    {/* ช่องกรอก */}
                                    <td>
                                        <div className="d-flex justify-content-center align-items-center">
                                            <Form.Control 
                                                type="number" 
                                                className="text-center border-primary fw-bold text-primary shadow-sm"
                                                style={{maxWidth: '120px', fontSize: '1.1rem'}}
                                                placeholder="0"
                                                value={addInputs[stockItem.size] === 0 ? '' : addInputs[stockItem.size]} 
                                                onChange={(e) => setAddInputs({...addInputs, [stockItem.size]: Number(e.target.value)})}
                                            />
                                        </div>
                                    </td>

                                    {/* ผลลัพธ์ Real-time */}
                                    <td className="bg-success bg-opacity-10">
                                        <span className={`fs-5 fw-bold ${newTotal < 0 ? 'text-danger' : 'text-success'}`}>
                                            {newTotal}
                                        </span>
                                        {newTotal !== currentQty && (
                                            <small className="d-block text-muted" style={{fontSize: '0.7rem'}}>
                                                (เดิม {currentQty} {addQty >= 0 ? '+' : '-'} {Math.abs(addQty)})
                                            </small>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card.Body>
            
            {/* Summary Footer */}
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
                                <span className="fw-bold fs-3 text-success">{newGrandTotal.toLocaleString()}</span> 
                                <span className="text-muted small ms-1">ตัว</span>
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="text-end">
                         <Button 
                            size="lg" 
                            className="w-100 rounded-pill px-4 fw-bold shadow btn-gradient-primary"
                            onClick={handleSave}
                            disabled={saving}
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