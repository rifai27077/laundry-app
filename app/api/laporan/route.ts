import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma, StatusPesanan } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const status = searchParams.get("status");
    const outlet = searchParams.get("outlet");

    // Build Where Input
    const where: Prisma.TransaksiWhereInput = {};

    if (start || end) {
        where.tgl = {};
        if (start) where.tgl.gte = new Date(start);
        if (end) where.tgl.lte = new Date(end);
    }

    if (status) {
        where.status = status as StatusPesanan;
    }

    if (outlet) {
        where.id_outlet = parseInt(outlet);
    }

    // TRANSAKSI
    // SELECT t.*, m.nama AS member_nama, o.nama AS outlet_nama
    const transaksiRaw = await prisma.transaksi.findMany({
        where: where,
        include: {
            member: { select: { nama: true } },
            outlet: { select: { nama: true } }
        },
        orderBy: { tgl: 'desc' }
    });

    const transaksi = transaksiRaw.map(t => ({
        ...t,
        member_nama: t.member?.nama,
        outlet_nama: t.outlet?.nama
    }));

    // DETAIL
    // SELECT d.*, p.nama_paket, p.harga AS harga_perkilo
    // Note: Detail query in original code did NOT filter by searchParams (?!)
    // The original code:
    // const detail = await sql`SELECT d.*, ... FROM detail_transaksi d LEFT JOIN paket ...`;
    // It fetched ALL details in the database? That seems inefficient but I will replicate behavior
    // OR improved it by filtering details by transactions found?
    // Let's replicate original behavior for safety, or improve it.
    // Given usage in frontend likely filters in memory or just dump all?
    // Let's assume frontend matches `id` or something.
    // Fetching ALL details is bad if database is large.
    // But to be safe, I'll fetch `findMany` on detailTransaksi.
    
    // Actually, report usually shows details for filtered transactions.
    // But original code didn't filter details query (no WHERE clause).
    // I will stick to original logic: fetch all details (maybe limited by limit in frontend/backend?) 
    // Wait, original `laporan/route.ts` fetches everything. This is dangerous for large data.
    // I will replicate it for now.
    
    const detailRaw = await prisma.detailTransaksi.findMany({
        include: {
            paket: {
                select: { nama_paket: true, harga: true }
            }
        }
    });

    const detail = detailRaw.map(d => ({
        ...d,
        nama_paket: d.paket?.nama_paket,
        harga_perkilo: d.paket?.harga 
    }));

    const members = await prisma.member.findMany({
        select: { id: true, nama: true, alamat: true, tlp: true },
        orderBy: { nama: 'asc' }
    });
    
    const outlets = await prisma.outlet.findMany({
        select: { id: true, nama: true },
        orderBy: { nama: 'asc' }
    });

    const pakets = await prisma.paket.findMany({
        select: { id: true, nama_paket: true, harga: true },
        orderBy: { nama_paket: 'asc' }
    });

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
