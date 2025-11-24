// BASE_API
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // สินค้า
  PRODUCTS: `${BASE_URL}/products`,
  PRODUCT_STOCK: (id: string) => `${BASE_URL}/products/${id}/stock`,

  // ออร์เดอร์
  ORDERS: `${BASE_URL}/orders`,
  MY_ORDERS: `${BASE_URL}/orders/my-orders`,
  ORDER_DETAILS: (id: string) => `${BASE_URL}/orders/${id}`,

  // การชำระเงิน
  UPLOAD_SLIP: `${BASE_URL}/payment/upload-slip`,
  
  // ระบบสมาชิก 
  LOGIN: `${BASE_URL}/auth/login`,
};

export default API_ENDPOINTS;