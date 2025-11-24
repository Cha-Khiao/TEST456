import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // เช็คสิทธิ์ Admin เฉพาะหน้าที่ขึ้นต้นด้วย /admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token;
      // @ts-ignore
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url)); 
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // ต้องมี Token ถึงจะผ่านได้
    },
  }
);

export const config = {
  matcher: [
    // 🔒 ฝั่งลูกค้า (ต้อง Login)
    "/dashboard/:path*",
    "/order/:path*", 
    "/orders/:path*",
    
    // ฝั่ง Admin (ระบุเจาะจง เพื่อยกเว้น /admin/login)
    "/admin/orders/:path*",
    "/admin/products/:path*",
    "/admin/stock/:path*",
  ],
};