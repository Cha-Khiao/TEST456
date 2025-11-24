'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Card, Row, Col, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaBoxOpen, FaArrowRight, FaSearch, FaFilter, FaLayerGroup } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

export default function StockListPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  const uniqueTypes = Array.from(new Set(products.map(p => p.type)));
  
  const filteredProducts = products.filter(product => {
      const matchName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || product.type === filterType;
      return matchName && matchType;
  });

  return (
    <Container fluid className="px-4 py-4">
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
                <h4 className="fw-bold text-dark mb-0">จัดการสต็อกสินค้า</h4>
                <p className="text-muted mb-0 small">เลือกสินค้าเพื่อตรวจสอบและอัปเดตจำนวนคงเหลือ</p>
            </div>
            
            {/* Search & Filter */}
            <div className="d-flex gap-2">
                <InputGroup className="shadow-sm rounded-pill overflow-hidden border bg-white" style={{maxWidth: '250px'}}>
                    <InputGroup.Text className="bg-white border-0 ps-3"><FaSearch className="text-muted"/></InputGroup.Text>
                    <Form.Control 
                        placeholder="ค้นหาชื่อสินค้า..." 
                        className="border-0 ps-2 shadow-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <InputGroup className="shadow-sm rounded-pill overflow-hidden border bg-white" style={{maxWidth: '180px'}}>
                    <InputGroup.Text className="bg-white border-0 ps-3"><FaFilter className="text-muted"/></InputGroup.Text>
                    <Form.Select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)} 
                        className="bg-white border-0 shadow-none text-dark fw-bold cursor-pointer"
                    >
                        <option value="all">ทุกประเภท</option>
                        {uniqueTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </Form.Select>
                </InputGroup>
            </div>
        </div>
        
        {loading ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>
        ) : (
            <Row className="g-3">
                {filteredProducts.length === 0 ? (
                    <Col xs={12}>
                        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                            <FaBoxOpen size={40} className="text-muted opacity-25 mb-3"/>
                            <p className="text-muted">ไม่พบสินค้าที่ค้นหา</p>
                        </div>
                    </Col>
                ) : (
                    filteredProducts.map(product => {
                        const totalStock = product.stock.reduce((sum:number, s:any) => sum + s.quantity, 0);
                        return (
                            <Col md={6} xl={4} key={product._id}>
                                <Link href={`/admin/stock/${product._id}`} className="text-decoration-none group">
                                    {/* Card */}
                                    <Card className="shadow-sm h-100 rounded-4 overflow-hidden hover-card-up border-status-warning cursor-pointer transition-all">
                                        <Card.Body className="d-flex align-items-center p-3">
                                            
                                            {/* Image */}
                                            <div className="position-relative rounded-3 overflow-hidden border me-3 flex-shrink-0 shadow-sm" style={{width: 70, height: 70}}>
                                                {product.imageUrl ? (
                                                    <Image src={product.imageUrl} alt={product.name} fill style={{objectFit:'cover'}} />
                                                ) : (
                                                    <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center"><FaBoxOpen className="text-secondary"/></div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-grow-1 overflow-hidden">
                                                <h6 className="fw-bold mb-1 text-dark text-truncate">{product.name}</h6>
                                                <div className="d-flex align-items-center gap-2">
                                                    <Badge bg="light" text="dark" className="border fw-normal px-2 py-1 rounded-pill">{product.type}</Badge>
                                                    
                                                    {/* Stock Badge */}
                                                    <span className={`small fw-bold ${totalStock > 0 ? 'text-success bg-success' : 'text-danger bg-danger'} bg-opacity-10 px-2 py-1 rounded-pill border border-opacity-25`}>
                                                        <FaLayerGroup className="me-1"/> {totalStock} ตัว
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Arrow Button */}
                                            <div className="ms-2">
                                                <div className="btn-gradient-warning rounded-circle p-0 d-flex align-items-center justify-content-center text-white shadow hover-scale transition-all" 
                                                     style={{width: 40, height: 40}}>
                                                    <FaArrowRight />
                                                </div>
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