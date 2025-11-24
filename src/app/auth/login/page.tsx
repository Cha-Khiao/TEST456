'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaPhoneAlt, FaLock, FaSignInAlt, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';

export default function UserLoginPage() {
  const router = useRouter();
  
  // State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Phone Logic
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) setPhoneNumber(value);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phoneNumber.length !== 10 || !phoneNumber.startsWith('0')) {
        setError('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก (เริ่มด้วย 0)');
        return;
    }
    if (password.length < 4) {
        setError('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
        return;
    }

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier: phoneNumber,
        password,
        isUserLogin: "true",
        redirect: false,
      });

      if (result?.error) {
        setError('เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง');
        setLoading(false);
      } else {
        router.push('/dashboard'); 
        router.refresh();
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดของระบบ');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        background: `radial-gradient(circle at 50% 0%, #4f46e515 0%, transparent 50%), #f8fafc`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      {/* Background Blobs */}
      <div className="position-fixed top-0 start-0 w-100 h-100 overflow-hidden" style={{zIndex: 0, pointerEvents: 'none'}}>
          <div className="position-absolute top-0 start-0 bg-primary opacity-10 rounded-circle animate-blob" style={{width: '300px', height: '300px', filter: 'blur(50px)', transform: 'translate(-50%, -50%)'}}></div>
          <div className="position-absolute bottom-0 end-0 bg-secondary opacity-10 rounded-circle animate-blob animate-blob-delay" style={{width: '400px', height: '400px', filter: 'blur(60px)', transform: 'translate(20%, 20%)'}}></div>
      </div>

      <Card className="border-0 shadow-lg rounded-5 overflow-hidden position-relative z-1 login-card-hover" style={{width: '100%', maxWidth: '420px'}}>
         
         <Link href="/" className="position-absolute top-0 start-0 m-3 text-decoration-none text-secondary opacity-50 hover-opacity-100 transition-all" style={{zIndex: 10}}>
            <FaArrowLeft />
         </Link>

         <div className="text-center pt-5 pb-2 bg-white">
            <h3 className="fw-bold mb-1 text-dark">เข้าสู่ระบบ</h3>
            <p className="text-muted small mb-0">สำหรับลูกค้าสั่งจองสินค้า</p>
         </div>

         <Card.Body className="p-4 pt-3">
            {error && <Alert variant="danger" className="py-2 text-center small border-0 bg-danger bg-opacity-10 text-danger mb-3">{error}</Alert>}

            <button 
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="btn btn-white w-100 py-2 mb-4 rounded-4 d-flex align-items-center justify-content-center gap-2 border shadow-sm google-btn-anim"
                disabled={loading}
            >
                <FcGoogle size={22} /> <span className="fw-bold text-secondary">ดำเนินการต่อด้วย Google</span>
            </button>

            <div className="d-flex align-items-center mb-4">
                <div className="flex-grow-1" style={{height: '1px', background: '#eee'}}></div>
                <span className="px-3 text-muted" style={{fontSize: '0.75rem'}}>หรือ เบอร์โทรศัพท์</span>
                <div className="flex-grow-1" style={{height: '1px', background: '#eee'}}></div>
            </div>

            <Form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <div className={`input-group input-group-animated rounded-4 overflow-hidden`}>
                        <span className="input-group-text bg-white border-0 ps-3 text-secondary"><FaPhoneAlt/></span>
                        <Form.Control 
                            type="tel"
                            inputMode="numeric"
                            placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                            className="border-0 bg-white py-3 shadow-none"
                            required
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            maxLength={10}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <div className={`input-group input-group-animated rounded-4 overflow-hidden`}>
                        <span className="input-group-text bg-white border-0 ps-3 text-secondary"><FaLock/></span>
                        <Form.Control 
                            type={showPassword ? "text" : "password"} 
                            placeholder="รหัสผ่าน"
                            className="border-0 bg-white py-3 shadow-none"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span className="input-group-text bg-white border-0 pe-3 text-muted cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                             {showPassword ? <FaEyeSlash/> : <FaEye/>}
                        </span>
                    </div>
                    <div className="text-end mt-2">
                        <small className="text-primary opacity-75" style={{fontSize: '0.75rem'}}>* ครั้งแรกระบบจะสมัครให้อัตโนมัติ</small>
                    </div>
                </div>

                <Button type="submit" className="w-100 py-3 rounded-4 fw-bold shadow-lg mb-2 border-0 btn-gradient-primary hover-lift" disabled={loading}>
                    {loading ? <Spinner size="sm" animation="border"/> : <><FaSignInAlt className="me-2"/> เข้าสู่ระบบ</>}
                </Button>
            </Form>
         </Card.Body>
      </Card>
    </div>
  );
}