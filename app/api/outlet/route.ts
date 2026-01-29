import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// =======================
// GET — ambil semua outlet (dengan pagination)
// =======================
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.outlet.findMany({
                orderBy: { id: "desc" },
                skip,
                take: limit,
            }),
            prisma.outlet.count(),
        ]);

        return NextResponse.json({
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error("GET Outlet Error:", error);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}

// =======================
// POST — tambah outlet
// =======================
export async function POST(req: Request) {
    try {
        const { nama, alamat, tlp } = await req.json();

        await prisma.outlet.create({
            data: { nama, alamat, tlp }
        });

        return NextResponse.json({ message: "Outlet berhasil ditambahkan" });
    } catch (error) {
        console.error("POST Outlet Error:", error);
        return NextResponse.json({ error: "Gagal menambah outlet" }, { status: 500 });
    }
}

// =======================
// PUT — update outlet
// =======================
export async function PUT(req: Request) {
    try {
        const { id, nama, alamat, tlp } = await req.json();

        await prisma.outlet.update({
            where: { id: Number(id) },
            data: { nama, alamat, tlp }
        });

        return NextResponse.json({ message: "Outlet berhasil diupdate" });
    } catch (error) {
        console.error("PUT Outlet Error:", error);
        return NextResponse.json({ error: "Gagal mengupdate outlet" }, { status: 500 });
    }
}

// =======================
// DELETE — hapus outlet
// =======================
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        await prisma.outlet.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ message: "Outlet berhasil dihapus" });
    } catch (error: any) {
        console.error("DELETE Outlet Error:", error);

        if (error.code === 'P2003') { // Foreign key constraint
            return NextResponse.json(
                {
                    error: "Outlet tidak bisa dihapus karena masih memiliki paket / relasi lain.",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Gagal menghapus outlet" },
            { status: 500 }
        );
    }
}
