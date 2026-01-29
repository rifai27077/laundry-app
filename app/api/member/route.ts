import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { JenisKelamin } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.member.findMany({
                orderBy: { id: "desc" },
                take: limit,
                skip: skip
            }),
            prisma.member.count(),
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
        console.error("Error GET member:", error);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}

export async function POST(req: Request) {
  try {
    const { nama, tlp, jenis_kelamin, alamat } = await req.json();

    await prisma.member.create({
        data: {
            nama, 
            tlp, 
            jenis_kelamin: jenis_kelamin as JenisKelamin, 
            alamat
        }
    });

    return NextResponse.json({ message: "Pelanggan berhasil ditambahkan" });
  } catch (error) {
    console.error("POST member error:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan pelanggan" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
    try {
        const { id, nama, tlp, jenis_kelamin, alamat } = await req.json();
        
        await prisma.member.update({
            where: { id: Number(id) },
            data: {
                nama,
                tlp,
                jenis_kelamin: jenis_kelamin as JenisKelamin,
                alamat
            }
        });

        return NextResponse.json({ message: "Data pelanggan berhasil diupdate" });
    } catch (error) {
        console.error("PUT member error:", error);
        return NextResponse.json({ error: "Gagal mengupdate pelanggan" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        await prisma.member.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ message: "Pelanggan berhasil dihapus" });
    } catch (error: any) {
        console.error("DELETE member error:", error);
        
        if (error.code === 'P2003') {
            return NextResponse.json(
                { error: "Member tidak bisa dihapus karena masih memiliki riwayat transaksi." },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: "Gagal menghapus pelanggan" }, { status: 500 });
    }
}
