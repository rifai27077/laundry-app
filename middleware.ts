import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = req.nextUrl;

    // ====== Jika belum login ======
    if (!token) {
        if (
            pathname.startsWith("/admin") ||
            pathname.startsWith("/dashboard/kasir") ||
            pathname.startsWith("/dashboard/owner")
        ) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
        return NextResponse.next();
    }

    // Ambil role dari token
    const role = token.role;

    // ====== Proteksi Admin ======
    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // ====== Proteksi Kasir ======
    if (pathname.startsWith("/dashboard/kasir") && role !== "kasir") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // ====== Proteksi Owner ======
    if (pathname.startsWith("/dashboard/owner") && role !== "owner") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/dashboard/kasir/:path*",
        "/dashboard/owner/:path*",
    ],
};
