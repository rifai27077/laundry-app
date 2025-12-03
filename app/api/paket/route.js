import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET — ambil semua paket
export async function GET() {
    try {
        const result = await sql`
            SELECT id, id_outlet, jenis, nama_paket, harga
            FROM paket
            ORDER BY id DESC
        `;
        return NextResponse.json(result);
    } catch (error) {
        console.error("GET Paket Error:", error);
        return NextResponse.json(
        { error: "Gagal mengambil data paket" },
        { status: 500 }
        );
    }
}

// POST — tambah paket
export async function POST(req) {
    try {
        const body = await req.json();
        const { id_outlet, jenis, nama_paket, harga } = body;

        await sql`
            INSERT INTO paket (id_outlet, jenis, nama_paket, harga)
            VALUES (${id_outlet}, ${jenis}, ${nama_paket}, ${harga})
        `;

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
export async function PUT(req) {
    try {
        const body = await req.json();
        const { id, id_outlet, jenis, nama_paket, harga } = body;

        await sql`
            UPDATE paket
            SET id_outlet=${id_outlet}, jenis=${jenis}, nama_paket=${nama_paket}, harga=${harga}
            WHERE id=${id}
        `;

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
export async function DELETE(req) {
    try {
        const { id } = await req.json();

        await sql`
            DELETE FROM paket WHERE id=${id}
        `;

        return NextResponse.json({ message: "Paket berhasil dihapus" });
    } catch (error) {
        console.error("DELETE Paket Error:", error);
        return NextResponse.json(
        { error: "Gagal menghapus paket" },
        { status: 500 }
        );
    }
}
