import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// =======================
// GET — ambil semua outlet
// =======================
export async function GET() {
    try {
        const result = await sql`
            SELECT id, nama, alamat, tlp
            FROM outlet
            ORDER BY id DESC
        `;
        return NextResponse.json(result);
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

        await sql`
            INSERT INTO outlet (nama, alamat, tlp)
            VALUES (${nama}, ${alamat}, ${tlp})
        `;

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

        await sql`
            UPDATE outlet
            SET nama = ${nama}, alamat = ${alamat}, tlp = ${tlp}
            WHERE id = ${id}
        `;

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

        await sql`
            DELETE FROM outlet WHERE id = ${id}
        `;

        return NextResponse.json({ message: "Outlet berhasil dihapus" });
    } catch (error: unknown) {
        console.error("DELETE Outlet Error:", error);

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code: string }).code === "23503"
        ) {
            return NextResponse.json(
                {
                    error: "Outlet tidak bisa dihapus karena masih memiliki paket.",
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
