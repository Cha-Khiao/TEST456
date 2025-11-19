// src/app/admin/products/page.tsx
'use client';

import { useSession } from "next-auth/react"; // ✅ 1. Import Session
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container, Card, Table, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFilter, FaEdit, FaSearch } from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

export default function AdminProductsPage() {
  const { data: session } = useSession(); // ✅ 2. เรียกใช้ Session
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  
  // State สำหรับค้นหา
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      // GET สินค้า (public) ไม่ต้องใช้ Token ก็ได้ (ตาม config backend)
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}?admin=true`); 
      const data = await res.json();
      setProducts(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleToggleActive = async (product: any) => {
    if (!confirm(`ยืนยันการเปลี่ยนสถานะ?`)) return;
    try {
        await fetch(`${API_ENDPOINTS.PRODUCTS}/${product._id}`, {
            method: 'PUT',
            // ✅ 3. แนบ Token (PUT ต้องใช้สิทธิ์ Admin)
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(session as any)?.accessToken}`
            },
            body: JSON.stringify({ isActive: !product.isActive })
        });
        fetchProducts();
    } catch (error) { alert('Error'); }
  };

  const handleDelete = async (id: string) => {
      if(!confirm('ยืนยันการลบสินค้านี้ถาวร?')) return;
      try {
          await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, { 
              method: 'DELETE',
              // ✅ 4. แนบ Token (DELETE ต้องใช้สิทธิ์ Admin)
              headers: {
                  'Authorization': `Bearer ${(session as any)?.accessToken}`
              }
          });
          fetchProducts();
      } catch (error) { alert('Error'); }
  };

  const uniqueTypes = Array.from(new Set(products.map(p => p.type)));
  
  // Logic กรอง (ชื่อ + ประเภท)
  const filteredProducts = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p._id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || p.type === filterType;
      return matchesSearch && matchesType;
  });

  return (
    <Container>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div><h2 className="fw-bold text-dark mb-1">ข้อมูลสินค้า</h2><p className="text-muted mb-0">เพิ่ม/ลบ/แก้ไข รายละเอียดสินค้า</p></div>
            
            <div className="d-flex gap-2 flex-wrap">
                {/* Search Box */}
                <InputGroup style={{maxWidth: '250px'}}>
                    <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted"/></InputGroup.Text>
                    <Form.Control 
                        placeholder="ค้นหาชื่อสินค้า..." 
                        className="border-start-0 ps-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <InputGroup style={{maxWidth: '180px'}}>
                    <InputGroup.Text className="bg-white"><FaFilter/></InputGroup.Text>
                    <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-white">
                        <option value="all">ทั้งหมด</option>
                        {uniqueTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </Form.Select>
                </InputGroup>

                <Link href="/admin/products/create">
                    <Button className="btn-gradient-primary rounded-pill px-4 fw-bold shadow"><FaPlus className="me-2"/> เพิ่มสินค้า</Button>
                </Link>
            </div>
        </div>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Table hover className="mb-0 align-middle" responsive>
                <thead className="bg-light">
                    <tr>
                        <th className="ps-4 py-3">รูปภาพ</th>
                        <th>ชื่อสินค้า / รหัส</th>
                        <th>ประเภท</th>
                        <th>ราคา</th>
                        <th>สถานะขาย</th>
                        <th className="text-end pe-4">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (<tr><td colSpan={6} className="text-center py-5">Loading...</td></tr>) : 
                     filteredProducts.length === 0 ? (<tr><td colSpan={6} className="text-center py-5 text-muted">ไม่พบสินค้า</td></tr>) :
                     filteredProducts.map(product => (
                        <tr key={product._id} className={!product.isActive ? 'opacity-50' : ''}>
                            <td className="ps-4 py-3"><div className="position-relative rounded-3 overflow-hidden border bg-light" style={{width: 50, height: 50}}><Image src={product.imageUrl} alt={product.name} fill style={{objectFit:'cover'}} /></div></td>
                            <td>
                                <div className="fw-bold text-dark">{product.name}</div>
                                <small className="text-muted" style={{fontSize: '0.7rem'}}>ID: {product._id}</small>
                            </td>
                            <td><Badge bg="light" text="dark" className="border">{product.type}</Badge></td>
                            <td className="fw-bold">฿{product.price}</td>
                            <td><Form.Check type="switch" checked={product.isActive} onChange={() => handleToggleActive(product)} /></td>
                            <td className="text-end pe-4">
                                <Link href={`/admin/products/edit/${product._id}`}>
                                    <Button size="sm" variant="outline-warning" className="me-2 rounded-pill text-dark"><FaEdit /> แก้ไข</Button>
                                </Link>
                                <Button size="sm" variant="outline-danger" className="rounded-pill" onClick={() => handleDelete(product._id)}><FaTrash /></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    </Container>
  );
}