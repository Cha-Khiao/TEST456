// src/app/page.tsx
import HomeView from '@/components/HomeView';
import API_ENDPOINTS from '@/lib/api';
import { Product } from '@/types';

// ไซส์ทั้งหมด (เรียงลำดับแล้ว)
const ALL_SIZES = ['SSS', 'SS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL', '7XL', '8XL', '9XL', '10XL'];

async function getProducts() {
  try {
    // no-store = ห้าม cache (เพื่อให้เห็นสต็อกล่าสุดเสมอ)
    const res = await fetch(API_ENDPOINTS.PRODUCTS, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export default async function Home() {
  const products: Product[] = await getProducts(); 
  const normalProduct = products.find(p => p.type === 'normal');

  // --- เริ่มกระบวนการคำนวณสถิติ (Aggregation) ---
  const mourningProduct = products.find((p: any) => p.type === 'mourning');

  // 1. ยอดขายรวม (Sold)
  const normalSold = normalProduct?.stock?.reduce((sum: number, s: any) => sum + (s.sold || 0), 0) || 0;
  const mourningSold = mourningProduct?.stock?.reduce((sum: number, s: any) => sum + (s.sold || 0), 0) || 0;
  
  const salesStats = {
    total: { sold: normalSold + mourningSold },
    normal: { sold: normalSold },
    mourning: { sold: mourningSold }
  };

  // 2. สต็อกคงเหลือแยกไซส์ (Stock Counts)
  const sizeStatsTotal = ALL_SIZES.map(size => {
    const n = normalProduct?.stock?.find((s: any) => s.size === size)?.quantity || 0;
    const m = mourningProduct?.stock?.find((s: any) => s.size === size)?.quantity || 0;
    return { size, count: n + m };
  });

  const sizeStatsNormal = ALL_SIZES.map(size => {
    const n = normalProduct?.stock?.find((s: any) => s.size === size)?.quantity || 0;
    return { size, count: n };
  });

  const sizeStatsMourning = ALL_SIZES.map(size => {
    const m = mourningProduct?.stock?.find((s: any) => s.size === size)?.quantity || 0;
    return { size, count: m };
  });

  // ส่งข้อมูลที่คำนวณเสร็จแล้วไปให้ Component แสดงผล
  return (
    <HomeView 
      salesStats={salesStats}
      sizeStatsTotal={sizeStatsTotal}
      sizeStatsNormal={sizeStatsNormal}
      sizeStatsMourning={sizeStatsMourning}
    />
  );
}