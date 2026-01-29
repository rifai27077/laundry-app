import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MetodePembayaran, StatusBayar } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id_transaksi, jumlah_bayar, metode_pembayaran, keterangan } = body;

    if (!id_transaksi || !jumlah_bayar) {
      return NextResponse.json(
        { error: "ID Transaksi dan Jumlah Bayar wajib diisi" },
        { status: 400 }
      );
    }

    // 1. Simpan data pembayaran
    await prisma.pembayaran.create({
      data: {
        id_transaksi: Number(id_transaksi),
        jumlah_bayar: Number(jumlah_bayar),
        metode_pembayaran: metode_pembayaran as MetodePembayaran, // Ensure enum match
        keterangan: keterangan
      }
    });

    // 2. Cek total pembayaran saat ini
    const agg = await prisma.pembayaran.aggregate({
      _sum: {
        jumlah_bayar: true
      },
      where: {
        id_transaksi: Number(id_transaksi)
      }
    });
    const totalBayar = agg._sum.jumlah_bayar || 0;

    // 3. Ambil grand_total transaksi dan id_member
    const trx = await prisma.transaksi.findUnique({
      where: { id: Number(id_transaksi) },
      select: { grand_total: true, id_member: true }
    });
    
    if (!trx) {
       return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const grand_total = trx.grand_total || 0;

    // 4. Update status dibayar jika lunas
    let statusBayar: StatusBayar = 'belum_dibayar';
    if (totalBayar >= grand_total) {
        statusBayar = 'dibayar';
    }

    await prisma.transaksi.update({
      where: { id: Number(id_transaksi) },
      data: { dibayar: statusBayar }
    });

    // 5. [LOYALTY] Award Points if Fully Paid
    if (statusBayar === 'dibayar' && trx.id_member) {
        const pointsAwarded = Math.floor(grand_total / 10000);
        if (pointsAwarded > 0) {
            await prisma.member.update({
                where: { id: trx.id_member },
                data: { poin: { increment: pointsAwarded } }
            });
        }
    }

    // 6. [BALANCE] Handle Balance Payment
    if (metode_pembayaran === 'saldo') {
        if (!trx.id_member) {
            throw new Error("Pembayaran saldo hanya bisa untuk Member");
        }
        // Deduct from member balance
        // Note: Validation of sufficiency should ideally happen before PAYMENT creation 
        // but for now we follow the flow.
        await prisma.member.update({
            where: { id: trx.id_member },
            data: { saldo: { decrement: jumlah_bayar } }
        });
    }

    return NextResponse.json({ 
        success: true, 
        message: "Pembayaran berhasil disimpan",
        status_bayar: statusBayar,
        total_terbayar: totalBayar
    });

  } catch (error) {
    console.error("POST bayar error:", error);
    return NextResponse.json({ error: "Gagal memproses pembayaran" }, { status: 500 });
  }
}
