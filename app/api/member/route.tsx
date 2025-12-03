import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        const result = await sql`
            SELECT id, nama, tlp, jenis_kelamin, alamat
            FROM member
            ORDER BY id DESC
        `;

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error GET member:", error);
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
    }
}

export async function POST(req: Request) {
  try {
    const { nama, tlp, jenis_kelamin, alamat } = await req.json();

    await sql`
      INSERT INTO member (nama, tlp, jenis_kelamin, alamat)
      VALUES (${nama}, ${tlp}, ${jenis_kelamin}, ${alamat})
    `;

    return NextResponse.json({ message: "Pelanggan berhasil ditambahkan" });
  } catch (error) {
    console.error("POST member error:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan pelanggan" },
      { status: 500 }
    );
  }
}
