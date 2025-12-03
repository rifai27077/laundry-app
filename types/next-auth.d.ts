import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "./role"

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string | number;
        nama: string;
        username: string;
        id_outlet: number;
        role: UserRole;
    }

    interface Session {
        user: {
        id: string | number;
        nama: string;
        username: string;
        id_outlet: number;
        role: UserRole;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string | number;
        nama: string;
        username: string;
        id_outlet: number;
        role: UserRole;
    }
}
