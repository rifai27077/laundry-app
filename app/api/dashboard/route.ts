import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const totalCustomer = await sql`
      SELECT COUNT(*) AS total FROM member
    `;

    const status = await sql`
      SELECT 
        SUM(CASE WHEN status = 'baru' THEN 1 ELSE 0 END) AS masuk,
        SUM(CASE WHEN status = 'proses' THEN 1 ELSE 0 END) AS diproses,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS selesai,
        SUM(CASE WHEN status = 'diambil' THEN 1 ELSE 0 END) AS diambil,
        SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) AS dibatalkan
      FROM transaksi
    `;

    const daily = await sql`
      SELECT 
        TO_CHAR(tgl, 'Dy') AS day,
        COUNT(*) AS masuk
      FROM transaksi
      WHERE tgl >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY MIN(tgl)
    `;

    const monthly = await sql`
      SELECT 
        TO_CHAR(tgl, 'Mon') AS month,
        COUNT(*) AS masuk
      FROM transaksi
      WHERE tgl >= NOW() - INTERVAL '6 months'
      GROUP BY month
      ORDER BY MIN(tgl)
    `;

    const dailyRevenue = await sql`
      SELECT 
        TO_CHAR(tgl_bayar, 'Dy') AS day,
        SUM(grand_total) AS total
      FROM transaksi
      WHERE tgl_bayar >= NOW() - INTERVAL '7 days'
        AND dibayar = 'dibayar'
      GROUP BY day
      ORDER BY MIN(tgl_bayar)
    `;

    const monthlyRevenue = await sql`
      SELECT 
        TO_CHAR(tgl_bayar, 'Mon') AS month,
        SUM(grand_total) AS total
      FROM transaksi
      WHERE tgl_bayar >= NOW() - INTERVAL '6 months'
        AND dibayar = 'dibayar'
      GROUP BY month
      ORDER BY MIN(tgl_bayar)
    `;

    const yearlyRevenue = await sql`
      SELECT 
        EXTRACT(YEAR FROM tgl_bayar)::text AS year,
        SUM(grand_total) AS total
      FROM transaksi
      WHERE dibayar = 'dibayar'
      GROUP BY year
      ORDER BY year
    `;

    return NextResponse.json({
      customers: Number(totalCustomer[0].total),
      stats: status[0],
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
