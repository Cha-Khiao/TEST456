// src/app/page.tsx
import HomeView from '@/components/HomeView';
import API_ENDPOINTS from '@/lib/api';
import { Product } from '@/types'; // ใช้ Type กลางที่เราสร้างไว้

// ไซส์ทั้งหมด (เรียงลำดับแล้ว)
const ALL_SIZES = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(API_ENDPOINTS.PRODUCTS, { cache: 'no-store' }); // no-store เพื่อให้ได้ data ล่าสุดเสมอ
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  // --- เตรียมข้อมูลสินค้าแยกประเภท (ถ้าหาไม่เจอ จะได้ undefined ซึ่ง code รับมือได้) ---
  const normalProducts = products.filter(p => p.type === 'normal');
  const mourningProducts = products.filter(p => p.type === 'mourning');

  // 1. คำนวณยอดขายรวม (Sold) จากทุกสินค้าใน DB
  const totalSold = products.reduce((sum, p) => {
      return sum + (p.stock?.reduce((sSum, s) => sSum + (s.sold || 0), 0) || 0);
  }, 0);

  const normalSold = normalProducts.reduce((sum, p) => sum + (p.stock?.reduce((sSum, s) => sSum + (s.sold || 0), 0) || 0), 0);
  const mourningSold = mourningProducts.reduce((sum, p) => sum + (p.stock?.reduce((sSum, s) => sSum + (s.sold || 0), 0) || 0), 0);
  
  const salesStats = {
    total: { sold: totalSold },
    normal: { sold: normalSold },
    mourning: { sold: mourningSold }
  };

  // 2. คำนวณสต็อกคงเหลือแยกไซส์ (รวมทุก Product ใน Type นั้นๆ)
  // (สมมติว่าถ้ามีเสื้อปกติ 2 ลาย ไซส์ S จะถูกนำมาบวกกัน)
  
  const sizeStatsTotal = ALL_SIZES.map(size => {
    // วนลูปสินค้าทุกตัว เอา quantity ของไซส์นี้มาบวกกัน
    const count = products.reduce((sum, p) => {
        const found = p.stock?.find(s => s.size === size);
        return sum + (found ? found.quantity : 0);
    }, 0);
    return { size, count };
  });

  const sizeStatsNormal = ALL_SIZES.map(size => {
    const count = normalProducts.reduce((sum, p) => {
        const found = p.stock?.find(s => s.size === size);
        return sum + (found ? found.quantity : 0);
    }, 0);
    return { size, count };
  });

  const sizeStatsMourning = ALL_SIZES.map(size => {
    const count = mourningProducts.reduce((sum, p) => {
        const found = p.stock?.find(s => s.size === size);
        return sum + (found ? found.quantity : 0);
    }, 0);
    return { size, count };
  });

  // ส่งข้อมูล products ตัวจริงไปด้วย เพื่อให้ HomeView เอาไป render Carousel
  return (
    <HomeView 
      products={products} // ✅ ส่งสินค้าทั้งหมดไปให้ Carousel
      salesStats={salesStats}
      sizeStatsTotal={sizeStatsTotal}
      sizeStatsNormal={sizeStatsNormal}
      sizeStatsMourning={sizeStatsMourning}
    />
  );
}