// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true, // ✅ อนุญาตไฟล์ SVG (รูปการ์ตูนส่วนใหญ่เป็น SVG)
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // ✅ อนุญาตรูปจาก Cloudinary (Backend)
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // ✅ อนุญาตรูป Profile Google
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // ✅ เผื่อรูป Mockup
        pathname: '/**',
      },
    ],
  },
  // ป้องกันปัญหา CORS เวลา dev บางกรณี
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`, 
      },
    ];
  },
};

export default nextConfig;