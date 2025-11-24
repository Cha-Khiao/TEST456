import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { Metadata } from 'next';
import { Sarabun } from 'next/font/google';
import Providers from '@/components/Providers';
import BootstrapClient from '@/components/BootstrapClient';
import BackToTop from '@/components/BackToTop';
import ClientLayout from '@/components/ClientLayout';
import { CartProvider } from '@/context/CartContext';

const sarabun = Sarabun({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['thai', 'latin'],
  variable: '--font-sarabun',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sisaket Charity - ร่วมเป็นส่วนหนึ่งในการให้',
  description: 'สั่งจองเสื้อที่ระลึก 243 ปี จังหวัดศรีสะเกษ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} font-sans d-flex flex-column min-vh-100`}>
        <Providers>
          <CartProvider>
             <ClientLayout>
                {children}
             </ClientLayout>
          </CartProvider>

          <BackToTop />
          <BootstrapClient />
        </Providers>
      </body>
    </html>
  );
}