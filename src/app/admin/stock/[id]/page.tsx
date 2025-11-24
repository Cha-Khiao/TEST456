'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Container, Card, Button, Row, Col, Spinner, Table, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaSave, FaBox, FaTag, FaInfoCircle, FaHashtag, FaChartLine, FaMinus, FaPlus } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const ALL_SIZES = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];

export default function ManageStockDetailPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  
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

  const updateStockAmount = (size: string, delta: number) => {
      const currentAdd = addInputs[size] || 0;
      const newAdd = currentAdd + delta;

      const stockItem = product.stock.find((s: any) => s.size === size);
      const currentQty = stockItem ? stockItem.quantity : 0;
      const potentialNewTotal = currentQty + newAdd;

      if (potentialNewTotal < 0) return;

      setAddInputs({ ...addInputs, [size]: newAdd });
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          for (const size of ALL_SIZES) {
              const addAmount = addInputs[size] || 0;
              
              if (addAmount !== 0) {
                  const stockItem = product.stock.find((s: any) => s.size === size);
                  const currentQty = stockItem ? stockItem.quantity : 0;
                  const newTotal = currentQty + addAmount;

                  if (newTotal < 0) {
                      alert(`ไม่สามารถบันทึกได้: ไซส์ ${size} จะเหลือต่ำกว่า 0 (${newTotal})`);
                      setSaving(false);
                      return;
                  }

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

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><Spinner animation="border" variant="primary"/></div>;
  if (!product) return <div className="text-center py-5">ไม่พบสินค้า</div>;

  const currentTotalStock = product.stock.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  let totalAddedAmount = 0;
  ALL_SIZES.forEach(size => {
      totalAddedAmount += (addInputs[size] || 0);
  });
  
  const newGrandTotal = currentTotalStock + totalAddedAmount;

  return (
    <Container fluid className="px-4 py-4">
        
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-3">
                <Button 
                    className="rounded-circle shadow border-0 p-0 d-flex align-items-center justify-content-center hover-scale text-white" 
                    style={{width: 45, height: 45, background: 'linear-gradient(135deg, #f59e0b, #d97706)'}} 
                    onClick={() => router.back()}
                >
                    <FaArrowLeft size={18}/>
                </Button>
                <div>
                    <h4 className="fw-bold text-dark mb-0">จัดการสต็อกสินค้า</h4>
                    <small className="text-muted">ปรับปรุงจำนวนสินค้าคงคลัง</small>
                </div>
            </div>
        </div>

        {/* Product Info Card */}
        <Card className="border-status-warning shadow rounded-4 overflow-hidden mb-4">
            <Card.Body className="p-4">
                <div className="d-flex flex-column flex-md-row align-items-start gap-4">
                    <div className="position-relative rounded-4 overflow-hidden border flex-shrink-0 shadow-sm bg-white p-1" style={{width: 120, height: 120}}>
                        <div className="position-relative w-100 h-100 rounded-3 overflow-hidden">
                            <Image src={product.imageUrl} alt={product.name} fill style={{objectFit:'cover'}} />
                        </div>
                    </div>
                    
                    <div className="flex-grow-1 w-100">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-2">
                            <div>
                                <h5 className="fw-bold text-primary mb-1">{product.name}</h5>
                                <small className="text-muted d-flex align-items-center gap-2 font-monospace" style={{fontSize: '0.8rem'}}>
                                    <FaHashtag size={10}/> {product._id}
                                </small>
                            </div>
                            <Badge bg={currentTotalStock > 0 ? 'success' : 'danger'} className="px-3 py-2 shadow-sm mt-2 mt-md-0 rounded-pill fw-normal">
                                <FaBox className="me-2"/> รวมปัจจุบัน {currentTotalStock.toLocaleString()} ตัว
                            </Badge>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-3">
                            <div className="px-3 py-1 bg-light rounded-3 border d-flex align-items-center gap-2">
                                <FaTag className="text-secondary" size={12}/>
                                <span className="fw-bold text-dark small">{product.type}</span>
                            </div>
                            <div className="px-3 py-1 bg-light rounded-3 border d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark small">฿{product.price.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <p className="mb-0 text-secondary small text-break" style={{whiteSpace: 'pre-wrap'}}>{product.description || '-'}</p>
                    </div>
                </div>
            </Card.Body>
        </Card>

        {/* Stock Calculator Table */}
        <Card className="border-status-warning shadow rounded-4 overflow-hidden">
            <div className="card-header bg-warning bg-opacity-10 border-bottom-0 p-3 text-center">
                 <h6 className="fw-bold text-dark mb-0 d-flex align-items-center justify-content-center gap-2">
                     <FaChartLine className="text-warning"/> ตารางคำนวณสต็อก
                 </h6>
                 <small className="text-muted" style={{fontSize: '0.75rem'}}>กดปุ่ม <b>+</b> หรือ <b>-</b> เพื่อปรับปรุงจำนวนคงเหลือ</small>
            </div>
            
            <Card.Body className="p-0">
                <div className="table-responsive">
                    <Table hover size="sm" className="align-middle mb-0" style={{minWidth: '600px'}}>
                        <thead className="bg-light text-secondary text-uppercase small letter-spacing-1">
                            <tr className="text-center" style={{fontSize: '0.8rem'}}>
                                <th className="py-2" style={{width: '15%'}}>ขนาด (Size)</th>
                                <th className="py-2" style={{width: '20%'}}>จำนวนเดิม</th>
                                <th className="py-2 text-primary" style={{width: '30%'}}>เพิ่ม/ลด</th>
                                <th className="py-2 bg-success bg-opacity-10 fw-bold text-success" style={{width: '35%'}}>ยอดรวมใหม่</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ALL_SIZES.map((size) => {
                                const stockItem = product.stock.find((s: any) => s.size === size);
                                const currentQty = stockItem ? stockItem.quantity : 0;
                                const hasRecord = !!stockItem;

                                const addQty = addInputs[size] || 0;
                                const newTotal = currentQty + addQty;
                                const isNegative = newTotal < 0;

                                return (
                                    <tr key={size} className="text-center border-bottom">
                                        <td className="fw-bold text-dark py-2">{size}</td>
                                        
                                        <td className="py-2">
                                            {hasRecord ? (
                                                <span className="badge bg-secondary bg-opacity-10 text-dark border px-2 rounded-pill">{currentQty}</span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>

                                        <td className="py-2">
                                            <div className="d-flex justify-content-center align-items-center gap-2 bg-white rounded-pill shadow-sm p-1 border mx-auto" style={{width: 'fit-content'}}>
                                                <Button 
                                                    variant="link" 
                                                    className={`text-decoration-none p-0 rounded-circle hover-bg-gray d-flex align-items-center justify-content-center ${newTotal <= 0 ? 'text-muted cursor-not-allowed opacity-50' : 'text-danger'}`}
                                                    style={{width: 24, height: 24}}
                                                    onClick={() => newTotal > 0 && updateStockAmount(size, -1)}
                                                    disabled={newTotal <= 0}
                                                >
                                                    <FaMinus size={10}/>
                                                </Button>
                                                
                                                <div className={`fw-bold text-center ${addQty > 0 ? 'text-success' : (addQty < 0 ? 'text-danger' : 'text-dark')}`} style={{minWidth: '30px', fontSize: '0.9rem'}}>
                                                     {addQty > 0 ? '+' : ''}{addQty}
                                                </div>

                                                <Button 
                                                    variant="link" 
                                                    className="text-decoration-none text-success p-0 rounded-circle hover-bg-gray d-flex align-items-center justify-content-center"
                                                    style={{width: 24, height: 24}}
                                                    onClick={() => updateStockAmount(size, 1)}
                                                >
                                                    <FaPlus size={10}/>
                                                </Button>
                                            </div>
                                        </td>

                                        <td className={`py-2 ${isNegative ? "bg-danger bg-opacity-10" : "bg-success bg-opacity-10"}`}>
                                            <span className={`fw-bold ${isNegative ? 'text-danger' : 'text-success'}`}>
                                                {newTotal}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
            
            <div className="card-footer bg-white p-4 border-top shadow-sm">
                 <Row className="align-items-center g-3">
                    <Col md={8}>
                        <div className="d-flex flex-column flex-md-row gap-3 gap-md-4 p-3 bg-light rounded-4 border justify-content-around text-center">
                            <div className="flex-fill">
                                <small className="text-muted d-block text-uppercase letter-spacing-1" style={{fontSize:'0.7rem'}}>ยอดรวมเดิม</small>
                                <span className="fw-bold fs-5">{currentTotalStock.toLocaleString()}</span>
                            </div>
                            <div className="d-none d-md-block border-start"></div>
                            <div className="flex-fill">
                                <small className="text-muted d-block text-uppercase letter-spacing-1" style={{fontSize:'0.7rem'}}>เปลี่ยนแปลงสุทธิ</small>
                                <span className={`fw-bold fs-5 ${totalAddedAmount > 0 ? 'text-success' : (totalAddedAmount < 0 ? 'text-danger' : 'text-dark')}`}>
                                    {totalAddedAmount > 0 ? '+' : ''}{totalAddedAmount.toLocaleString()}
                                </span>
                            </div>
                            <div className="d-none d-md-block border-start"></div>
                            <div className="flex-fill">
                                <small className="text-success fw-bold d-block text-uppercase letter-spacing-1" style={{fontSize:'0.7rem'}}>ยอดรวมใหม่</small>
                                <span className={`fw-bold fs-4 ${newGrandTotal < 0 ? 'text-danger' : 'text-success'}`}>
                                    {newGrandTotal.toLocaleString()}
                                </span> 
                                <span className="text-muted small ms-1">ตัว</span>
                            </div>
                        </div>
                    </Col>
                    <Col md={4} className="text-end">
                         <Button 
                            size="lg" 
                            className="w-100 rounded-pill px-4 fw-bold shadow-lg btn-gradient-primary border-0"
                            onClick={handleSave}
                            disabled={saving || newGrandTotal < 0 || totalAddedAmount === 0}
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