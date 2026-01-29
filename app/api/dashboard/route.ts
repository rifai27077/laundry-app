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

    // Daily Transactions
    const daily = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(tgl, '%a') AS day,
        COUNT(id) AS total
      FROM transaksi
      WHERE tgl >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY day
      ORDER BY MIN(tgl)
    `;

    // Monthly Transactions
    const monthly = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(tgl, '%b') AS month,
        COUNT(id) AS total
      FROM transaksi
      WHERE tgl >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY MIN(tgl)
    `;

    // Daily Revenue from Pembayaran
    const dailyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(tgl_bayar, '%a') AS day,
        SUM(jumlah_bayar) AS total
      FROM pembayaran
      WHERE tgl_bayar >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY day
      ORDER BY MIN(tgl_bayar)
    `;

    // Monthly Revenue from Pembayaran
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(tgl_bayar, '%b') AS month,
        SUM(jumlah_bayar) AS total
      FROM pembayaran
      WHERE tgl_bayar >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month
      ORDER BY MIN(tgl_bayar)
    `;

    // Yearly Revenue from Pembayaran
    const yearlyRevenue = await prisma.$queryRaw`
      SELECT 
        YEAR(tgl_bayar) AS year,
        SUM(jumlah_bayar) AS total
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

    // Helper to convert BigInt to Number for JSON serialization
    const serializeRaw = (arr: any[]) => arr.map(item => {
        const newItem = { ...item };
        for (const key in newItem) {
            if (typeof newItem[key] === 'bigint') {
                newItem[key] = Number(newItem[key]);
            }
        }
        return newItem;
    });

    return NextResponse.json({
      customers: totalCustomer,
      totalTrans,
      todayRevenue: todayRevenue._sum.jumlah_bayar || 0,
      monthRevenue: monthRevenue._sum.jumlah_bayar || 0,
      yearRevenue: yearRevenue._sum.jumlah_bayar || 0,
      stats,
      daily: serializeRaw(daily as any[]),
      monthly: serializeRaw(monthly as any[]),
      dailyRevenue: serializeRaw(dailyRevenue as any[]),
      monthlyRevenue: serializeRaw(monthlyRevenue as any[]),
      yearlyRevenue: serializeRaw(yearlyRevenue as any[]),
    });

  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
