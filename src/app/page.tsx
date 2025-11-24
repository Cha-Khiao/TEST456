import HomeView from '@/components/HomeView';
import API_ENDPOINTS from '@/lib/api';
import { Product } from '@/types';

const ALL_SIZES = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(API_ENDPOINTS.PRODUCTS, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  // --- คำนวณภาพรวมยอดจำหน่าย (Dashboard Stats) ---
  let totalRevenue = 0;     // ยอดขายรวม (บาท)
  let totalItemsSold = 0;   // จำนวนตัวที่ขายได้รวม

  // --- หาสินค้าขายดี (Best Seller) ---
  let bestSeller = null;
  let maxSold = -1;

  products.forEach(p => {
      // นับยอดขายของสินค้านี้ (รวมทุกไซส์)
      const soldCount = p.stock?.reduce((sum, s) => sum + (s.sold || 0), 0) || 0;
      const revenue = soldCount * p.price;

      // บวกเข้ายอดรวมทั้งหมด
      totalItemsSold += soldCount;
      totalRevenue += revenue;

      // เช็คว่าเป็น Best Seller หรือไม่
      if (soldCount > maxSold) {
          maxSold = soldCount;
          bestSeller = {
              name: p.name,
              price: p.price,
              sold: soldCount,
              revenue: revenue,
              imageUrl: p.imageUrl
          };
      }
  });

  // ข้อมูลสถิติที่จะส่งไปหน้าบ้าน
  const stats = {
      overall: { revenue: totalRevenue, itemsSold: totalItemsSold },
      bestSeller: bestSeller
  };

  // --- คำนวณสต็อกคงเหลือรวมทุกไซส์ (Total Stock) ---
  const sizeStatsTotal = ALL_SIZES.map(size => {
    const count = products.reduce((sum, p) => {
        const found = p.stock?.find(s => s.size === size);
        return sum + (found ? found.quantity : 0);
    }, 0);
    return { size, count };
  });

  return (
    <HomeView 
      products={products}
      stats={stats}
      sizeStatsTotal={sizeStatsTotal}
    />
  );
}