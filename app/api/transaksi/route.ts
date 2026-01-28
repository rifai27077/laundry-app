import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NotificationService } from "@/lib/notification";

/* ========================================================
   GET — Ambil semua transaksi (dengan pagination)
======================================================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "count_today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const count = await prisma.transaksi.count({
        where: {
          tgl: {
            gte: today,
          },
        },
      });
      return NextResponse.json({ count });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      prisma.transaksi.findMany({
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaksi.count(),
    ]);

    return NextResponse.json({
      data: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
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
      const detail = await prisma.detailTransaksi.findMany({
        where: { id_transaksi: body.id_transaksi },
      });
      return NextResponse.json(detail);
    }

    // === 2) Create transaksi baru ===
    // Prepare detail items if exist and dedupe by paket id (sum qty)
    let items = Array.isArray(body.items) ? body.items : [];
    const itemMap: Record<number, { qty: number; keterangan?: string; harga: number }> = {};
    for (const it of items) {
      const idp = Number(it.id_paket);
      const qty = Number(it.qty) || 1;
      const harga = Number(it.harga) || 0;
      if (!itemMap[idp]) {
        itemMap[idp] = { qty, keterangan: it.keterangan, harga };
      } else {
        itemMap[idp].qty += qty;
        // keep existing keterangan/harga
      }
    }

    const detailData: Prisma.DetailTransaksiCreateWithoutTransaksiInput[] = Object.entries(itemMap).map(([idp, v]) => ({
      paket: { connect: { id: Number(idp) } },
      qty: v.qty,
      keterangan: v.keterangan,
      harga: v.harga,
    }));

    // Prevent paket being used in another active transaction
    const paketIds = Object.keys(itemMap).map((k) => Number(k));
    if (paketIds.length > 0) {
      const conflict = await prisma.detailTransaksi.findFirst({
        where: {
          id_paket: { in: paketIds },
          transaksi: { is: { status: { notIn: ['diambil', 'dibatalkan', 'selesai'] } } }
        },
        include: { transaksi: true }
      });
      if (conflict) {
        return NextResponse.json({ error: `Paket id=${conflict.id_paket} sudah digunakan di transaksi #${conflict.id_transaksi}` }, { status: 400 });
      }
    }

    // If id_member not provided but client sent member_input (name or phone), try to find or create member
    let id_member: number | null = body.id_member || null;
    if (!id_member && body.member_input) {
      const input = String(body.member_input).trim();
      // try find by phone exact match or name exact match
      let found = await prisma.member.findFirst({ where: { OR: [{ tlp: input }, { nama: input }] } });
      if (found) {
        id_member = found.id;
      } else {
        // decide whether input is phone (digits) or name
        const digits = input.replace(/[^0-9]/g, '');
        const maybePhone = digits.length >= 6; // heuristic
        const created = await prisma.member.create({ data: { nama: maybePhone ? '' : input, tlp: maybePhone ? input : undefined } });
        id_member = created.id;
      }
    }

    // compute subtotal and grand_total server-side as fallback
    const subtotal = detailData.reduce((s, d) => s + (Number((d as any).harga || 0) * Number((d as any).qty || 0)), 0);
    const diskonFraction = Number(body.diskon) || 0;
    const afterDiskon = subtotal - subtotal * diskonFraction;
    const pajak = Math.floor(afterDiskon * 0.1);
    const biaya_tambahan = Number(body.biaya_tambahan) || 0;
    const grand_total = Number(body.grand_total) && Number(body.grand_total) > 0 ? Number(body.grand_total) : Math.max(Math.floor(afterDiskon + pajak + biaya_tambahan), 0);

    const createData: any = {
      id_outlet: body.id_outlet,
      kode_invoice: body.kode_invoice,
      id_member: id_member,
      tgl: new Date(body.tgl), // Ensure Date type
      batas_waktu: body.batas_waktu ? new Date(body.batas_waktu) : null,
      tgl_bayar: body.tgl_bayar ? new Date(body.tgl_bayar) : null,
      biaya_tambahan: biaya_tambahan,
      diskon: diskonFraction,
      pajak: pajak,
      status: body.status,
      dibayar: body.dibayar,
      id_user: body.id_user || null,
      grand_total: grand_total,
      detailTransaksis: { create: detailData }
    };

    const newTrans = await prisma.transaksi.create({ 
      data: createData, 
      include: { 
        member: true,
        outlet: true 
      } 
    });

    // [NOTIFICATION TRIGGER] - Notify on New Order
    if (newTrans.member) {
        NotificationService.sendTransactionStatusUpdate(
            newTrans.member.tlp,
            newTrans.member.nama,
            newTrans.kode_invoice,
            newTrans.status
        ).catch(err => console.error("Initial Notification failed:", err));
    }

    return NextResponse.json({ id: newTrans.id });
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
      // Upsert detail
      // Note: Original SQL used ON CONFLICT (id_transaksi) DO UPDATE.
      // But unique_detail constraint is (id_transaksi, id_paket).
      // The original SQL `ON CONFLICT (id_transaksi)` seems wrong if uniqueness is composite?
      // Wait, original SQL:
      // ON CONFLICT (id_transaksi) DO UPDATE 
      // This implies id_transaksi was unique? 
      // But table definition says: ADD CONSTRAINT unique_detail UNIQUE(id_transaksi, id_paket);
      
      // If the intent is to update IF (id_transaksi, id_paket) exists, we need matching where clause.
      // Prisma upsert requires a unique constraint.
      
      // Let's check `unique_detail` map in schema.prisma: @@unique([id_transaksi, id_paket], map: "unique_detail")
      // Prisma Client generates compound unique input for this.

      await prisma.detailTransaksi.upsert({
        where: {
          id_transaksi_id_paket: {
             id_transaksi: body.id_transaksi,
             id_paket: body.id_paket
          }
        },
        update: {
          qty: body.qty ?? 1,
          keterangan: body.keterangan,
          harga: body.harga
        },
        create: {
          id_transaksi: body.id_transaksi,
          id_paket: body.id_paket,
          qty: body.qty ?? 1,
          keterangan: body.keterangan,
          harga: body.harga
        }
      });

      return NextResponse.json({ success: true });
    }

    // === 2) Update transaksi utama & Items ===
    if (body.id) {
        // [NOTIFICATION CHECK]: Fetch existing status before update
        const currentTrans = await prisma.transaksi.findUnique({
            where: { id: body.id },
            include: { member: true }
        });

        if (!currentTrans) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });

        let shouldNotify = false;
        if (body.status && body.status !== currentTrans.status) {
            shouldNotify = true;
        }

        // Prepare items if provided
        let itemUpdateData = {};
        if (Array.isArray(body.items)) {
            // Dedupe and prepare
            const itemMap: Record<number, { qty: number; keterangan?: string; harga: number }> = {};
            for (const it of body.items) {
                const idp = Number(it.id_paket);
                const qty = Number(it.qty) || 1;
                const harga = Number(it.harga) || 0;
                if (!itemMap[idp]) {
                    itemMap[idp] = { qty, keterangan: it.keterangan, harga };
                } else {
                    itemMap[idp].qty += qty;
                }
            }

            const detailData = Object.entries(itemMap).map(([idp, v]) => ({
                id_paket: Number(idp),
                qty: v.qty,
                keterangan: v.keterangan,
                harga: v.harga,
            }));

            // We will use a transaction to delete and recreate details
            await prisma.$transaction([
                prisma.detailTransaksi.deleteMany({ where: { id_transaksi: body.id } }),
                prisma.detailTransaksi.createMany({
                    data: detailData.map(d => ({
                        id_transaksi: body.id,
                        ...d
                    }))
                })
            ]);
        }

        const updated = await prisma.transaksi.update({
            where: { id: body.id },
            data: {
                id_outlet: body.id_outlet,
                kode_invoice: body.kode_invoice,
                id_member: body.id_member,
                tgl: body.tgl ? new Date(body.tgl) : undefined,
                batas_waktu: body.batas_waktu ? new Date(body.batas_waktu) : undefined,
                tgl_bayar: body.tgl_bayar ? new Date(body.tgl_bayar) : undefined,
                biaya_tambahan: body.biaya_tambahan,
                diskon: body.diskon,
                pajak: body.pajak,
                status: body.status,
                dibayar: body.dibayar,
                id_user: body.id_user,
                grand_total: body.grand_total,
            }
        });

        // [NOTIFICATION TRIGGER]
        if (shouldNotify && currentTrans.member) {
            NotificationService.sendTransactionStatusUpdate(
                currentTrans.member.tlp,
                currentTrans.member.nama,
                updated.kode_invoice,
                updated.status
            ).catch(err => console.error("Update Notification failed:", err));
        }

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Missing ID" }, { status: 400 });

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

    // Prisma handles cascading deletes if configured in schema or database.
    // In schema.prisma: `transaksi Transaksi? @relation(fields: [id_transaksi], references: [id], onDelete: Cascade)`
    // So we just need to delete the transaction.
    
    await prisma.transaksi.delete({
        where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE transaksi error:", error);

    if (error.code === 'P2003') { // Foreign key constraint failed
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
