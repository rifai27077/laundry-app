import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Ambil detail berdasarkan id_transaksi
export async function POST(req: Request) {
  try {
    const { id_transaksi } = await req.json();

    const result = await sql`
      SELECT * FROM detail_transaksi WHERE id_transaksi = ${id_transaksi}
    `;

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

    await sql`
      INSERT INTO detail_transaksi (id_transaksi, id_paket, qty, keterangan)
      VALUES (${id_transaksi}, ${id_paket}, ${qty}, ${keterangan})
    `;

    return NextResponse.json({ message: "Detail ditambahkan" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal menambahkan detail" },
      { status: 500 }
    );
  }
}