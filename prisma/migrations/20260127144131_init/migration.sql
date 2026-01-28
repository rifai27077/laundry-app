-- CreateEnum
CREATE TYPE "jenis_kelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "jenis_paket" AS ENUM ('kiloan', 'selimut', 'bed_cover', 'kaos', 'lain');

-- CreateEnum
CREATE TYPE "status_bayar" AS ENUM ('dibayar', 'belum_dibayar');

-- CreateEnum
CREATE TYPE "status_pesanan" AS ENUM ('baru', 'proses', 'selesai', 'diambil', 'dibatalkan');

-- CreateEnum
CREATE TYPE "metode_pembayaran" AS ENUM ('cash', 'transfer', 'qris');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'kasir', 'owner');

-- CreateTable
CREATE TABLE "outlet" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "alamat" TEXT NOT NULL,
    "tlp" VARCHAR(15),

    CONSTRAINT "outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100),
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "id_outlet" INTEGER,
    "role" VARCHAR(20) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" SERIAL NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "alamat" TEXT,
    "jenis_kelamin" "jenis_kelamin",
    "tlp" VARCHAR(15),

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paket" (
    "id" SERIAL NOT NULL,
    "id_outlet" INTEGER,
    "jenis" "jenis_paket" NOT NULL,
    "nama_paket" VARCHAR(100),
    "harga" INTEGER NOT NULL,
    "berat_kg" INTEGER DEFAULT 0,

    CONSTRAINT "paket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaksi" (
    "id" SERIAL NOT NULL,
    "id_outlet" INTEGER,
    "kode_invoice" VARCHAR(100) NOT NULL,
    "id_member" INTEGER,
    "tgl" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batas_waktu" TIMESTAMP(6),
    "tgl_bayar" TIMESTAMP(6),
    "biaya_tambahan" INTEGER DEFAULT 0,
    "diskon" INTEGER DEFAULT 0,
    "pajak" INTEGER DEFAULT 0,
    "status" "status_pesanan" NOT NULL DEFAULT 'baru',
    "dibayar" "status_bayar" NOT NULL DEFAULT 'belum_dibayar',
    "id_user" INTEGER,
    "grand_total" INTEGER DEFAULT 0,

    CONSTRAINT "transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_transaksi" (
    "id" SERIAL NOT NULL,
    "id_transaksi" INTEGER,
    "id_paket" INTEGER,
    "qty" DOUBLE PRECISION NOT NULL,
    "keterangan" TEXT,
    "harga" INTEGER,

    CONSTRAINT "detail_transaksi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pembayaran" (
    "id" SERIAL NOT NULL,
    "id_transaksi" INTEGER,
    "tgl_bayar" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "jumlah_bayar" INTEGER NOT NULL,
    "metode_pembayaran" "metode_pembayaran",
    "keterangan" TEXT,

    CONSTRAINT "pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "idx_transaksi_outlet" ON "transaksi"("id_outlet");

-- CreateIndex
CREATE INDEX "idx_transaksi_member" ON "transaksi"("id_member");

-- CreateIndex
CREATE INDEX "idx_transaksi_user" ON "transaksi"("id_user");

-- CreateIndex
CREATE INDEX "idx_transaksi_status_2" ON "transaksi"("status");

-- CreateIndex
CREATE INDEX "idx_transaksi_bayar" ON "transaksi"("dibayar");

-- CreateIndex
CREATE INDEX "idx_transaksi_tgl" ON "transaksi"("tgl");

-- CreateIndex
CREATE INDEX "idx_detail_transaksi_transaksi" ON "detail_transaksi"("id_transaksi");

-- CreateIndex
CREATE INDEX "idx_detail_transaksi_paket" ON "detail_transaksi"("id_paket");

-- CreateIndex
CREATE INDEX "idx_detail_transaksi_id" ON "detail_transaksi"("id_transaksi");

-- CreateIndex
CREATE UNIQUE INDEX "unique_detail" ON "detail_transaksi"("id_transaksi", "id_paket");

-- CreateIndex
CREATE INDEX "idx_pembayaran_transaksi" ON "pembayaran"("id_transaksi");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_outlet_fkey" FOREIGN KEY ("id_outlet") REFERENCES "outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paket" ADD CONSTRAINT "paket_id_outlet_fkey" FOREIGN KEY ("id_outlet") REFERENCES "outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_outlet_fkey" FOREIGN KEY ("id_outlet") REFERENCES "outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_member_fkey" FOREIGN KEY ("id_member") REFERENCES "member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi" ADD CONSTRAINT "transaksi_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_transaksi" ADD CONSTRAINT "detail_transaksi_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_transaksi" ADD CONSTRAINT "detail_transaksi_id_paket_fkey" FOREIGN KEY ("id_paket") REFERENCES "paket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pembayaran" ADD CONSTRAINT "pembayaran_id_transaksi_fkey" FOREIGN KEY ("id_transaksi") REFERENCES "transaksi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
