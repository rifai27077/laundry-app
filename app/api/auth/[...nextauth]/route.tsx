import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@/lib/db";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null;

        // Ambil user
        const result = await sql`
          SELECT * FROM users WHERE username = ${credentials.username} LIMIT 1
        `;

        const user = result[0]; // Neon return array

        if (!user) return null;

        // Validasi password
        if (user.password !== credentials.password) return null;

        return {
          id: user.id,
          nama: user.nama,
          username: user.username,
          id_outlet: user.id_outlet,
          role: user.role, // ENUM auto string
        };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nama = user.nama;
        token.username = user.username;
        token.id_outlet = user.id_outlet;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        nama: token.nama,
        username: token.username,
        id_outlet: token.id_outlet,
        role: token.role,
      };
      return session;
    },
  },

  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
