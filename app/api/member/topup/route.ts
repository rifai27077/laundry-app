import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id_member, jumlah } = await req.json();

    if (!id_member || !jumlah || jumlah <= 0) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const updatedMember = await prisma.member.update({
      where: { id: Number(id_member) },
      data: {
        saldo: {
          increment: Number(jumlah)
        }
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("TopUp API Error:", error);
    return NextResponse.json({ error: "Gagal memproses top up" }, { status: 500 });
  }
}
