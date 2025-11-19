// src/app/admin/orders/page.tsx
'use client';

import { useSession } from "next-auth/react"; // ✅ 1. Import Session
import { useState, useEffect } from 'react';
import Link from 'next/link'; 
import Image from 'next/image';
import { Container, Card, Table, Badge, Button, Nav, Modal, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { 
  FaBoxOpen, FaCheckCircle, FaClock, FaSearch, FaTruck, FaTimesCircle, 
  FaEdit, FaFileInvoiceDollar
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const statusMap: any = {
  'pending_payment': { label: 'รอชำระเงิน', color: 'warning', icon: FaClock },
  'verification': { label: 'รอตรวจสอบสลิป', color: 'info', icon: FaSearch },
  'shipping': { label: 'กำลังจัดส่ง', color: 'primary', icon: FaTruck },
  'completed': { label: 'สำเร็จ', color: 'success', icon: FaCheckCircle },
  'cancelled': { label: 'ยกเลิก', color: 'secondary', icon: FaTimesCircle },
};

export default function AdminOrdersPage() {
  const { data: session } = useSession(); // ✅ 2. เรียกใช้ Session
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // State สำหรับค้นหา
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (session) { // รอ session พร้อมก่อนค่อย fetch
        fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      // ✅ 3. แนบ Token (GET Orders ต้องเป็น Admin/User เท่านั้น)
      const res = await fetch(API_ENDPOINTS.ORDERS, {
          headers: {
             'Authorization': `Bearer ${(session as any)?.accessToken}`
          }
      }); 
      
      if (!res.ok) throw new Error("Unauthorized or Failed");
      
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
        const res = await fetch(`${API_ENDPOINTS.ORDERS}/${selectedOrder._id}/status`, {
            method: 'PATCH',
            // ✅ 4. แนบ Token (PATCH Status ต้องเป็น Admin)
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(session as any)?.accessToken}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error('Failed');
        
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        setSelectedOrder(updatedOrder);
        
        if (['shipping', 'completed'].includes(newStatus)) setShowModal(false);
    } catch (error) {
        alert('Error updating status');
    } finally {
        setUpdating(false);
    }
  };

  // Logic การกรองข้อมูล (รวม Tab และ Search)
  const filteredOrders = orders.filter(o => {
      // 1. กรองตาม Tab
      let statusMatch = true;
      if (activeTab === 'action_needed') statusMatch = ['verification'].includes(o.status);
      else if (activeTab === 'shipping') statusMatch = ['shipping'].includes(o.status);
      else if (activeTab !== 'all') statusMatch = o.status === activeTab;

      // 2. กรองตามคำค้นหา (ชื่อ, เบอร์, รหัสออร์เดอร์)
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = 
          o.customerName.toLowerCase().includes(searchLower) || 
          o.phone.includes(searchTerm) ||
          o._id.toLowerCase().includes(searchLower);

      return statusMatch && searchMatch;
  });

  return (
    <Container>
         {/* Stats Cards */}
         <Row className="g-3 mb-4">
            <Col md={4}>
                <Card className="border-0 shadow-sm h-100 bg-white border-start border-4 border-primary">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <div><h3 className="fw-bold mb-0">{orders.length}</h3><small className="text-muted">คำสั่งซื้อทั้งหมด</small></div>
                        <FaBoxOpen size={30} className="text-primary opacity-25"/>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="border-0 shadow-sm h-100 bg-white border-start border-4 border-warning">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <div><h3 className="fw-bold mb-0">{orders.filter(o => o.status === 'verification').length}</h3><small className="text-muted">รอตรวจสอบสลิป</small></div>
                        <FaSearch size={30} className="text-warning opacity-25"/>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="border-0 shadow-sm h-100 bg-white border-start border-4 border-success">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                        <div><h3 className="fw-bold mb-0">฿{orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.totalPrice : sum, 0).toLocaleString()}</h3><small className="text-muted">ยอดขายรวม</small></div>
                        <FaFileInvoiceDollar size={30} className="text-success opacity-25"/>
                    </Card.Body>
                </Card>
            </Col>
         </Row>

         {/* Orders Table & Search */}
         <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-white border-bottom-0 pt-4 px-4 pb-0">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <Nav variant="tabs" className="border-bottom-0 gap-2">
                        <Nav.Item><Nav.Link active={activeTab === 'all'} onClick={() => setActiveTab('all')} className="text-dark fw-bold">ทั้งหมด <Badge bg="secondary" pill>{orders.length}</Badge></Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link active={activeTab === 'action_needed'} onClick={() => setActiveTab('action_needed')} className={activeTab === 'action_needed' ? 'text-info fw-bold' : 'text-secondary'}>⏳ ตรวจสลิป <Badge bg="info" text="dark" pill>{orders.filter(o => o.status === 'verification').length}</Badge></Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')} className={activeTab === 'shipping' ? 'text-primary fw-bold' : 'text-secondary'}>🚚 ต้องจัดส่ง <Badge bg="primary" pill>{orders.filter(o => o.status === 'shipping').length}</Badge></Nav.Link></Nav.Item>
                    </Nav>
                    
                    {/* Search Box */}
                    <InputGroup style={{maxWidth: '300px'}}>
                        <InputGroup.Text className="bg-white border-end-0"><FaSearch className="text-muted"/></InputGroup.Text>
                        <Form.Control 
                            placeholder="ค้นหา ชื่อ / เบอร์ / รหัส..." 
                            className="border-start-0 ps-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
            </Card.Header>
            
            <Card.Body className="p-0">
                <div className="table-responsive">
                    <Table hover className="align-middle mb-0" style={{minWidth: '900px'}}>
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="ps-4 py-3">Order ID</th>
                                <th>ลูกค้า</th>
                                <th>สินค้า</th>
                                <th>ยอดเงิน</th>
                                <th>สลิป</th>
                                <th>สถานะ</th>
                                <th className="text-end pe-4">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (<tr><td colSpan={7} className="text-center py-5">Loading...</td></tr>) : 
                             filteredOrders.length === 0 ? (<tr><td colSpan={7} className="text-center py-5 text-muted">ไม่พบข้อมูลคำสั่งซื้อ</td></tr>) :
                             filteredOrders.map(order => (
                                <tr key={order._id}>
                                    <td className="ps-4">
                                        <span className="fw-bold text-primary d-block">#{order._id.slice(-6).toUpperCase()}</span>
                                        <small className="text-muted" style={{fontSize: '0.65rem'}}>{order._id}</small>
                                    </td>
                                    <td>
                                        <div className="fw-bold">{order.customerName}</div>
                                        <small className="text-muted"><i className="fas fa-phone-alt"></i> {order.phone}</small>
                                    </td>
                                    <td><small>{order.items.length} รายการ</small></td>
                                    <td className="fw-bold">฿{order.totalPrice.toLocaleString()}</td>
                                    <td>{order.paymentProofUrl ? <Badge bg="success">มีสลิป</Badge> : <Badge bg="secondary" className="opacity-50">รอโอน</Badge>}</td>
                                    <td><Badge bg={statusMap[order.status]?.color || 'secondary'}>{statusMap[order.status]?.label}</Badge></td>
                                    <td className="text-end pe-4">
                                        <Button size="sm" variant="outline-dark" className="rounded-pill px-3" onClick={() => { setSelectedOrder(order); setShowModal(true); }}>
                                            <FaEdit className="me-1"/> จัดการ
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
         </Card>

        {/* Management Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
            <Modal.Header closeButton><Modal.Title>จัดการคำสั่งซื้อ #{selectedOrder?._id.slice(-6).toUpperCase()}</Modal.Title></Modal.Header>
            <Modal.Body className="bg-light">
                {selectedOrder && (
                    <Row className="g-4">
                        <Col md={6}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white fw-bold">หลักฐานการโอนเงิน</Card.Header>
                                <Card.Body className="text-center d-flex align-items-center justify-content-center bg-dark bg-opacity-10" style={{minHeight: '300px'}}>
                                    {selectedOrder.paymentProofUrl ? (
                                        <div className="position-relative w-100" style={{height: '400px'}}>
                                            <Image src={selectedOrder.paymentProofUrl} alt="Slip" fill style={{objectFit: 'contain'}} className="rounded"/>
                                        </div>
                                    ) : <div className="text-muted"><FaFileInvoiceDollar size={40} className="mb-2 opacity-50"/><p>ไม่มีสลิป</p></div>}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="border-0 shadow-sm mb-3">
                                <Card.Body>
                                    <h6 className="fw-bold">ข้อมูลจัดส่ง</h6>
                                    <p className="mb-1"><span className="text-muted">ชื่อ:</span> {selectedOrder.customerName}</p>
                                    <p className="mb-1"><span className="text-muted">โทร:</span> {selectedOrder.phone}</p>
                                    <p className="mb-0 bg-light p-2 rounded small border">{selectedOrder.address || 'รับเอง'}</p>
                                </Card.Body>
                            </Card>
                            <Card className="border-0 shadow-sm">
                                <Card.Body>
                                    <h6 className="fw-bold mb-3">อัปเดตสถานะ</h6>
                                    <div className="d-grid gap-2">
                                        {selectedOrder.status === 'verification' && (
                                            <>
                                                <Button variant="success" onClick={() => handleUpdateStatus('shipping')} disabled={updating}><FaCheckCircle className="me-2"/> สลิปถูกต้อง (เริ่มจัดส่ง)</Button>
                                                <Button variant="outline-danger" onClick={() => handleUpdateStatus('pending_payment')} disabled={updating}><FaTimesCircle className="me-2"/> สลิปไม่ผ่าน (ให้โอนใหม่)</Button>
                                            </>
                                        )}
                                        {selectedOrder.status === 'shipping' && (
                                            <Button variant="primary" onClick={() => handleUpdateStatus('completed')} disabled={updating}><FaTruck className="me-2"/> จัดส่งสำเร็จ (ปิดงาน)</Button>
                                        )}
                                        <hr/>
                                        <Form.Select size="sm" value={selectedOrder.status} onChange={(e) => handleUpdateStatus(e.target.value)} disabled={updating}>
                                            <option value="pending_payment">รอชำระเงิน</option>
                                            <option value="verification">รอตรวจสอบ</option>
                                            <option value="shipping">กำลังจัดส่ง</option>
                                            <option value="completed">สำเร็จ</option>
                                            <option value="cancelled">ยกเลิก</option>
                                        </Form.Select>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}
            </Modal.Body>
        </Modal>
    </Container>
  );
}