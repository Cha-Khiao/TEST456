// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password, isUserLogin })
          });

          const user = await res.json();

          if (!res.ok) {
            throw new Error(user.error || "เข้าสู่ระบบไม่สำเร็จ");
          }

          // ✅ จุดที่ 1: รับ Token จาก Backend (user.token) มาตั้งชื่อใหม่ว่า accessToken
          if (user.token) {
            return {
              id: user.id,
              name: user.name,
              email: null,
              role: user.role,
              accessToken: user.token, // 👈 สำคัญมาก! ต้องเก็บตรงนี้
            };
          }
          
          return null;

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
    // ✅ จุดที่ 2: เอา accessToken ยัดใส่ JWT Token
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.accessToken = user.accessToken; // 👈 รับช่วงต่อมา
      }
      return token;
    },
    // ✅ จุดที่ 3: เอา accessToken จาก JWT ยัดใส่ Session (เพื่อให้หน้าเว็บเรียกใช้ได้)
    async session({ session, token }: any) {
      if (session.user) {
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.accessToken = token.accessToken; // 👈 ส่งไม้ต่อให้ Frontend
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };