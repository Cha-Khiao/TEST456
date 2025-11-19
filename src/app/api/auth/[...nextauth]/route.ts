// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const authOptions: AuthOptions = {
  providers: [
    // 1. Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // ✅ Google จะส่งชื่อมาให้อยู่แล้ว (profile.name) NextAuth จัดการให้อัตโนมัติ
    }),
    
    // 2. เบอร์โทรศัพท์ (Credentials)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Identifier", type: "text" },
        password: { label: "Password", type: "password" },
        isUserLogin: { label: "isUserLogin", type: "text" }
      },
      async authorize(credentials) {
        const { identifier, password, isUserLogin } = credentials || {};

        try {
          // ยิงไป Backend (ซึ่งตอนนี้ Backend ฉลาดพอที่จะสร้าง User ให้ถ้าไม่มี)
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password, isUserLogin })
          });

          const user = await res.json();

          if (!res.ok) {
            throw new Error(user.error || "เข้าสู่ระบบไม่สำเร็จ");
          }

          // ✅ Return ข้อมูลเข้า Session
          // user.name ที่ Backend ส่งมาคือ:
          // - ถ้าเป็น User ใหม่/เก่า -> เป็นเบอร์โทร
          // - ถ้าเป็น Admin -> เป็น "Administrator"
          return {
            id: user.id,
            name: user.name,
            role: user.role,
            accessToken: user.token
          };

        } catch (error: any) {
          throw new Error(error.message);
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login', 
  },
  callbacks: {
  async jwt({ token, user }: any) {
    if (user) {
      token.role = user.role;
      token.id = user.id;
      token.accessToken = user.accessToken; // ✅ ฝังลง JWT
    }
    return token;
  },
  async session({ session, token }: any) {
    if (session.user) {
      // @ts-ignore
      session.user.role = token.role;
      // @ts-ignore
      session.user.id = token.id;
      // @ts-ignore
      session.user.accessToken = token.accessToken; // ✅ ฝังลง Session เพื่อให้ Client เรียกใช้
    }
    return session;
  }
},
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };