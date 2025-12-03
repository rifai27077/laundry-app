"use client";

import { useState } from "react";

/* ============================
   TYPE DEFINISI
===============================*/
type Transaksi = {
  id: number;
  id_outlet: number;
  kode_invoice: string;
  id_member: number;
  tgl: string;
  batas_waktu: string;
  tgl_bayar?: string;
  biaya_tambahan: number;
  diskon: number;
  pajak: number;
  status: "baru" | "proses" | "selesai" | "diambil";
  dibayar: "dibayar" | "belum_dibayar";
  id_user: number;
  grand_total?: number;
};

type DetailTransaksi = {
  id: number;
  id_transaksi: number;
  id_paket: number;
  qty: number;
  keterangan: string;
  harga_perkilo: number;
};

/* ==================================
   DUMMY DATA
=====================================*/
const pakets = [
  { id: 1, nama_paket: "Cuci Kering", harga: 7000 },
  { id: 2, nama_paket: "Cuci Bed Cover Besar", harga: 25000 },
  { id: 3, nama_paket: "Setrika Saja", harga: 5000 },
];

const dummyTransaksi: Transaksi[] = [
  {
    id: 1,
    id_outlet: 1,
    kode_invoice: "INV-20251201-001",
    id_member: 10,
    tgl: "2025-01-01",
    batas_waktu: "2025-01-03",
    tgl_bayar: "",
    biaya_tambahan: 2000,
    diskon: 0.1,
    pajak: 2000,
    status: "baru",
    dibayar: "belum_dibayar",
    id_user: 1,
    grand_total: 16000,
  },
];

const dummyDetail: DetailTransaksi[] = [
  {
    id: 1,
    id_transaksi: 1,
    id_paket: 1,
    qty: 2,
    keterangan: "Cuci Kering",
    harga_perkilo: 7000,
  },
];

const generateId = () => Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);

/* ============================
   PAGE UTAMA
===============================*/
export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState(dummyTransaksi);
  const [detail, setDetail] = useState(dummyDetail);
  const today = new Date().toISOString().split("T")[0];

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  /* ============================
      FUNGSI OTOMATIS
  ===============================*/

  const generateInvoice = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    const todayStr = now.toISOString().split("T")[0];
    const countToday =
      transaksi.filter((t) => t.tgl === todayStr).length + 1;

    const nomor = String(countToday).padStart(3, "0");

    return `INV-${y}${m}${d}-${nomor}`;
  };

  const autoBatasWaktu = (tanggal: string) => {
    const t = new Date(tanggal);
    t.setDate(t.getDate() + 3);
    return t.toISOString().split("T")[0];
  };

  const hitungPajak = (biaya: number) => Math.floor(biaya * 0.1);

  /* ============================
      GRAND TOTAL (AUTO)
  ===============================*/
  const hitungGrandTotal = (idTransaksi?: number) => {
    const currentId = idTransaksi ?? editId;

    const allDetail = detail.filter((d) =>
      currentId ? d.id_transaksi === currentId : true
    );

    const detailBaru = detailForm.qty * detailForm.harga_perkilo;

    const totalDetail =
      allDetail.reduce((sum, d) => sum + d.qty * d.harga_perkilo, 0) +
      detailBaru;

    const total =
      totalDetail +
      form.biaya_tambahan +
      form.pajak -
      form.diskon * totalDetail;

    return Math.max(total, 0);
  };

  /* ============================
      FORM TRANSAKSI UTAMA
  ===============================*/
  const emptyForm: Omit<Transaksi, "id"> = {
    id_outlet: 1,
    kode_invoice: "",
    id_member: 0,
    tgl: today,
    batas_waktu: autoBatasWaktu(today),
    tgl_bayar: "",
    biaya_tambahan: 0,
    diskon: 0,
    pajak: 0,
    status: "baru",
    dibayar: "belum_dibayar",
    id_user: 1,
    grand_total: 0,
  };

  const [form, setForm] = useState(emptyForm);

  /* ============================
      FORM DETAIL TRANSAKSI
  ===============================*/
  const emptyDetail: Omit<DetailTransaksi, "id" | "id_transaksi"> = {
    id_paket: 0,
    qty: 1,
    keterangan: "",
    harga_perkilo: 0,
  };

  const [detailForm, setDetailForm] = useState(emptyDetail);

  /* ============================
        OPEN MODAL
  ===============================*/
  const openCreate = () => {
    const today = new Date().toISOString().split("T")[0];

    setEditId(null);

    setForm({
      ...emptyForm,
      kode_invoice: generateInvoice(),
      tgl: today,
      batas_waktu: autoBatasWaktu(today),
    });

    setDetailForm(emptyDetail);
    setOpen(true);
  };

  const openEdit = (t: Transaksi) => {
    setEditId(t.id);
    setForm({ ...t });
    setOpen(true);
  };

  /* ============================
        HAPUS TRANSAKSI
  ===============================*/
  const handleDelete = (id: number) => {
    setTransaksi((prev) => prev.filter((x) => x.id !== id));
    setDetail((prev) => prev.filter((x) => x.id_transaksi !== id));
  };

  /* ============================
        SIMPAN TRANSAKSI + DETAIL
  ===============================*/
  const handleSubmit = () => {
    const newId = editId ?? generateId();

    const grandTotal = hitungGrandTotal(newId);

    if (editId) {
      setTransaksi((prev) =>
        prev.map((t) =>
          t.id === editId ? { ...t, ...form, grand_total: grandTotal } : t
        )
      );
    } else {
      setTransaksi((prev) => [
        ...prev,
        { id: newId, ...form, grand_total: grandTotal },
      ]);
    }

    setDetail((prev) => [
      ...prev,
      {
        id: generateId(),
        id_transaksi: newId,
        ...detailForm,
      },
    ]);

    setOpen(false);
  };

  /* ============================
          RENDER
  ===============================*/
  return (
    <div className="space-y-10 p-4 md:p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Entri Transaksi</h1>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          + Tambah Transaksi
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-[#0D1526] p-6 rounded-2xl border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">
          Daftar Transaksi
        </h2>

        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Invoice</th>
              <th>Member</th>
              <th>Tanggal</th>
              <th>Status</th>
              <th>Grand Total</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {transaksi.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-700 hover:bg-gray-800/40"
              >
                <td className="py-2">{t.kode_invoice}</td>
                <td>{t.id_member}</td>
                <td>{t.tgl}</td>
                <td>{t.status}</td>
                <td>Rp {t.grand_total}</td>

                <td className="space-x-4">
                  <button
                    onClick={() => openEdit(t)}
                    className="text-blue-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-400"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-[#0D1526] p-6 rounded-2xl w-full max-w-xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editId ? "Edit Transaksi" : "Tambah Transaksi"}
              </h2>

              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup Modal"
                className="text-gray-400 text-xl"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-4">

              {/* INPUT UTAMA */}
              {[
                ["Kode Invoice", "kode_invoice"],
                ["ID Member", "id_member", "number"],
                ["Tanggal", "tgl", "date"],
                ["Batas Waktu", "batas_waktu", "date"],
                ["Biaya Tambahan", "biaya_tambahan", "number"],
              ].map(([label, key, type = "text"], i) => {
                type FormKey = keyof typeof form;

                return (
                  <div key={i}>
                    <label htmlFor={key} className="text-gray-300 text-sm">{label}</label>

                    <input
                      id={key}
                      type={type}
                      className="w-full p-3 rounded-xl bg-[#152036] border border-gray-600 text-white"
                      value={form[key as FormKey]}
                      onChange={(e) => {
                        const val = type === "number" ? Number(e.target.value) : e.target.value;

                        if (key === "biaya_tambahan") {
                          const numberVal = Number(val);
                          setForm({
                            ...form,
                            biaya_tambahan: numberVal,
                            pajak: hitungPajak(numberVal),
                          });
                        } else {
                          setForm({ ...form, [key]: val });
                        }
                      }}
                    />
                  </div>
                );
              })}

              {/* PAJAK */}
              <div>
                <label htmlFor="pajak" className="text-gray-300 text-sm">Pajak (10%)</label>
                <input
                  id="pajak"
                  type="number"
                  readOnly
                  className="w-full p-3 rounded-xl bg-[#152036] border border-gray-600 text-white"
                  value={form.pajak}
                />
              </div>

              {/* DETAIL */}
              <div className="bg-[#152036] p-4 rounded-xl border border-gray-700">
                <h3 className="text-white font-semibold mb-3">
                  Detail Transaksi
                </h3>

                {/* ID PAKET */}
                <label htmlFor="id_paket" className="text-gray-300 text-sm">ID Paket</label>
                <input
                  id="id_paket"
                  type="number"
                  className="w-full p-2 mb-3 rounded-lg bg-[#0F1A2E] text-white border border-gray-600"
                  value={detailForm.id_paket}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const find = pakets.find((p) => p.id === id);

                    setDetailForm({
                      ...detailForm,
                      id_paket: id,
                      harga_perkilo: find ? find.harga : 0,
                      keterangan: find ? find.nama_paket : "",
                    });
                  }}
                />

                {/* HARGA */}
                <label htmlFor="harga" className="text-gray-300 text-sm">Harga/Kg</label>
                <input
                  id="harga"
                  type="number"
                  readOnly
                  className="w-full p-2 mb-3 rounded-lg bg-[#0F1A2E] text-white border border-gray-600"
                  value={detailForm.harga_perkilo}
                />

                {/* QTY */}
                <label htmlFor="qty" className="text-gray-300 text-sm">Qty (Kg)</label>
                <input
                  id="qty"
                  type="number"
                  className="w-full p-2 mb-3 rounded-lg bg-[#0F1A2E] text-white border border-gray-600"
                  value={detailForm.qty}
                  onChange={(e) =>
                    setDetailForm({
                      ...detailForm,
                      qty: Number(e.target.value),
                    })
                  }
                />

                {/* TOTAL */}
                <div className="text-gray-300 text-sm mb-3">
                  Total:{" "}
                  <span className="text-white font-bold">
                    Rp {detailForm.qty * detailForm.harga_perkilo}
                  </span>
                </div>

                {/* KETERANGAN */}
                <label htmlFor="keterangan" className="text-gray-300 text-sm">Keterangan</label>
                <textarea
                  id="keterangan"
                  className="w-full p-2 rounded-lg bg-[#0F1A2E] text-white border border-gray-600"
                  value={detailForm.keterangan}
                  onChange={(e) =>
                    setDetailForm({
                      ...detailForm,
                      keterangan: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              {/* GRAND TOTAL */}
              <div>
                <label htmlFor="grand_total" className="text-gray-300 text-sm">Grand Total</label>
                <input
                  id="grand_total"
                  type="number"
                  readOnly
                  className="w-full p-3 rounded-xl bg-[#152036] border border-gray-600 text-white"
                  value={hitungGrandTotal()}
                />
              </div>

              {/* BUTTON */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="w-1/2 py-3 bg-gray-700 text-white rounded-xl"
                >
                  Batal
                </button>

                <button
                  className="w-1/2 py-3 bg-blue-600 text-white rounded-xl"
                  onClick={handleSubmit}
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
