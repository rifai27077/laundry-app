CREATE TABLE outlet (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    alamat TEXT NOT NULL,
    tlp VARCHAR(15)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    id_outlet INT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'kasir', 'owner')),
    CONSTRAINT fk_users_outlet FOREIGN KEY (id_outlet)
        REFERENCES outlet(id) ON DELETE SET NULL
);

CREATE TYPE jenis_kelamin AS ENUM ('L', 'P');

CREATE TABLE member (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    alamat TEXT,
    jenis_kelamin jenis_kelamin,
    tlp VARCHAR(15)
);

CREATE TYPE jenis_paket AS ENUM ('kiloan','selimut','bed_cover','kaos','lain');

CREATE TABLE paket (
    id SERIAL PRIMARY KEY,
    id_outlet INT REFERENCES outlet(id),
    jenis jenis_paket NOT NULL,
    nama_paket VARCHAR(100),
    harga INT NOT NULL
);

ALTER TABLE paket
ADD COLUMN berat_kg INT DEFAULT 0;

CREATE TYPE status_bayar AS ENUM ('dibayar','belum_dibayar');
CREATE TYPE status_pesanan AS ENUM ('baru','proses','selesai','diambil');

CREATE TABLE transaksi (
    id SERIAL PRIMARY KEY,
    id_outlet INT REFERENCES outlet(id),
    kode_invoice VARCHAR(100) NOT NULL,
    id_member INT REFERENCES member(id),
    tgl TIMESTAMP NOT NULL DEFAULT NOW(),
    batas_waktu TIMESTAMP,
    tgl_bayar TIMESTAMP,
    biaya_tambahan INT DEFAULT 0,
    diskon INT DEFAULT 0,
    pajak INT DEFAULT 0,
    status status_pesanan NOT NULL DEFAULT 'baru',
    dibayar status_bayar NOT NULL DEFAULT 'belum_dibayar',
    id_user INT REFERENCES users(id)
);

CREATE TABLE detail_transaksi (
    id SERIAL PRIMARY KEY,
    id_transaksi INT REFERENCES transaksi(id),
    id_paket INT REFERENCES paket(id),
    qty DOUBLE PRECISION NOT NULL,
    keterangan TEXT
);

ALTER TABLE detail_transaksi
ADD COLUMN harga INT;

ALTER TABLE transaksi ADD COLUMN grand_total INT DEFAULT 0;

ALTER TABLE detail_transaksi 
    ADD CONSTRAINT fk_transaksi_detail 
    FOREIGN KEY (id_transaksi) REFERENCES transaksi(id) ON DELETE CASCADE;


ALTER TABLE detail_transaksi
    ADD CONSTRAINT fk_paket_detail 
    FOREIGN KEY (id_paket) REFERENCES paket(id) ON DELETE RESTRICT;

CREATE INDEX idx_transaksi_outlet ON transaksi(id_outlet);
CREATE INDEX idx_transaksi_member ON transaksi(id_member);
CREATE INDEX idx_transaksi_user ON transaksi(id_user);
CREATE INDEX idx_transaksi_status ON transaksi(status);
CREATE INDEX idx_transaksi_bayar ON transaksi(dibayar);

CREATE INDEX idx_detail_transaksi_transaksi ON detail_transaksi(id_transaksi);
CREATE INDEX idx_detail_transaksi_paket ON detail_transaksi(id_paket);

CREATE INDEX idx_paket_outlet ON paket(id_outlet);

ALTER TABLE detail_transaksi
ADD CONSTRAINT unique_detail UNIQUE(id_transaksi, id_paket);

CREATE INDEX idx_transaksi_tgl ON transaksi(tgl);
CREATE INDEX idx_transaksi_status ON transaksi(status);
CREATE INDEX idx_transaksi_outlet ON transaksi(id_outlet);

CREATE INDEX idx_detail_transaksi_id ON detail_transaksi(id_transaksi);

ALTER TYPE status_pesanan ADD VALUE 'dibatalkan';
