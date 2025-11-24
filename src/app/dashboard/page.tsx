'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Card, Badge, Button, Table, Spinner, Alert } from 'react-bootstrap';
import { 
  FaClipboardList, FaTshirt, FaWallet, FaChartPie, 
  FaPlus, FaBoxOpen, FaUpload, FaSearch, FaTruck, FaCheckCircle, FaClock, FaEye, FaCalendarAlt
} from 'react-icons/fa';
import API_ENDPOINTS from '@/lib/api';

const primaryColorHex = '#4F46E5'; 
const primaryGradient = `linear-gradient(135deg, ${primaryColorHex} 0%, #7c3aed 100%)`;

interface OrderItem {
  productName: string;
  size: string;
  quantity: number;
}

interface Order {
  _id: string;
  status: string;
  totalPrice: number;
  items: OrderItem[];
  createdAt: string;
  customerName: string;
  phone: string;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchOrders = async () => {
      // ถ้ายังไม่ Login หรือไม่มี Token ให้หยุด
      if (!session) {
         return; // ยังไม่ set loading false รอจนกว่า session จะมา หรือดีดออก
      }

      // @ts-ignore
      const userPhone = session.user.name; // ใช้ name (ที่เป็นเบอร์โทร) หรือ id ตาม logic ที่เราเก็บ

      try {
        // แนบ Token ไปกับ Header
        const res = await fetch(`${API_ENDPOINTS.ORDERS}?phone=${userPhone}`, {
            headers: {
                'Authorization': `Bearer ${(session as any)?.accessToken}`
            }
        });
        
        if (!res.ok) {
            // ถ้า 401/403 อาจจะ Token หมดอายุ
            if (res.status === 401) console.error("Unauthorized");
            throw new Error('Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
        fetchOrders();
    }
  }, [session]);

  // --- Stats Calculation ---
  const totalOrders = orders.length;
  const totalItems = orders.reduce((acc, order) => acc + order.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  const totalPaid = orders
    .filter(o => o.status !== 'pending_payment' && o.status !== 'cancelled')
    .reduce((acc, order) => acc + order.totalPrice, 0);

  // --- Helpers ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment': return '#f59e0b';
      case 'verification': return '#0ea5e9';
      case 'shipping': return '#4F46E5';
      case 'completed': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment': return <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill border border-warning bg-opacity-25 text-warning-emphasis w-100 shadow-sm"><FaClock className="me-1"/> รอชำระเงิน</Badge>;
      case 'verification': return <Badge bg="info" text="dark" className="px-3 py-2 rounded-pill border border-info bg-opacity-25 text-info-emphasis w-100 shadow-sm"><FaSearch className="me-1"/> รอตรวจสอบ</Badge>;
      case 'shipping': return <Badge bg="primary" className="px-3 py-2 rounded-pill border border-primary bg-opacity-25 text-primary-emphasis w-100 shadow-sm"><FaTruck className="me-1"/> กำลังจัดส่ง</Badge>;
      case 'completed': return <Badge bg="success" text="dark" className="px-3 py-2 rounded-pill border border-success bg-opacity-25 text-success-emphasis w-100 shadow-sm"><FaCheckCircle className="me-1"/> สำเร็จ</Badge>;
      default: return <Badge bg="secondary" className="px-3 py-2 rounded-pill w-100 shadow-sm">ยกเลิก/อื่นๆ</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getItemSummary = (items: OrderItem[]) => {
    return items.map(i => `${i.productName} (${i.size}) x ${i.quantity}`).join(', ');
  };

  const unifiedCardStyle = {
    border: `2px solid ${primaryColorHex}`,
    borderRadius: '24px',
    boxShadow: `0 12px 36px ${primaryColorHex}15`, 
    backgroundColor: '#fff',
    overflow: 'hidden'
  };

  const getStatCardStyle = (color: string) => ({
    border: `2px solid ${color}`,
    borderRadius: '16px',
    boxShadow: `0 4px 15px ${color}15`,
    backgroundColor: '#fff',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden',
    height: '100%'
  });

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <Spinner animation="border" variant="primary" />
            <span className="ms-3 text-primary fw-bold">กำลังโหลดข้อมูล...</span>
        </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '50px' }}>
      
      <div className="position-absolute top-0 start-50 translate-middle-x" 
           style={{ width: '80%', height: '400px', background: `radial-gradient(circle, ${primaryColorHex}10 0%, transparent 70%)`, zIndex: -1, filter: 'blur(80px)', pointerEvents: 'none' }}>
      </div>

      <Container>
         
         {/* Header */}
         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div>
                <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <span className="bg-white p-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center border" style={{width: 45, height: 45}}>
                        <FaClipboardList style={{color: primaryColorHex}} size={20}/>
                    </span>
                    ประวัติการสั่งซื้อ
                </h2>
                <p className="text-secondary ms-1 mb-0 small">จัดการรายการและตรวจสอบสถานะสินค้าของคุณ</p>
            </div>
            <div className="d-flex gap-2">
                <Link href="/orders/create">
                    <Button className="btn-gradient-primary rounded-pill px-4 fw-bold shadow-lg btn-sm d-flex align-items-center py-2">
                        <FaPlus className="me-2"/> สั่งซื้อเพิ่ม
                    </Button>
                </Link>
            </div>
         </div>

         {/* Stats Cards */}
         <Row className="g-3 mb-5">
            <Col md={6} lg={3}>
                <Card style={getStatCardStyle(primaryColorHex)} className="hover-lift h-100">
                    <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="text-secondary small fw-bold" style={{fontSize: '0.75rem'}}>คำสั่งซื้อทั้งหมด</span>
                            <h3 className="fw-bold text-dark mb-0 mt-1">{totalOrders}</h3>
                        </div>
                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: 45, height: 45, backgroundColor: '#e0e7ff', color: primaryColorHex}}>
                            <FaClipboardList size={20}/>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6} lg={3}>
                <Card style={getStatCardStyle('#10B981')} className="hover-lift h-100">
                    <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="text-secondary small fw-bold" style={{fontSize: '0.75rem'}}>เสื้อที่สั่งรวม</span>
                            <h3 className="fw-bold text-dark mb-0 mt-1">{totalItems} <span className="fs-6 fw-normal text-muted">ตัว</span></h3>
                        </div>
                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: 45, height: 45, backgroundColor: '#d1fae5', color: '#10B981'}}>
                            <FaTshirt size={20}/>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6} lg={3}>
                <Card style={getStatCardStyle('#0EA5E9')} className="hover-lift h-100">
                    <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="text-secondary small fw-bold" style={{fontSize: '0.75rem'}}>ชำระเงินแล้ว</span>
                            <h3 className="fw-bold text-dark mb-0 mt-1">฿{totalPaid.toLocaleString()}</h3>
                        </div>
                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: 45, height: 45, backgroundColor: '#bae6fd', color: '#0EA5E9'}}>
                            <FaWallet size={20}/>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6} lg={3}>
                <Card style={getStatCardStyle('#F59E0B')} className="hover-lift h-100">
                    <Card.Body className="p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="text-secondary small fw-bold" style={{fontSize: '0.75rem'}}>สถานะล่าสุด</span>
                            <h5 className="fw-bold text-dark mb-0 mt-1">{orders[0]?.status || '-'}</h5>
                        </div>
                        <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{width: 45, height: 45, backgroundColor: '#fde68a', color: '#F59E0B'}}>
                            <FaChartPie size={20}/>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
         </Row>

         {/* Order List */}
         <Card style={unifiedCardStyle} className="mb-5">
            <div className="p-3 d-flex justify-content-between align-items-center" style={{background: primaryGradient}}>
               <h5 className="fw-bold mb-0 text-white d-flex align-items-center" style={{fontSize: '1.1rem'}}>
                  <FaBoxOpen className="me-2"/> รายการคำสั่งซื้อ
               </h5>
               <span className="badge bg-white text-primary rounded-pill px-3 shadow-sm">Latest</span>
            </div>

            <Card.Body className="p-0 bg-white">
               {totalOrders === 0 ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5 text-center">
                      <div className="mb-4 p-4 rounded-circle bg-light border border-dashed text-secondary opacity-25">
                         <FaClipboardList size={50} />
                      </div>
                      <h5 className="fw-bold text-dark mb-1">ยังไม่มีประวัติการสั่งซื้อ</h5>
                      <p className="text-muted mb-4 small">เมื่อคุณสั่งซื้อเสื้อแล้ว รายการจะแสดงที่นี่</p>
                      <Link href="/products">
                         <Button className="btn-gradient-primary rounded-pill px-4 fw-bold shadow-lg btn-sm">
                            <FaPlus className="me-2"/> สั่งซื้อเสื้อเลย
                         </Button>
                      </Link>
                   </div>
               ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="table-responsive d-none d-md-block">
                        <Table hover className="mb-0 align-middle table-dashboard-striped" borderless>
                           <thead style={{backgroundColor: '#f8fafc', borderBottom: `3px solid ${primaryColorHex}`}}> 
                              <tr className="text-center text-secondary">
                                 <th className="py-3 ps-4">รหัสคำสั่งซื้อ</th>
                                 <th className="py-3">วันที่</th>
                                 <th className="py-3 text-center" style={{width: '35%'}}>รายละเอียดสินค้า</th>
                                 <th className="py-3">ยอดเงิน</th>
                                 <th className="py-3">สถานะ</th>
                                 <th className="py-3 pe-4">จัดการ</th>
                              </tr>
                           </thead>
                           <tbody>
                              {orders.map((order) => (
                                 <tr key={order._id}>
                                    <td className="ps-4 py-4 text-center">
                                       <span className="fw-bold" style={{color: primaryColorHex}}>
                                         ORD-{order._id.slice(-6).toUpperCase()}
                                       </span>
                                    </td>
                                    <td className="text-secondary text-center">{formatDate(order.createdAt)}</td>
                                    <td className="text-dark text-start px-4" style={{lineHeight: '1.6'}}>
                                       {getItemSummary(order.items)}
                                    </td>
                                    <td className="text-center fw-bold text-dark">฿{order.totalPrice.toLocaleString()}</td>
                                    <td className="text-center">
                                       <div style={{minWidth: '120px', display: 'inline-block'}}>
                                          {getStatusBadge(order.status)}
                                       </div>
                                    </td>
                                    <td className="text-center pe-4 text-nowrap">
                                       <div style={{width: '110px', display: 'inline-block'}}>
                                          {order.status === 'pending_payment' ? (
                                             <Link href={`/payment/notify/${order._id}`} className="text-decoration-none">
                                                <div className="btn btn-sm w-100 rounded-pill px-3 shadow-sm fw-bold btn-gradient-warning d-flex align-items-center justify-content-center cursor-pointer">
                                                   <FaUpload className="me-1"/> แจ้งโอน
                                                </div>
                                             </Link>
                                          ) : (
                                             <Link href={`/orders/details/${order._id}`} className="text-decoration-none">
                                                <div className="btn btn-sm w-100 rounded-pill px-3 shadow-sm fw-bold btn-gradient-secondary d-flex align-items-center justify-content-center cursor-pointer">
                                                   <FaEye className="me-1"/> ข้อมูล
                                                </div>
                                             </Link>
                                          )}
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="d-md-none p-3 bg-light">
                        {orders.map((order) => (
                           <Card 
                             key={order._id} 
                             className="mb-3 shadow-sm rounded-4 overflow-hidden bg-white mobile-card-highlight"
                             style={{
                               border: `2px solid ${getStatusColor(order.status)}`,
                               borderLeft: `6px solid ${getStatusColor(order.status)}`
                             }}
                           >
                              <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
                                 <div>
                                    <span className="fw-bold d-block" style={{color: primaryColorHex}}>
                                      ORD-{order._id.slice(-6).toUpperCase()}
                                    </span>
                                    <small className="text-muted"><FaCalendarAlt className="me-1"/> {formatDate(order.createdAt)}</small>
                                 </div>
                                 <div style={{transform: 'scale(0.9)', transformOrigin: 'right center'}}>
                                    {getStatusBadge(order.status)}
                                 </div>
                              </div>
                              
                              <Card.Body className="p-3">
                                 <div className="mb-3">
                                    <small className="text-secondary fw-bold mb-1 d-block">สินค้า:</small>
                                    <div className="bg-light p-3 rounded-3 border border-light-subtle text-dark">
                                       {getItemSummary(order.items)}
                                    </div>
                                 </div>
                                 <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
                                    <span className="text-secondary fw-bold">ยอดสุทธิ</span>
                                    <h4 className="fw-bold text-dark mb-0">฿{order.totalPrice.toLocaleString()}</h4>
                                 </div>
                                 <div className="d-grid">
                                    {order.status === 'pending_payment' ? (
                                       <Link href={`/payment/notify/${order._id}`} className="text-decoration-none">
                                             <div className="btn rounded-pill fw-bold py-2 shadow-sm btn-gradient-warning d-flex align-items-center justify-content-center">
                                                <FaUpload className="me-2"/> แจ้งชำระเงิน
                                             </div>
                                       </Link>
                                    ) : (
                                       <Link href={`/orders/details/${order._id}`} className="text-decoration-none">
                                             <div className="btn rounded-pill fw-bold py-2 shadow-sm btn-gradient-secondary d-flex align-items-center justify-content-center">
                                                <FaEye className="me-2"/> ดูรายละเอียด
                                             </div>
                                       </Link>
                                    )}
                                 </div>
                              </Card.Body>
                           </Card>
                        ))}
                    </div>
                  </>
               )}
            </Card.Body>
         </Card>

      </Container>
    </div>
  );
}