'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Card, Table, Button, Form, InputGroup, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFilter, FaEdit, FaSearch, FaBoxOpen, FaTag } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}?admin=true`); 
      const data = await res.json();
      setProducts(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleToggleActive = async (product: any) => {
    try {
        const updatedProducts = products.map(p => 
            p._id === product._id ? { ...p, isActive: !p.isActive } : p
        );
        setProducts(updatedProducts);

        await fetch(`${API_ENDPOINTS.PRODUCTS}/${product._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(session as any)?.accessToken}`
            },
            body: JSON.stringify({ isActive: !product.isActive })
        });
    } catch (error) { 
        alert('Error updating status'); 
        fetchProducts(); 
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm('ยืนยันการลบสินค้านี้ถาวร?')) return;
      try {
          await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, { 
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${(session as any)?.accessToken}`
              }
          });
          fetchProducts();
      } catch (error) { alert('Error'); }
  };

  const uniqueTypes = Array.from(new Set(products.map(p => p.type)));
  
  const filteredProducts = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p._id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || p.type === filterType;
      return matchesSearch && matchesType;
  });

  return (
    <Container fluid className="px-4 py-4">
        
        {/* Header Section */}
        <Row className="align-items-center mb-4 gy-3">
            <Col md={4}>
                <h4 className="fw-bold text-dark mb-0">ข้อมูลสินค้า</h4>
                <small className="text-muted">จัดการรายการสินค้าทั้งหมดในระบบ</small>
            </Col>

            <Col md={8}>
                <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                    {/* Search */}
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border" style={{maxWidth: '320px', width: '100%'}}>
                        <InputGroup.Text className="bg-white border-0 ps-3"><FaSearch className="text-muted"/></InputGroup.Text>
                        <Form.Control 
                            placeholder="ค้นหาชื่อ / รหัส..." 
                            className="border-0 ps-2 py-2 shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>

                    {/* Filter */}
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden border" style={{maxWidth: '220px'}}>
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

                    {/* Add Button */}
                    <Link href="/admin/products/create">
                        <Button className="btn-gradient-primary rounded-pill px-4 fw-bold shadow hover-scale d-flex align-items-center gap-2 h-100">
                            <FaPlus/> <span className="d-none d-sm-inline">เพิ่มสินค้า</span>
                        </Button>
                    </Link>
                </div>
            </Col>
        </Row>

        {/* Products Table Card */}
        <Card className="shadow border-status-primary rounded-4 overflow-hidden">
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle" style={{minWidth: '900px'}}>
                    <thead className="bg-light text-secondary">
                        <tr style={{height: '60px', fontSize: '0.95rem'}}>
                            <th className="text-center" style={{width: '35%'}}>สินค้า</th>
                            <th className="text-center" style={{width: '15%'}}>ประเภท</th>
                            <th className="text-center" style={{width: '15%'}}>ราคา</th>
                            <th className="text-center" style={{width: '15%'}}>สถานะขาย</th>
                            <th className="text-center" style={{width: '20%'}}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-5"><Spinner animation="border" variant="primary"/></td></tr>
                        ) : filteredProducts.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-5 text-muted">ไม่พบข้อมูลสินค้า</td></tr>
                        ) : (
                            filteredProducts.map(product => (
                                <tr key={product._id} 
                                    className={`border-bottom transition-all ${!product.isActive ? 'bg-light' : 'bg-white'}`}
                                    style={{ borderLeft: product.isActive ? '5px solid #10b981' : '5px solid #cbd5e1' }}
                                >
                                    <td className="py-4 text-start ps-5">
                                        <div className={`d-flex align-items-center ${!product.isActive ? 'opacity-50' : ''}`}>
                                            <div className={`position-relative rounded-3 overflow-hidden border flex-shrink-0 me-3 shadow-sm ${!product.isActive && 'grayscale'}`} style={{width: 50, height: 50}}>
                                                {product.imageUrl ? (
                                                    <Image src={product.imageUrl} alt={product.name} fill style={{objectFit:'cover'}} />
                                                ) : (
                                                    <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center"><FaBoxOpen className="text-secondary"/></div>
                                                )}
                                            </div>
                                            <div style={{maxWidth: '300px'}}>
                                                <div className={`fw-bold text-truncate ${product.isActive ? 'text-dark' : 'text-secondary'}`} title={product.name}>{product.name}</div>
                                                <small className="text-muted font-monospace" style={{fontSize: '0.75rem'}}>
                                                    ID: {product._id}
                                                </small>
                                            </div>
                                        </div>
                                    </td>

                                    <td className={`text-center py-4 ${!product.isActive ? 'opacity-50' : ''}`}>
                                        <Badge bg="light" text="dark" className="border fw-normal px-3 py-2 rounded-pill text-capitalize shadow-sm">
                                            <FaTag className="me-1 text-secondary" size={10}/> {product.type}
                                        </Badge>
                                    </td>

                                    <td className={`text-center py-4 ${!product.isActive ? 'opacity-50' : ''}`}>
                                        <span className="fw-bold text-primary fs-5">฿{product.price.toLocaleString()}</span>
                                    </td>

                                    <td className="py-4">
                                        <div className="d-flex flex-column align-items-center justify-content-center gap-1">
                                            <div className="form-check form-switch switch-center">
                                                <input 
                                                    className="form-check-input cursor-pointer shadow-none" 
                                                    type="checkbox" 
                                                    role="switch" 
                                                    checked={product.isActive} 
                                                    onChange={() => handleToggleActive(product)}
                                                    style={{width: '2.8em', height: '1.5em'}}
                                                />
                                            </div>
                                            <small className={`fw-bold ${product.isActive ? 'text-success' : 'text-secondary'}`} style={{fontSize: '0.7rem', lineHeight: 1}}>
                                                {product.isActive ? 'Online' : 'Offline'}
                                            </small>
                                        </div>
                                    </td>

                                    <td className={`text-center py-4 ${!product.isActive ? 'opacity-75' : ''}`}>
                                        <div className="d-flex justify-content-center gap-2">
                                            <Link href={`/admin/products/edit/${product._id}`}>
                                                <Button variant="light" className="rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center hover-scale text-warning" style={{width: 38, height: 38}} title="แก้ไข">
                                                    <FaEdit size={16}/>
                                                </Button>
                                            </Link>
                                            <Button variant="light" className="rounded-circle shadow-sm border p-0 d-flex align-items-center justify-content-center hover-scale text-danger" style={{width: 38, height: 38}} onClick={() => handleDelete(product._id)} title="ลบ">
                                                <FaTrash size={16}/>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
            <Card.Footer className="bg-white border-top-0 py-3 text-center">
                <small className="text-muted">ทั้งหมด {filteredProducts.length} รายการ</small>
            </Card.Footer>
        </Card>
    </Container>
  );
}