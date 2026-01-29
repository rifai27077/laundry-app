import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Ambil detail berdasarkan id_transaksi
export async function POST(req: Request) {
  try {
    const { id_transaksi } = await req.json();

    const result = await prisma.detailTransaksi.findMany({
        where: { id_transaksi: Number(id_transaksi) },
        include: { paket: true } 
    });

    // Flatten if needed to match previous structure, or return as is.
    // Previous SQL: SELECT * FROM detail_transaksi
    // Prisma result structure is similar but typed.
    // To be safe, we can just return result.
    // Note: The UI likely expects flat fields. Prisma returns objects.
    // The previous GET route for report joined with packet. 
    // This one just selects specific detail. 
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil detail transaksi" },
      { status: 500 }
    );
  }
}

// Tambah detail
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id_transaksi, id_paket, qty, keterangan } = body;

    await prisma.detailTransaksi.create({
        data: {
            id_transaksi: Number(id_transaksi),
            id_paket: Number(id_paket),
            qty: Number(qty) || 1,
            keterangan: keterangan
        }
    });

    return NextResponse.json({ message: "Detail ditambahkan" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menambahkan detail" },
      { status: 500 }
    );
  }
}