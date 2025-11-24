'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { 
  FaShoppingCart, FaTruck, FaBoxOpen, FaArrowDown, FaPlus, FaMinus, FaCheck, 
  FaUndo, FaTag, FaTimesCircle, FaSearch, FaFilter
} from 'react-icons/fa';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductsViewProps {
  initialProducts: Product[];
}

const ITEMS_PER_PAGE = 12;

export default function ProductsView({ initialProducts }: ProductsViewProps) {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  
  // --- Filter & Search State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // --- Pagination State ---
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  
  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
        const productToOpen = initialProducts.find(p => p._id === selectedId);
        if (productToOpen) {
            setSelectedProduct(productToOpen);
            setQuantities({});
            setShowModal(true);
        }
    }
  }, [searchParams, initialProducts]);

  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchTerm, filterType]);

  // --- Helpers ---
  const getBadgeColor = (type: string) => {
      if (type === 'mourning') return 'dark';
      if (type === 'normal') return 'primary';
      return 'info'; 
  };

  const getTypeName = (type: string) => {
      if (type === 'normal') return 'แบบสีปกติ';
      if (type === 'mourning') return 'แบบไว้ทุกข์';
      return type; 
  };

  // --- Filtering & Sorting Logic --
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      // กรองตามชื่อ
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      // กรองตามประเภท
      const matchesType = filterType === 'all' || product.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [initialProducts, searchTerm, filterType]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a.type === 'normal') return -1;
    if (b.type === 'normal') return 1;
    return 0;
  });

  const visibleProducts = sortedProducts.slice(0, displayCount);
  const hasMore = displayCount < sortedProducts.length;

  const loadMore = () => setDisplayCount(prev => prev + ITEMS_PER_PAGE);

  // ดึงประเภททั้งหมดมาทำตัวเลือกใน Dropdown
  const uniqueTypes = Array.from(new Set(initialProducts.map(p => p.type)));

  // --- Handlers ---
  const handleOpenModal = (product: Product) => {
      setSelectedProduct(product);
      setQuantities({}); 
      setShowModal(true);
  };

  const handleUpdateQuantity = (size: string, delta: number, maxStock: number) => {
      setQuantities(prev => {
          const currentQty = prev[size] || 0;
          const newQty = Math.max(0, Math.min(maxStock, currentQty + delta));
          
          if (newQty === 0) {
              const copy = { ...prev };
              delete copy[size];
              return copy;
          }
          return { ...prev, [size]: newQty };
      });
  };

  const handleAddToCart = () => {
      if (!selectedProduct) return;
      Object.entries(quantities).forEach(([size, qty]) => {
          if (qty > 0) {
              const stockItem = selectedProduct.stock.find(s => s.size === size);
              const maxStock = stockItem?.quantity || 0;
              addToCart(selectedProduct, size, qty, maxStock);
          }
      });
      setShowModal(false);
  };

  const totalSelectedItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Header */}
      <div className="position-relative py-5 mb-5 text-center overflow-hidden">
        <div className="position-absolute top-50 start-50 translate-middle" 
             style={{ width: '60%', height: '100%', background: 'radial-gradient(circle, rgba(111, 106, 248, 0.15) 0%, transparent 70%)', zIndex: -1, filter: 'blur(60px)' }}>
        </div>
        <Container className="position-relative z-1">
          <h1 className="fw-bold mb-3 display-5" style={{letterSpacing: '-1px'}}>
            <span className="text-dark">เลือกแบบเสื้อที่คุณ</span> <span className="text-primary">ภูมิใจ</span>
          </h1>
          <p className="text-secondary mx-auto" style={{maxWidth: '600px', fontSize: '1.1rem'}}>
            ร่วมเป็นส่วนหนึ่งในการเฉลิมฉลอง 243 ปี ศรีสะเกษ ด้วยเสื้อที่ระลึกคุณภาพดี <br className="d-none d-md-block"/>
            สินค้ามีจำนวนจำกัด หมดแล้วหมดเลย
          </p>
        </Container>
      </div>

      <Container>
        
        {/* Search & Filter Section */}
        <div className="mb-4 d-flex justify-content-center">
            <div className="bg-white p-2 rounded-pill shadow-sm border d-flex flex-column flex-md-row gap-2" style={{maxWidth: '600px', width: '100%'}}>
                {/* Search Input */}
                <InputGroup className="flex-grow-1">
                    <InputGroup.Text className="bg-transparent border-0 ps-3 text-muted"><FaSearch/></InputGroup.Text>
                    <Form.Control 
                        placeholder="ค้นหาชื่อสินค้า..." 
                        className="border-0 bg-transparent shadow-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>

                <div className="d-none d-md-block border-end my-2"></div>

                {/* Filter Dropdown */}
                <InputGroup style={{maxWidth: '200px'}}>
                    <InputGroup.Text className="bg-transparent border-0 text-muted ps-3 ps-md-2"><FaFilter/></InputGroup.Text>
                    <Form.Select 
                        className="border-0 bg-transparent shadow-none text-dark fw-bold"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{cursor: 'pointer'}}
                    >
                        <option value="all">ทั้งหมด</option>
                        {uniqueTypes.map((t, i) => (
                            <option key={i} value={t}>{getTypeName(t)}</option>
                        ))}
                    </Form.Select>
                </InputGroup>
            </div>
        </div>

        {/* Product Grid */}
        <Row className="g-3 g-lg-4 mb-4">
          {visibleProducts.length === 0 ? (
             <div className="text-center py-5 w-100">
                <div className="bg-light p-4 rounded-circle d-inline-block mb-3">
                   <FaBoxOpen size={40} className="text-muted opacity-50"/>
                </div>
                <p className="text-muted">
                    {searchTerm || filterType !== 'all' ? 'ไม่พบสินค้าที่ค้นหา' : 'ยังไม่มีสินค้าในระบบ'}
                </p>
                {(searchTerm || filterType !== 'all') && (
                    <Button variant="link" onClick={() => {setSearchTerm(''); setFilterType('all');}}>ล้างการค้นหา</Button>
                )}
             </div>
          ) : visibleProducts.map((product) => {
            const badgeVariant = getBadgeColor(product.type);
            const themeColor = product.type === 'mourning' ? '#333' : '#6f6af8';
            
            const totalStock = product.stock.reduce((acc, s) => acc + s.quantity, 0);
            const isOutOfStock = totalStock === 0;

            return (
            <Col xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card className={`h-100 border-0 shadow-sm rounded-4 overflow-hidden ${!isOutOfStock ? 'product-hover-effect' : ''}`} style={{transition: 'transform 0.2s', opacity: isOutOfStock ? 0.8 : 1}}>
                <div className="position-relative bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ height: '250px' }}>
                   <div className="position-absolute top-0 start-0 p-2 z-2">
                      <Badge bg={isOutOfStock ? 'secondary' : badgeVariant} className="shadow-sm fw-normal">
                         {isOutOfStock ? 'สินค้าหมด' : getTypeName(product.type)}
                      </Badge>
                   </div>
                   <div className="position-relative w-100 h-100 p-4">
                     <Image 
                       src={product.imageUrl || '/images/placeholder.png'} 
                       alt={product.name} 
                       fill 
                       style={{ objectFit: 'contain', filter: isOutOfStock ? 'grayscale(100%)' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} 
                       className={!isOutOfStock ? "hover-zoom" : ""}
                     />
                   </div>
                </div>

                <Card.Body className="d-flex flex-column p-3">
                   <h6 className="fw-bold mb-1 text-truncate text-dark" title={product.name}>
                      {product.name}
                   </h6>
                   
                   <p className="text-muted small mb-3 line-clamp-2" style={{minHeight: '40px', fontSize: '0.8rem'}}>
                      {product.description || "-"}
                   </p>
                   
                   <div className="mt-auto">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                         <h5 className="fw-bold text-dark mb-0">฿{product.price.toLocaleString()}</h5>
                         {isOutOfStock ? <small className="text-danger fw-bold">หมดชั่วคราว</small> : <small className="text-success d-flex align-items-center" style={{fontSize: '0.75rem'}}><FaTruck className="me-1"/> ส่ง 50.-</small>}
                      </div>

                      <Button 
                        className="w-100 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                        style={isOutOfStock ? { backgroundColor: '#e9ecef', borderColor: '#e9ecef', color: '#6c757d' } : { backgroundColor: themeColor, borderColor: themeColor, color: 'white' }}
                        onClick={() => !isOutOfStock && handleOpenModal(product)}
                        disabled={isOutOfStock}
                      >
                         {isOutOfStock ? 'สินค้าหมด' : <><FaShoppingCart size={14}/> เลือกใส่ตะกร้า</>}
                      </Button>
                   </div>
                </Card.Body>
              </Card>
            </Col>
          )})}
        </Row>

        {hasMore && (
            <div className="text-center py-4">
                <Button variant="light" className="rounded-pill px-5 py-2 border text-secondary shadow-sm hover-scale" onClick={loadMore}>
                    โหลดสินค้าเพิ่มเติม <FaArrowDown className="ms-2"/>
                </Button>
                <p className="text-muted small mt-2">แสดง {visibleProducts.length} จาก {sortedProducts.length} รายการ</p>
            </div>
        )}
      </Container>

      {/* Modal เลือกสินค้าลงตะกร้า */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title className="fw-bold text-dark fs-6">เลือกสินค้าลงตะกร้า</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              {selectedProduct && (
                  <div className="px-1">
                      {/* Product Info Header */}
                      <div className="d-flex gap-3 mb-3 p-3 rounded-3 bg-light border align-items-center position-relative overflow-hidden">
                          <div className="position-absolute top-0 start-0 w-100 h-100 bg-white opacity-50"></div>
                          <div className="position-relative bg-white rounded-3 border flex-shrink-0 shadow-sm" style={{width: 70, height: 70}}>
                             <Image src={selectedProduct.imageUrl} alt="Product" fill style={{objectFit:'contain'}}/>
                          </div>
                          <div className="position-relative">
                              <div className="mb-1">
                                  <Badge bg={getBadgeColor(selectedProduct.type)} className="fw-normal small px-2 py-1">
                                      <FaTag className="me-1"/> {getTypeName(selectedProduct.type)}
                                  </Badge>
                              </div>
                              <h6 className="fw-bold mb-0 text-dark">{selectedProduct.name}</h6>
                              <div className="text-primary fw-bold mt-1">฿{selectedProduct.price.toLocaleString()} <span className="text-muted fw-normal small">/ ตัว</span></div>
                          </div>
                          <div className="ms-auto position-relative z-1">
                             <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => setQuantities({})} disabled={totalSelectedItems === 0}>
                                <FaUndo className="me-1"/> ล้างค่า
                             </Button>
                          </div>
                      </div>
                      
                      {/* Size List */}
                      <div className="mb-2">
                          <div className="d-flex justify-content-between text-secondary fw-bold px-2 mb-2" style={{fontSize: '0.75rem'}}>
                              <span>ขนาด / สต็อกคงเหลือ (Real-time)</span>
                              <span>จำนวนที่เลือก</span>
                          </div>
                          
                          <div className="d-flex flex-column gap-2" style={{maxHeight: '350px', overflowY: 'auto'}}>
                            {selectedProduct.stock
                                .filter(s => s.quantity > 0)
                                .map(s => {
                                    const currentQty = quantities[s.size] || 0;
                                    const isSelected = currentQty > 0;
                                    const activeTheme = selectedProduct.type === 'mourning' ? 'dark' : 'primary';
                                    
                                    const remainingRealTime = s.quantity - currentQty;
                                    const isMaxReached = remainingRealTime === 0;

                                    return (
                                        <div key={s.size} 
                                             className={`d-flex align-items-center justify-content-between p-2 rounded-3 border transition-all shadow-sm ${isSelected ? `border-${activeTheme} bg-${activeTheme} bg-opacity-10` : 'border-light-subtle bg-white'}`}
                                        >
                                            <div className="d-flex align-items-center gap-3 ps-1">
                                                <div className={`fw-bold rounded-circle d-flex align-items-center justify-content-center ${isSelected ? `bg-${activeTheme} text-white` : 'bg-light text-dark border'}`} 
                                                     style={{width: '40px', height: '40px', fontSize: '1rem'}}>
                                                    {s.size}
                                                </div>
                                                <div className="lh-1">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={`small ${isMaxReached ? 'text-danger fw-bold' : 'text-success'}`}>
                                                            {isMaxReached ? 'ครบโควตา' : `เหลือ ${remainingRealTime}`}
                                                        </span>
                                                        {isSelected && <small className="text-muted" style={{fontSize: '0.65rem'}}>(จาก {s.quantity})</small>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex align-items-center bg-white rounded-pill border px-1 py-1 shadow-sm">
                                                <Button 
                                                    variant="light" 
                                                    className="rounded-circle p-0 d-flex align-items-center justify-content-center text-danger border-0 hover-bg-danger-light" 
                                                    style={{width: 32, height: 32}} 
                                                    onClick={() => handleUpdateQuantity(s.size, -1, s.quantity)}
                                                    disabled={currentQty === 0}
                                                >
                                                    <FaMinus size={10}/>
                                                </Button>
                                                
                                                <span className="fw-bold text-center mx-2 text-dark user-select-none" style={{width: '25px', fontSize: '1rem'}}>
                                                    {currentQty}
                                                </span>
                                                
                                                <Button 
                                                    variant={activeTheme}
                                                    className="rounded-circle p-0 d-flex align-items-center justify-content-center border-0 text-white" 
                                                    style={{width: 32, height: 32}} 
                                                    onClick={() => handleUpdateQuantity(s.size, 1, s.quantity)}
                                                    disabled={isMaxReached}
                                                >
                                                    <FaPlus size={10}/>
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                          </div>
                      </div>
                  </div>
              )}
          </Modal.Body>
          <Modal.Footer className="border-top-0 pt-0 pb-3 px-3">
              <div className="d-flex justify-content-between w-100 align-items-center bg-light p-3 rounded-4 border shadow-sm">
                  <div className="ps-1">
                      <span className="text-secondary small me-2">ยอดรวม:</span>
                      <span className="fw-bold text-primary fs-4">{totalSelectedItems}</span>
                      <span className="text-secondary small ms-1">ชิ้น</span>
                  </div>
                  <div className="d-flex gap-2">
                      <Button variant="light" size="sm" onClick={() => setShowModal(false)} className="rounded-pill px-3 border">ยกเลิก</Button>
                      <Button 
                        size="sm"
                        variant={selectedProduct?.type === 'mourning' ? 'dark' : 'primary'} 
                        onClick={handleAddToCart} 
                        disabled={totalSelectedItems === 0} 
                        className="fw-bold px-4 rounded-pill shadow hover-lift"
                      >
                          <FaCheck className="me-2"/> ยืนยันลงตะกร้า
                      </Button>
                  </div>
              </div>
          </Modal.Footer>
      </Modal>
    </div>
  );
}