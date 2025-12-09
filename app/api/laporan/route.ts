import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const status = searchParams.get("status");
    const outlet = searchParams.get("outlet");

    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (start) {
        conditions.push(`t.tgl >= $${values.length + 1}`);
        values.push(start);
    }

    if (end) {
        conditions.push(`t.tgl <= $${values.length + 1}`);
        values.push(end);
    }

    if (status) {
        conditions.push(`t.status = $${values.length + 1}`);
        values.push(status);
    }

    if (outlet) {
        conditions.push(`t.id_outlet = $${values.length + 1}`);
        values.push(outlet);
    }

    const where = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    // TRANSAKSI
    const transaksi = await sql.query(
    `
        SELECT 
        t.*,
        m.nama AS member_nama,
        o.nama AS outlet_nama
        FROM transaksi t
        LEFT JOIN member m ON m.id = t.id_member
        LEFT JOIN outlet o ON o.id = t.id_outlet
        ${where}
        ORDER BY t.tgl DESC
    `,
    values
    );

    // DETAIL
    const detail = await sql`
        SELECT 
            d.*, 
            p.nama_paket,
            p.harga AS harga_perkilo
        FROM detail_transaksi d
        LEFT JOIN paket p ON p.id = d.id_paket
    `;

    const members = await sql`SELECT id, nama, alamat, tlp FROM member ORDER BY nama`;
    const outlets = await sql`SELECT id, nama FROM outlet ORDER BY nama`;
    const pakets = await sql`SELECT id, nama_paket, harga FROM paket ORDER BY nama_paket`;

    return NextResponse.json({
        transaksi,
        detail,
        members,
        outlets,
        pakets,
    });

    } catch (err: unknown) {
        console.error("ERROR /api/laporan:", err);

        const message =
            err instanceof Error ? err.message : "Unexpected server error";

        return NextResponse.json({ error: message }, { status: 500 });
    }

}
