import ProductsView from '@/components/ProductsView';
import API_ENDPOINTS from '@/lib/api';
import { Product } from '@/types';

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

export default async function ProductsPage() {
  const products = await getProducts();

  return (
      <ProductsView initialProducts={products} />
  );
}