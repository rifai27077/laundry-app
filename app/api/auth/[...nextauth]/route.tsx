import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type User = {
  id: number;
  nama: string;
  username: string;
  password: string;
  id_outlet: number;
  role: string;
};

const users: User[] = [
  {
    id: 1,
    nama: "Bogor",
    username: "admin",
    password: "admin123",
    id_outlet: 1,
    role: "admin",
  },
  {
    id: 2,
    nama: "Kasir Bagus",
    username: "kasir",
    password: "kasir123",
    id_outlet: 1,
    role: "kasir",
  },
  {
    id: 3,
    nama: "Owner Laundry",
    username: "owner",
    password: "owner123",
    id_outlet: 1,
    role: "owner",
  },
];

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

        const user = users.find(
          (u) =>
            u.username === credentials.username &&
            u.password === credentials.password
        );

        if (!user) return null;

        // return user data allowed to pass into jwt
        return {
          id: user.id,
          nama: user.nama,
          username: user.username,
          id_outlet: user.id_outlet,
          role: user.role,
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
        token.id = (user as any).id;
        token.nama = (user as any).nama;
        token.username = (user as any).username;
        token.id_outlet = (user as any).id_outlet;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as number,
        nama: token.nama as string,
        username: token.username as string,
        id_outlet: token.id_outlet as number,
        role: token.role as string,
      };

      return session;
    },
  },

  session: { strategy: "jwt" },
});

export { handler as GET, handler as POST };
