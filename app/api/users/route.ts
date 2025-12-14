import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET — Ambil semua user
export async function GET() {
  try {
    const users = await sql`
      SELECT 
        u.id,
        u.nama,
        u.username,
        u.password,
        u.role,
        u.id_outlet,
        o.alamat AS outlet_alamat
      FROM users u
      LEFT JOIN outlet o ON u.id_outlet = o.id
      ORDER BY u.id DESC
    `;
    return NextResponse.json(users);
  } catch (error) {
    console.log("GET Users Error:", error);
    return NextResponse.json({ error: "Gagal mengambil user" }, { status: 500 });
  }
}

// POST — Tambah user baru
export async function POST(req: Request) {
  try {
    const { nama, username, password, id_outlet, role } = await req.json();

    await sql`
      INSERT INTO users (nama, username, password, id_outlet, role)
      VALUES (${nama}, ${username}, ${password}, ${id_outlet}, ${role})
    `;

    return NextResponse.json({ message: "User ditambahkan" });
  } catch (error) {
    console.error("POST Users Error:", error);
    return NextResponse.json({ error: "Gagal menambah user" }, { status: 500 });
  }
}

// PUT — Update user
export async function PUT(req: Request) {
  try {
    const { id, nama, username, password, id_outlet, role } = await req.json();

    await sql`
      UPDATE users
      SET nama=${nama}, username=${username}, password=${password},
          id_outlet=${id_outlet}, role=${role}
      WHERE id=${id}
    `;

    return NextResponse.json({ message: "User diupdate" });
  } catch (error) {
    console.log("PUT Users Error:", error);
    return NextResponse.json({ error: "Gagal update user" }, { status: 500 });
  }
}

// DELETE — Hapus user
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    await sql`DELETE FROM users WHERE id=${id}`;

    return NextResponse.json({ message: "User dihapus" });
  } catch (error) {
    console.log("DELETE Users Error:", error);
    return NextResponse.json({ error: "Gagal hapus user" }, { status: 500 });
  }
}
