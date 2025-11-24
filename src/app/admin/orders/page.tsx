'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import Link from 'next/link'; 
import Image from 'next/image';
import { Container, Card, Table, Badge, Button, Nav, Modal, Row, Col, Form, InputGroup, Spinner } from 'react-bootstrap';
import { 
  FaBoxOpen, FaCheckCircle, FaClock, FaSearch, FaTruck, FaTimesCircle, 
  FaEdit, FaFileInvoiceDollar, FaMoneyBillWave, FaUser, FaMapMarkerAlt, FaPhone
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const statusMap: any = {
  'pending_payment': { label: 'รอชำระเงิน', badgeClass: 'badge-status-warning', icon: FaClock, borderClass: 'border-status-warning', color: '#f59e0b' },
  'verification':    { label: 'รอตรวจสอบ', badgeClass: 'badge-status-info', icon: FaSearch, borderClass: 'border-status-info', color: '#0ea5e9' },
  'shipping':        { label: 'กำลังจัดส่ง', badgeClass: 'badge-status-primary', icon: FaTruck, borderClass: 'border-status-primary', color: '#4F46E5' },
  'completed':       { label: 'สำเร็จ', badgeClass: 'badge-status-success', icon: FaCheckCircle, borderClass: 'border-status-success', color: '#10b981' },
  'cancelled':       { label: 'ยกเลิก', badgeClass: 'badge-status-secondary', icon: FaTimesCircle, borderClass: 'border-status-secondary', color: '#6b7280' },
};

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (session) {
        fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.ORDERS, {
          headers: { 'Authorization': `Bearer ${(session as any)?.accessToken}` }
      }); 
      if (!res.ok) throw new Error("Failed");
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
        
        if (['shipping', 'completed', 'cancelled'].includes(newStatus)) setShowModal(false);
    } catch (error) {
        alert('Error updating status');
    } finally {
        setUpdating(false);
    }
  };

  // Logic Filter
  const filteredOrders = orders.filter(o => {
      let statusMatch = true;
      if (activeTab === 'action_needed') statusMatch = ['verification'].includes(o.status);
      else if (activeTab === 'shipping') statusMatch = ['shipping'].includes(o.status);
      else if (activeTab !== 'all') statusMatch = o.status === activeTab;

      const searchLower = searchTerm.toLowerCase();
      const searchMatch = 
          o.customerName.toLowerCase().includes(searchLower) || 
          o.phone.includes(searchTerm) ||
          o._id.toLowerCase().includes(searchLower);

      return statusMatch && searchMatch;
  });

  // Stats Calculation
  const totalRevenue = orders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.totalPrice : sum, 0);
  const pendingSlip = orders.filter(o => o.status === 'verification').length;

  return (
    <Container fluid className="px-4 py-4">
         
         <div className="d-flex justify-content-between align-items-center mb-4">
             <div>
                <h4 className="fw-bold text-dark mb-0">จัดการคำสั่งซื้อ</h4>
                <small className="text-muted">ภาพรวมและรายการสั่งซื้อทั้งหมด</small>
             </div>
             <Button variant="white" className="shadow-sm border rounded-pill px-4 fw-bold text-primary hover-scale" onClick={fetchOrders}>
                 รีเฟรชข้อมูล
             </Button>
         </div>

         {/* Stats Cards */}
         <Row className="g-4 mb-4">
            <Col md={4}>
                <Card className="h-100 shadow-sm border-status-primary hover-card-up rounded-4 overflow-hidden" style={{backgroundColor: '#ffffff'}}>
                    <Card.Body className="d-flex align-items-center p-4">
                        <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary me-3">
                            <FaBoxOpen size={24} />
                        </div>
                        <div>
                            <small className="text-secondary text-uppercase fw-bold letter-spacing-1">คำสั่งซื้อทั้งหมด</small>
                            <h2 className="fw-bold mb-0 text-dark">{orders.length}</h2>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="h-100 shadow-sm border-status-warning hover-card-up rounded-4 overflow-hidden" style={{backgroundColor: '#ffffff'}}>
                    <Card.Body className="d-flex align-items-center p-4">
                        <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning me-3">
                            <FaSearch size={24} />
                        </div>
                        <div>
                            <small className="text-secondary text-uppercase fw-bold letter-spacing-1">รอตรวจสอบสลิป</small>
                            <h2 className="fw-bold mb-0 text-dark">{pendingSlip}</h2>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card className="h-100 shadow-sm border-status-success hover-card-up rounded-4 overflow-hidden" style={{backgroundColor: '#ffffff'}}>
                    <Card.Body className="d-flex align-items-center p-4">
                        <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success me-3">
                            <FaMoneyBillWave size={24} />
                        </div>
                        <div>
                            <small className="text-secondary text-uppercase fw-bold letter-spacing-1">ยอดขายรวม</small>
                            <h2 className="fw-bold mb-0 text-dark">฿{totalRevenue.toLocaleString()}</h2>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
         </Row>

         {/* Orders Table Card */}
         <Card className="shadow-sm border-status-primary overflow-hidden rounded-4">
            <Card.Header className="bg-white border-bottom pt-4 px-4 pb-3">
                <Row className="g-3 align-items-center">
                    <Col lg={8}>
                        <Nav className="nav-pills-custom gap-2">
                            <Nav.Item><Nav.Link active={activeTab === 'all'} onClick={() => setActiveTab('all')}>ทั้งหมด</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link active={activeTab === 'action_needed'} onClick={() => setActiveTab('action_needed')}>⏳ ตรวจสลิป {pendingSlip > 0 && <Badge bg="danger" pill className="ms-1">{pendingSlip}</Badge>}</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link active={activeTab === 'shipping'} onClick={() => setActiveTab('shipping')}>🚚 ต้องส่ง</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>สำเร็จ</Nav.Link></Nav.Item>
                        </Nav>
                    </Col>
                    <Col lg={4}>
                        <InputGroup className="shadow-sm rounded-pill overflow-hidden border" style={{borderColor: '#e2e8f0'}}>
                            <InputGroup.Text className="bg-white border-0 ps-3"><FaSearch className="text-muted"/></InputGroup.Text>
                            <Form.Control 
                                placeholder="ค้นหาออร์เดอร์..." 
                                className="bg-white border-0 ps-2 py-2 shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                </Row>
            </Card.Header>
            
            <div className="table-responsive">
                <Table hover striped className="align-middle mb-0" style={{minWidth: '1000px'}}>
                    <thead className="bg-light text-secondary">
                        <tr className="text-center align-middle" style={{ height: '50px' }}>
                            <th className="py-3">Order Info</th>
                            <th>ลูกค้า</th>
                            <th>รายการสินค้า</th>
                            <th>ยอดรวม</th>
                            <th>หลักฐาน</th>
                            <th>สถานะ</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-5"><Spinner animation="border" variant="primary"/></td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-5 text-muted">ไม่พบรายการคำสั่งซื้อ</td></tr>
                        ) : (
                            filteredOrders.map(order => {
                                const statusInfo = statusMap[order.status] || statusMap['pending_payment'];
                                return (
                                    <tr key={order._id} className="text-center">
                                        
                                        {/* 1. Order Info */}
                                        <td>
                                            <div className="d-flex flex-column align-items-center">
                                                <span className="fw-bold text-primary font-monospace">#{order._id.slice(-6).toUpperCase()}</span>
                                                <small className="text-muted">{new Date(order.createdAt).toLocaleDateString('th-TH')}</small>
                                            </div>
                                        </td>

                                        {/* 2. ลูกค้า */}
                                        <td>
                                            <div className="d-flex flex-column align-items-center">
                                                <div className="fw-bold text-dark">{order.customerName}</div>
                                                <small className="text-muted d-flex align-items-center gap-1"><FaPhone size={10}/> {order.phone}</small>
                                            </div>
                                        </td>

                                        {/* 3. รายการสินค้า */}
                                        <td>
                                            <div className="d-flex flex-column align-items-center">
                                                <span className="badge bg-white text-dark border mb-1">{order.items.length} ชิ้น</span>
                                                <div className="d-flex gap-1 justify-content-center">
                                                    {order.items.slice(0, 3).map((item: any, i: number) => (
                                                        <div key={i} className="position-relative border rounded-1 overflow-hidden bg-white" style={{width: 28, height: 28}}>
                                                            {item.imageUrl && <Image src={item.imageUrl} alt="p" fill style={{objectFit: 'cover'}} />}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 3 && <span className="small text-muted">...</span>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* 4. ยอดรวม */}
                                        <td className="fw-bold text-dark">฿{order.totalPrice.toLocaleString()}</td>

                                        {/* 5. หลักฐาน */}
                                        <td>
                                            {order.paymentProofUrl ? 
                                                <Badge bg="success" className="bg-opacity-10 text-success border border-success fw-normal px-3 py-2 rounded-pill"><FaFileInvoiceDollar className="me-1"/> มีสลิป</Badge> : 
                                                <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary fw-normal px-3 py-2 rounded-pill"><FaClock className="me-1"/> รอโอน</Badge>
                                            }
                                        </td>

                                        {/* 6. สถานะ */}
                                        <td>
                                            <span className={`badge ${statusInfo.badgeClass} px-3 py-2 rounded-pill d-inline-flex align-items-center`}>
                                                <statusInfo.icon className="me-1"/> {statusInfo.label}
                                            </span>
                                        </td>

                                        {/* 7. Action */}
                                        <td>
                                            <Button variant="light" size="sm" className="rounded-pill px-3 border hover-scale text-primary fw-bold shadow-sm" onClick={() => { setSelectedOrder(order); setShowModal(true); }}>
                                                <FaEdit className="me-1"/> จัดการ
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </div>
            <Card.Footer className="bg-white border-top-0 py-3 text-center">
                <small className="text-muted">แสดงข้อมูล {filteredOrders.length} รายการล่าสุด</small>
            </Card.Footer>
         </Card>

        {/* Management Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered contentClassName="bg-light border-0">
            <Modal.Header closeButton className="bg-white border-bottom-0 pb-3 mx-4 mt-3 shadow rounded-4">
                <Modal.Title className="fw-bold text-dark">
                    จัดการคำสั่งซื้อ <span className="text-primary font-monospace">#{selectedOrder?._id.slice(-6).toUpperCase()}</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 pb-4">
                {selectedOrder && (
                    <Row className="g-4 h-100">
                        {/* Left: Slip Image & Customer */}
                        <Col lg={5} className="d-flex flex-column gap-4">
                            
                            {/* Customer Info Card */}
                            <Card className="shadow border-status-info hover-card-up rounded-4 overflow-hidden">
                                <Card.Header className="fw-bold bg-white border-bottom"><FaUser className="text-info me-2"/>ข้อมูลผู้สั่งซื้อ</Card.Header>
                                <Card.Body className="bg-white">
                                    <Row className="g-3">
                                        <Col sm={12}>
                                            <div className="bg-light p-2 rounded-3 border">
                                                <small className="text-muted d-block">ชื่อลูกค้า</small> 
                                                <strong className="text-dark">{selectedOrder.customerName}</strong>
                                            </div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="p-2 bg-light rounded-3 border">
                                                <small className="text-muted d-block">เบอร์โทร</small> 
                                                <strong className="text-dark">{selectedOrder.phone}</strong>
                                            </div>
                                        </Col>
                                        <Col sm={6}>
                                            <div className="p-2 bg-light rounded-3 border">
                                                <small className="text-muted d-block">วันที่สั่ง</small> 
                                                <strong className="text-dark">{new Date(selectedOrder.createdAt).toLocaleDateString('th-TH')}</strong>
                                            </div>
                                        </Col>
                                        <Col sm={12}>
                                            <div className="p-2 bg-light rounded-3 border d-flex align-items-start gap-2">
                                                <FaMapMarkerAlt className="text-danger mt-1 flex-shrink-0"/>
                                                <div>
                                                    <small className="text-muted d-block">ที่อยู่จัดส่ง</small> 
                                                    <strong className="text-dark">{selectedOrder.address || 'รับด้วยตนเอง'}</strong>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Slip Image Card */}
                            <Card className="shadow border-status-success flex-grow-1 overflow-hidden rounded-4">
                                <Card.Header className="fw-bold bg-white border-bottom d-flex justify-content-between">
                                    <span><FaFileInvoiceDollar className="text-success me-2"/>หลักฐานการโอน</span>
                                    {selectedOrder.paymentProofUrl ? <Badge bg="success">มีรูป</Badge> : <Badge bg="secondary">ไม่มี</Badge>}
                                </Card.Header>
                                <Card.Body className="d-flex align-items-center justify-content-center p-0 bg-dark bg-opacity-10" style={{minHeight: '300px'}}>
                                    {selectedOrder.paymentProofUrl ? (
                                        <div className="position-relative w-100 h-100" style={{minHeight: '300px'}}>
                                            <Image src={selectedOrder.paymentProofUrl} alt="Slip" fill style={{objectFit: 'contain'}} className="p-2"/>
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted opacity-50">
                                            <FaFileInvoiceDollar size={50} className="mb-3"/>
                                            <h5>ลูกค้ายังไม่แนบสลิป</h5>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* RIGHT: Items & Actions */}
                        <Col lg={7}>
                            <div className="d-flex flex-column h-100 gap-4">
                                
                                {/* Action Card */}
                                <Card className="shadow border-status-warning hover-card-up rounded-4 overflow-hidden">
                                    <Card.Header className="bg-white fw-bold border-bottom"><FaMoneyBillWave className="text-warning me-2"/>สรุปยอดและการจัดการ</Card.Header>
                                    <Card.Body style={{ backgroundColor: '#f8f9fa' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-3 bg-white p-3 rounded-3 shadow-sm border">
                                            <div className="d-flex flex-column">
                                                <span className="fw-bold text-dark">ยอดรวมสุทธิ</span>
                                                <span className="fw-bolder text-primary fs-3">฿{selectedOrder.totalPrice.toLocaleString()}</span>
                                            </div>
                                            <Badge bg={statusMap[selectedOrder.status]?.color} className="px-3 py-2 fs-6 rounded-pill">
                                                {statusMap[selectedOrder.status]?.label}
                                            </Badge>
                                        </div>

                                        <div className="d-grid gap-2 pt-2">
                                            {selectedOrder.status === 'verification' && (
                                                <div className="d-flex gap-2">
                                                    <Button variant="success" className="w-100 py-2 fw-bold shadow-sm rounded-pill" onClick={() => handleUpdateStatus('shipping')} disabled={updating}>
                                                        <FaCheckCircle className="me-2"/> ยืนยันสลิปถูกต้อง
                                                    </Button>
                                                    <Button variant="outline-danger" className="w-100 py-2 fw-bold shadow-sm rounded-pill" onClick={() => handleUpdateStatus('pending_payment')} disabled={updating}>
                                                        <FaTimesCircle className="me-2"/> สลิปไม่ผ่าน
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            {selectedOrder.status === 'shipping' && (
                                                <Button variant="primary" className="w-100 py-2 fw-bold shadow-sm rounded-pill" onClick={() => handleUpdateStatus('completed')} disabled={updating}>
                                                    <FaTruck className="me-2"/> บันทึกการจัดส่งสำเร็จ
                                                </Button>
                                            )}

                                            <InputGroup size="sm" className="mt-3 shadow-sm rounded-pill overflow-hidden border border-secondary border-opacity-25">
                                                <InputGroup.Text className="bg-white border-0 ps-3 fw-bold text-secondary">เปลี่ยนสถานะเอง</InputGroup.Text>
                                                <Form.Select value={selectedOrder.status} onChange={(e) => handleUpdateStatus(e.target.value)} disabled={updating} className="fw-bold text-dark border-0 shadow-none bg-white">
                                                    <option value="pending_payment">รอชำระเงิน</option>
                                                    <option value="verification">รอตรวจสอบ</option>
                                                    <option value="shipping">กำลังจัดส่ง</option>
                                                    <option value="completed">สำเร็จ</option>
                                                    <option value="cancelled">ยกเลิก</option>
                                                </Form.Select>
                                            </InputGroup>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Items List */}
                                <Card className="shadow border-status-primary flex-grow-1 overflow-hidden rounded-4">
                                    <Card.Header className="bg-white fw-bold border-bottom"><FaBoxOpen className="text-primary me-2"/>รายการสินค้า ({selectedOrder.items.length})</Card.Header>
                                    <Card.Body className="p-0 bg-white">
                                        <div className="overflow-auto" style={{maxHeight: '400px'}}>
                                            {selectedOrder.items.map((item:any, idx:number) => (
                                                <div key={idx} className="d-flex justify-content-between align-items-center p-3 border-bottom hover-bg-light transition-all">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-light p-1 rounded-3 me-3 shadow-sm border" style={{width:45, height:45}}>
                                                            {item.imageUrl && <Image src={item.imageUrl} alt="item" width={35} height={35} style={{objectFit:'cover'}} />}
                                                        </div>
                                                        <div className="text-start">
                                                            <div className="fw-bold text-dark">{item.productName}</div>
                                                            <small className="text-muted">Size: {item.size} <span className="mx-1">|</span> x{item.quantity}</small>
                                                        </div>
                                                    </div>
                                                    <div className="text-end fw-bold text-dark">
                                                        ฿{(item.price * item.quantity).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>

                            </div>
                        </Col>
                    </Row>
                )}
            </Modal.Body>
        </Modal>
    </Container>
  );
}