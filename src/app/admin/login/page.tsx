'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Form, Button, Alert, InputGroup, Spinner, Container } from 'react-bootstrap';
import { FaUserShield, FaUser, FaLock, FaKey } from 'react-icons/fa';

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const target = e.target as typeof e.target & {
      username: { value: string };
      password: { value: string };
    };

    const result = await signIn('credentials', {
      identifier: target.username.value,
      password: target.password.value,
      isUserLogin: "false",
      redirect: false,
    });

    if (result?.error) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      setLoading(false);
    } else {
      window.location.href = '/admin/orders'; 
    }
  };

  return (
    <div className="admin-login-wrapper">
      
      {/* Background Decorations */}
      <div className="admin-login-decoration-1"></div>
      <div className="admin-login-decoration-2"></div>

      <Container className="position-relative z-1 d-flex justify-content-center">
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden animate-slide-up" style={{ width: '100%', maxWidth: '420px' }}>
            
            {/* Header Section */}
            <div className="bg-white p-4 pb-0 text-center pt-5">
                <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3 shadow-sm animate-bounce-slow">
                    <FaUserShield size={40} />
                </div>
                <h3 className="fw-bold text-dark mb-1">Admin Portal</h3>
                <p className="text-muted small">เข้าสู่ระบบจัดการหลังบ้าน</p>
            </div>

            <Card.Body className="p-4 p-md-5 pt-2">
                {error && (
                    <Alert variant="danger" className="border-0 bg-danger bg-opacity-10 text-danger text-center small rounded-3 py-2 mb-4">
                        <FaKey className="me-2"/> {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold text-secondary">Username</Form.Label>
                        <InputGroup className="input-group-focus rounded-3 overflow-hidden border transition-all">
                            <InputGroup.Text className="bg-white border-0 text-secondary ps-3"><FaUser/></InputGroup.Text>
                            <Form.Control 
                                name="username" 
                                type="text" 
                                required 
                                placeholder="กรอกชื่อผู้ใช้" 
                                className="border-0 shadow-none bg-white py-2"
                            />
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="small fw-bold text-secondary">Password</Form.Label>
                        <InputGroup className="input-group-focus rounded-3 overflow-hidden border transition-all">
                            <InputGroup.Text className="bg-white border-0 text-secondary ps-3"><FaLock/></InputGroup.Text>
                            <Form.Control 
                                name="password" 
                                type="password" 
                                required 
                                placeholder="กรอกรหัสผ่าน" 
                                className="border-0 shadow-none bg-white py-2"
                            />
                        </InputGroup>
                    </Form.Group>

                    <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 py-3 rounded-pill fw-bold shadow-sm btn-gradient-primary border-0 mt-2 hover-scale"
                        disabled={loading}
                    >
                        {loading ? (
                            <><Spinner animation="border" size="sm" className="me-2"/> กำลังตรวจสอบ...</>
                        ) : (
                            'เข้าสู่ระบบ'
                        )}
                    </Button>
                </Form>

                <div className="text-center mt-4 pt-3 border-top border-light">
                    <small className="text-muted" style={{fontSize: '0.75rem'}}>
                        &copy; Sisaket Shirt Admin System
                    </small>
                </div>
            </Card.Body>
        </Card>
      </Container>
    </div>
  );
}