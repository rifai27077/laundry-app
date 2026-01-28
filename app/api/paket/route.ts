import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JenisPaket } from "@prisma/client";

// GET — ambil semua paket (dengan pagination)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const [pakets, total, busyDetails] = await Promise.all([
            prisma.paket.findMany({ 
                orderBy: { id: "desc" },
                skip,
                take: limit
            }),
            prisma.paket.count(),
            prisma.detailTransaksi.findMany({
                where: {
                    transaksi: {
                        status: { in: ['baru', 'proses'] }
                    }
                },
                select: { id_paket: true }
            })
        ]);

        const busyIds = new Set(busyDetails.map(d => d.id_paket));

        const data = pakets.map(p => ({
            ...p,
            is_used: busyIds.has(p.id)
        }));

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
        console.error("DEBUG_NEON_ERR: GET Paket Error:", error);
        return NextResponse.json(
        { error: "Gagal mengambil data paket" },
        { status: 500 }
        );
    }
}

// POST — tambah paket
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id_outlet, jenis, nama_paket, harga } = body;

        await prisma.paket.create({
            data: {
                id_outlet: id_outlet,
                jenis: jenis as JenisPaket,
                nama_paket: nama_paket,
                harga: harga
            }
        });

        return NextResponse.json({ message: "Paket berhasil ditambahkan" });
    } catch (error) {
        console.error("POST Paket Error:", error);
        return NextResponse.json(
        { error: "Gagal menambah paket" },
        { status: 500 }
        );
    }
}

// PUT — update paket
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, id_outlet, jenis, nama_paket, harga } = body;

        await prisma.paket.update({
            where: { id: id },
            data: {
                id_outlet: id_outlet,
                jenis: jenis as JenisPaket,
                nama_paket: nama_paket,
                harga: harga
            }
        });

        return NextResponse.json({ message: "Paket berhasil diupdate" });
    } catch (error) {
        console.error("PUT Paket Error:", error);
        return NextResponse.json(
        { error: "Gagal mengupdate paket" },
        { status: 500 }
        );
    }
}

// DELETE — hapus paket
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        await prisma.paket.delete({
            where: { id: id }
        });

        return NextResponse.json({ message: "Paket berhasil dihapus" });
    } catch (error) {
        console.error("DELETE Paket Error:", error);
        return NextResponse.json(
        { error: "Gagal menghapus paket" },
        { status: 500 }
        );
    }
}
