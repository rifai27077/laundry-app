import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const totalCustomerArg = await prisma.member.count();
    const totalCustomer = totalCustomerArg;

    // Use queryRaw for complex group by SQL if preferred, or use Prisma groupBy.
    // status counts:
    const statusCounts = await prisma.transaksi.groupBy({
        by: ['status'],
        _count: { status: true }
    });
    
    // Transform to shape expected by frontend: { masuk: 0, diproses: 0, ... }
    const stats = {
        masuk: statusCounts.find(s => s.status === 'baru')?._count.status || 0,
        diproses: statusCounts.find(s => s.status === 'proses')?._count.status || 0,
        selesai: statusCounts.find(s => s.status === 'selesai')?._count.status || 0,
        diambil: statusCounts.find(s => s.status === 'diambil')?._count.status || 0,
        dibatalkan: statusCounts.find(s => s.status === 'dibatalkan')?._count.status || 0,
    };

    // Daily: 7 days
    // TO_CHAR(tgl, 'Dy') is Postgres specific. Prisma doesn't abstract this yet.
    // Use queryRaw.
    const daily = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(tgl, 'Dy') AS day,
        COUNT(*)::int AS masuk
      FROM transaksi
      WHERE tgl >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY MIN(tgl)
    `;

    // Monthly: 6 months
    const monthly = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(tgl, 'Mon') AS month,
        COUNT(*)::int AS masuk
      FROM transaksi
      WHERE tgl >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY MIN(tgl)
    `;

    // Daily Revenue from Pembayaran
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(tgl_bayar, 'Dy') AS day,
        SUM(jumlah_bayar)::int AS total
      FROM pembayaran
      WHERE tgl_bayar >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY MIN(tgl_bayar)
    `;

    // Monthly Revenue from Pembayaran
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(tgl_bayar, 'Mon') AS month,
        SUM(jumlah_bayar)::int AS total
      FROM pembayaran
      WHERE tgl_bayar >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY MIN(tgl_bayar)
    `;

    // Yearly Revenue from Pembayaran
    const yearlyRevenue = await prisma.$queryRaw`
      SELECT 
        EXTRACT(YEAR FROM tgl_bayar)::text AS year,
        SUM(jumlah_bayar)::int AS total
      FROM pembayaran
      GROUP BY year
      ORDER BY year
    `;

    // Total Transactions
    const totalTrans = await prisma.transaksi.count();

    // Specific Revenue Calculations (Actual Cash Flow)
    const now = new Date();
    
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [todayRevenue, monthRevenue, yearRevenue] = await Promise.all([
        prisma.pembayaran.aggregate({
            _sum: { jumlah_bayar: true },
            where: { tgl_bayar: { gte: startOfDay } }
        }),
        prisma.pembayaran.aggregate({
            _sum: { jumlah_bayar: true },
            where: { tgl_bayar: { gte: startOfMonth } }
        }),
        prisma.pembayaran.aggregate({
            _sum: { jumlah_bayar: true },
            where: { tgl_bayar: { gte: startOfYear } }
        })
    ]);

    return NextResponse.json({
      customers: totalCustomer,
      totalTrans,
      todayRevenue: todayRevenue._sum.jumlah_bayar || 0,
      monthRevenue: monthRevenue._sum.jumlah_bayar || 0,
      yearRevenue: yearRevenue._sum.jumlah_bayar || 0,
      stats,
      daily,
      monthly,
      dailyRevenue,
      monthlyRevenue,
      yearlyRevenue,
    });

  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
