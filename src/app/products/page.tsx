// src/app/products/page.tsx
import API_ENDPOINTS from '@/lib/api';
import ProductsView from '@/components/ProductsView'; // เรียกใช้ Component ที่เราเพิ่งสร้าง

// Type Definitions
interface ProductVariant {
  size: string;
  quantity: number;
  sold: number;
}

interface Product {
  _id: string;
  name: string;
  type: 'normal' | 'mourning';
  description: string;
  price: number;
  imageUrl: string;
  stock: ProductVariant[];
  isActive: boolean;
}

const SIZE_CHART_BASE = [
  { size: 'SSS', chest: 34, length: 24 },
  { size: 'SS', chest: 36, length: 25 },
  { size: 'S', chest: 38, length: 26 },
  { size: 'M', chest: 40, length: 27 },
  { size: 'L', chest: 42, length: 28 },
  { size: 'XL', chest: 44, length: 29 },
  { size: '2XL', chest: 46, length: 30 },
  { size: '3XL', chest: 48, length: 31 },
  { size: '4XL', chest: 50, length: 32 },
  { size: '5XL', chest: 52, length: 33 },
  { size: '6XL', chest: 54, length: 34 },
  { size: '7XL', chest: 56, length: 35 },
  { size: '8XL', chest: 58, length: 36 },
  { size: '9XL', chest: 60, length: 37 },
  { size: '10XL', chest: 62, length: 38 },
];

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(API_ENDPOINTS.PRODUCTS, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  // คำนวณ Stock
  const normalProduct = products.find(p => p.type === 'normal');
  const mourningProduct = products.find(p => p.type === 'mourning');

  const stockTableData = SIZE_CHART_BASE.map(base => {
    const normalStock = normalProduct?.stock.find(s => s.size === base.size)?.quantity || 0;
    const mourningStock = mourningProduct?.stock.find(s => s.size === base.size)?.quantity || 0;

    return {
      ...base,
      normal: normalStock,
      mourning: mourningStock
    };
  });

  // ส่งข้อมูลไปให้ Client Component แสดงผล
  return <ProductsView products={products} stockTableData={stockTableData} />;
}