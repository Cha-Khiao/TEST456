// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // เช็คว่าเป็น Admin ไหม? (ในที่นี้สมมติว่าถ้า Login แล้วคือเข้าได้หมดไปก่อน)
    // ถ้าคุณมี field 'role' ใน session สามารถเช็ค req.nextauth.token?.role === 'admin' ได้
    
    // ตัวอย่าง: ถ้าไม่ใช่ Admin ให้เด้งกลับไปหน้าแรก
    // if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
    //   return NextResponse.redirect(new URL("/", req.url));
    // }
  },
  {
    callbacks: {
      // ต้อง Login ก่อนถึงจะผ่าน Middleware นี้ได้
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",      // User Dashboard
    "/order/create/:path*",   // สั่งซื้อ
    "/payment/:path*",        // แจ้งโอน
  ],
};