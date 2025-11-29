import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // Dummy auto-increment id
  const newMember = {
    id: Math.floor(Math.random() * 9999),
    nama: body.nama,
    alamat: body.alamat,
    jenis_kelamin: body.jenis_kelamin,
    tlp: body.tlp,
  };

  return NextResponse.json({
    message: "Registrasi berhasil (dummy)!",
    data: newMember,
  });
}

export async function GET() {
  // Dummy customer data + statistik
  const member = {
    customer: {
      id: 12,
      nama: "Budi Hartanto",
      alamat: "Jl. Mawar No. 21",
      jenis_kelamin: "L",
      tlp: "08123456789",
    },

    statistik: {
      total_transaksi: 18,
      total_kilo: 92.5,
      total_bayar: 1860000,
      terakhir_status: "Selesai",
    },

    riwayat: [
      { id: 101, tanggal: "2025-01-19", kilo: 5, bayar: 40000, status: "Selesai" },
      { id: 102, tanggal: "2025-01-21", kilo: 3, bayar: 25000, status: "Proses" },
      { id: 103, tanggal: "2025-01-22", kilo: 6.4, bayar: 51200, status: "Proses" },
    ]
  };

  return NextResponse.json(member);
}
