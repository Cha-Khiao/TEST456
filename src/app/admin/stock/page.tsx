// src/app/admin/stock/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Card, Row, Col, Badge, Button, Form, InputGroup } from 'react-bootstrap';
import { FaBoxOpen, FaArrowRight, FaSearch, FaFilter } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

export default function StockListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ เพิ่ม State สำหรับค้นหาและกรอง
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_ENDPOINTS.PRODUCTS}?admin=true`);
            const data = await res.json();
            setProducts(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  // ✅ Logic การกรองและค้นหา
  const uniqueTypes = Array.from(new Set(products.map(p => p.type)));
  
  const filteredProducts = products.filter(product => {
      const matchName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || product.type === filterType;
      return matchName && matchType;
  });

  return (
    <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
                <h2 className="fw-bold text-dark mb-1">จัดการสต็อกสินค้า</h2>
                <p className="text-muted mb-0">เลือกสินค้าเพื่ออัปเดตจำนวนคงเหลือ</p>
            </div>
            
            {/* ✅ Search & Filter Controls */}
            <div className="d-flex gap-2">
                <InputGroup>
                    <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted"/></InputGroup.Text>
                    <Form.Control 
                        placeholder="ค้นหาชื่อสินค้า..." 
                        className="border-start-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <InputGroup style={{maxWidth: '180px'}}>
                    <InputGroup.Text className="bg-white"><FaFilter/></InputGroup.Text>
                    <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-white">
                        <option value="all">ทุกประเภท</option>
                        {uniqueTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </Form.Select>
                </InputGroup>
            </div>
        </div>
        
        {loading ? <div className="text-center py-5">Loading...</div> : (
            <Row className="g-3">
                {filteredProducts.length === 0 ? (
                    <Col xs={12} className="text-center py-5 text-muted">
                        ไม่พบสินค้าที่ค้นหา
                    </Col>
                ) : (
                    filteredProducts.map(product => {
                        const totalStock = product.stock.reduce((sum:number, s:any) => sum + s.quantity, 0);
                        return (
                            <Col md={6} xl={4} key={product._id}>
                                {/* ใช้ Link ครอบ Card ทั้งใบเพื่อให้กดง่ายขึ้น */}
                                <Link href={`/admin/stock/${product._id}`} className="text-decoration-none">
                                    <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden hover-lift cursor-pointer">
                                        <Card.Body className="d-flex align-items-center p-3">
                                            <div className="position-relative rounded-3 overflow-hidden border me-3 flex-shrink-0" style={{width: 80, height: 80}}>
                                                <Image src={product.imageUrl} alt={product.name} fill style={{objectFit:'cover'}} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="fw-bold mb-1 text-dark text-truncate">{product.name}</h6>
                                                <div className="d-flex gap-2 mb-2 align-items-center">
                                                    <Badge bg="light" text="dark" className="border fw-normal">{product.type}</Badge>
                                                    <span className={`small fw-bold ${totalStock > 0 ? 'text-success' : 'text-danger'}`}>
                                                        {totalStock} ตัว
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-light rounded-circle p-2 text-primary">
                                                <FaArrowRight />
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        )
                    })
                )}
            </Row>
        )}
    </Container>
  );
}