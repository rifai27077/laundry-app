import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — Ambil semua user (dengan pagination)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { id: "desc" },
        skip,
        take: limit,
        include: {
          outlet: {
            select: { alamat: true }
          }
        }
      }),
      prisma.user.count(),
    ]);

    const data = users.map(u => ({
      ...u,
      outlet_alamat: u.outlet?.alamat
    }));

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.log("GET Users Error:", error);
    return NextResponse.json({ error: "Gagal mengambil user" }, { status: 500 });
  }
}

// POST — Tambah user baru
export async function POST(req: Request) {
  try {
    const { nama, username, password, id_outlet, role } = await req.json();

    await prisma.user.create({
        data: {
            nama,
            username,
            password,
            id_outlet: Number(id_outlet),
            role
        }
    });

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

    await prisma.user.update({
        where: { id: Number(id) },
        data: {
            nama,
            username,
            password,
            id_outlet: Number(id_outlet),
            role
        }
    });

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

    await prisma.user.delete({
        where: { id: Number(id) }
    });

    return NextResponse.json({ message: "User dihapus" });
  } catch (error) {
    console.log("DELETE Users Error:", error);
    return NextResponse.json({ error: "Gagal hapus user" }, { status: 500 });
  }
}
