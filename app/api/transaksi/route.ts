import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/* ========================================================
   GET — Ambil semua transaksi
======================================================== */
export async function GET() {
  try {
    const rows = await sql`
      SELECT *
      FROM transaksi
      ORDER BY id DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET transaksi error:", error);
    return NextResponse.json({ error: "Gagal mengambil transaksi" }, { status: 500 });
  }
}

/* ========================================================
   POST — 
   - Create transaksi (jika body tidak ada id_transaksi)
   - Ambil detail transaksi (jika body.id_transaksi ada)
======================================================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // === 1) Ambil detail transaksi untuk modal Edit ===
    if (body.id_transaksi) {
      const detail = await sql`
        SELECT * FROM detail_transaksi
        WHERE id_transaksi = ${body.id_transaksi}
      `;
      return NextResponse.json(detail);
    }

    // === 2) Create transaksi baru ===
    const result = await sql`
      INSERT INTO transaksi (
        id_outlet, kode_invoice, id_member, tgl, batas_waktu, tgl_bayar,
        biaya_tambahan, diskon, pajak, status, dibayar, id_user, grand_total
      )
      VALUES (
        ${body.id_outlet}, ${body.kode_invoice}, ${body.id_member},
        ${body.tgl}, ${body.batas_waktu}, ${body.tgl_bayar},
        ${body.biaya_tambahan}, ${body.diskon}, ${body.pajak},
        ${body.status}, ${body.dibayar}, ${body.id_user}, ${body.grand_total}
      )
      RETURNING id
    `;

    return NextResponse.json({ id: result[0].id });
  } catch (error) {
    console.error("POST transaksi error:", error);
    return NextResponse.json({ error: "Gagal menambah transaksi" }, { status: 500 });
  }
}

/* ========================================================
   PUT —
   - Update transaksi (jika ada body.id)
   - Simpan detail transaksi (jika ada body.id_transaksi)
======================================================== */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // === 1) Simpan DETAIL transaksi ===
    if (body.id_transaksi && body.id_paket) {
      await sql`
        INSERT INTO detail_transaksi (id_transaksi, id_paket, qty, keterangan, harga)
        VALUES (${body.id_transaksi}, ${body.id_paket}, ${body.qty ?? 1}, ${body.keterangan}, ${body.harga})
        ON CONFLICT (id_transaksi) DO UPDATE SET
          id_paket = EXCLUDED.id_paket,
          qty = EXCLUDED.qty,
          keterangan = EXCLUDED.keterangan,
          harga = EXCLUDED.harga
      `;
      return NextResponse.json({ success: true });
    }

    // === 2) Update transaksi utama ===
    await sql`
      UPDATE transaksi SET
        id_outlet = ${body.id_outlet},
        kode_invoice = ${body.kode_invoice},
        id_member = ${body.id_member},
        tgl = ${body.tgl},
        batas_waktu = ${body.batas_waktu},
        tgl_bayar = ${body.tgl_bayar},
        biaya_tambahan = ${body.biaya_tambahan},
        diskon = ${body.diskon},
        pajak = ${body.pajak},
        status = ${body.status},
        dibayar = ${body.dibayar},
        id_user = ${body.id_user},
        grand_total = ${body.grand_total}
      WHERE id = ${body.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT transaksi error:", error);
    return NextResponse.json({ error: "Gagal update transaksi" }, { status: 500 });
  }
}

/* ========================================================
   DELETE — Hapus transaksi by id
======================================================== */
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    // 1️⃣ hapus detail terlebih dahulu
    await sql`
      DELETE FROM detail_transaksi
      WHERE id_transaksi = ${id}
    `;

    // 2️⃣ baru hapus transaksi
    await sql`
      DELETE FROM transaksi
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("DELETE transaksi error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "23503"
    ) {
      return NextResponse.json(
        { error: "Transaksi tidak bisa dihapus karena masih memiliki detail." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal menghapus transaksi" },
      { status: 500 }
    );
  }
}
