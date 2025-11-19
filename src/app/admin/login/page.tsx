'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Form, Button, Alert } from 'react-bootstrap';

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
      isUserLogin: "false", // บอกว่าเป็น Admin
      redirect: false,
    });

    if (result?.error) {
      setError('Username หรือ Password ไม่ถูกต้อง');
      setLoading(false);
    } else {
      // Login ผ่าน -> บังคับเปลี่ยนหน้า
      window.location.href = '/admin/orders'; 
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark">
      <Card style={{ width: '400px' }} className="p-4">
        <h3 className="text-center mb-4">Admin Login</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control name="username" type="text" required placeholder="admin" />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" required placeholder="1234" />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? 'Checking...' : 'Login'}
          </Button>
        </Form>
      </Card>
    </div>
  );
}