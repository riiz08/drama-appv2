// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // ✅ PENTING untuk localhost

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log("🔐 Authorize called with:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          console.log("✅ Credentials valid");
          return {
            id: "admin-001",
            email: process.env.ADMIN_EMAIL!,
            name: "Admin",
            role: "ADMIN",
          };
        }

        console.log("❌ Invalid credentials");
        return null;
      },
    }),
  ],

  pages: {
    signIn: "/admin/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log("🎫 JWT callback triggered:", trigger);
      if (user) {
        token.id = user.id;
        token.role = user.role;
        console.log("✅ JWT token updated:", token);
      }
      return token;
    },
    async session({ session, token }) {
      console.log("📋 Session callback called");
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        console.log("✅ Session created:", session);
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  // ✅ Tambahkan ini untuk debugging
  debug: process.env.NODE_ENV === "development",
});
