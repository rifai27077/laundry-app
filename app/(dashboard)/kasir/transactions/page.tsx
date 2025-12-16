"use client";

import { useEffect, useState } from "react";

/* ============================
   TYPE DEFINISI
===============================*/
type Transaksi = {
  id: number;
  id_outlet: number;
  kode_invoice: string;
  id_member: number;
  tgl: string; // ISO timestamp or date
  batas_waktu: string;
  tgl_bayar?: string | null;
  biaya_tambahan: number;
  diskon: number; // interpreted as fraction (e.g. 0.1 = 10%)
  pajak: number;
  status: "baru" | "proses" | "selesai" | "diambil";
  dibayar: "dibayar" | "belum_dibayar";
  id_user: number;
  grand_total?: number;
};

type Paket = {
  id: number;
  nama_paket: string;
  harga: number;
};

type DetailForm = {
  id_paket: number;
  keterangan: string;
  harga: number;
};

function formatDateOnly(value?: string | null) {
  if (!value) return "";
  // handle: "2025-12-16 00:00:00" & ISO
  return value.split(" ")[0].split("T")[0];
}


/* ============================
   PAGE UTAMA
===============================*/
export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [pakets, setPakets] = useState<Paket[]>([]);
  // detailForm holds the single detail for current transaksi being edited/created
  const [detailForm, setDetailForm] = useState<DetailForm>({
    id_paket: 0,
    keterangan: "",
    harga: 0,
  });

  const today = new Date().toISOString().split("T")[0];

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const emptyForm: Omit<Transaksi, "id"> = {
    id_outlet: 1,
    kode_invoice: "",
    id_member: 1,
    tgl: today,
    batas_waktu: addDaysISO(today, 3),
    tgl_bayar: null,
    biaya_tambahan: 0,
    diskon: 0,
    pajak: 0,
    status: "baru",
    dibayar: "belum_dibayar",
    id_user: 1,
    grand_total: 0,
  };

  const [form, setForm] = useState<Omit<Transaksi, "id">>(emptyForm);

  /* ============================
     HELPERS
  ===============================*/
  function addDaysISO(dateISO: string, days: number) {
    const d = new Date(dateISO);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  const hitungPajak = (biaya: number) => Math.floor(biaya * 0.1);

  const subtotalDetail = () => detailForm.harga;

  const hitungGrandTotal = () => {
    const subtotal = subtotalDetail();
    const pajak = hitungPajak(subtotal);
    const afterDiskon = subtotal - form.diskon * subtotal;
    const total = afterDiskon + form.biaya_tambahan + pajak;
    return Math.max(Math.floor(total), 0);
  };


  /* ============================
     FETCH / CRUD TRANSAKSI
  ===============================*/
  const loadTransaksi = async () => {
    try {
      const res = await fetch("/api/transaksi");
      if (!res.ok) throw new Error("Gagal fetch transaksi");
      const data = await res.json();
      // format tgl if necessary (take date part)
      const normalized = data.map((t: Transaksi) => ({
        ...t,
        tgl: formatDateOnly(t.tgl),
        batas_waktu: formatDateOnly(t.batas_waktu),
      }));
      setTransaksi(normalized);
    } catch (err) {
      console.error("loadTransaksi:", err);
    }
  };

  useEffect(() => {
    loadTransaksi();
    loadPakets();
  }, []);

  /* ============================
     INVOICE GENERATOR
     - count transaksi pada hari ini (string compare on date part)
  ===============================*/
  const generateInvoice = (list: Transaksi[]) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    const todayStr = now.toISOString().split("T")[0];

    // hitung transaksi pada hari ini
    const countToday =
      list.filter((t) => (t.tgl || "").startsWith(todayStr)).length + 1;

    const nomor = String(countToday).padStart(3, "0");
    return `INV-${y}${m}${d}-${nomor}`;
  };

  /* ============================
     MODAL OPEN / EDIT
  ===============================*/
  const openCreate = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    setEditId(null);
    setForm((prev) => ({
      ...prev,
      kode_invoice: generateInvoice(transaksi),
      tgl: todayStr,
      batas_waktu: addDaysISO(todayStr, 3),
    }));
    setDetailForm({ id_paket: 0, keterangan: "", harga: 0 });
    setOpen(true);
  };

  const openEdit = async (t: Transaksi) => {
    setEditId(t.id);
    // populate transaksi form
    setForm({
      id_outlet: t.id_outlet,
      kode_invoice: t.kode_invoice,
      id_member: t.id_member,
      tgl: formatDateOnly(t.tgl),
      batas_waktu: formatDateOnly(t.batas_waktu),
      tgl_bayar: t.tgl_bayar ?? "",
      biaya_tambahan: t.biaya_tambahan,
      diskon: t.diskon,
      pajak: t.pajak,
      status: t.status,
      dibayar: t.dibayar,
      id_user: t.id_user,
      grand_total: t.grand_total ?? 0,
    });

    // fetch single detail for this transaksi (assumes API POST /api/transaksi accepts { id_transaksi })
    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_transaksi: t.id }),
      });
      if (res.ok) {
        const details = await res.json();
        // assume one detail (option B)
        if (details && details.length > 0) {
          const d = details[0];
          setDetailForm({
            id_paket: d.id_paket,
            keterangan: d.keterangan ?? "",
            harga: d.harga ?? 0,
          });
        } else {
          setDetailForm({ id_paket: 0, keterangan: "", harga: 0 });
        }
      }
    } catch (err) {
      console.error("openEdit fetch detail:", err);
    }

    setOpen(true);
  };

  const loadPakets = async () => {
    try {
      const res = await fetch("/api/paket");
      if (!res.ok) throw new Error("Gagal fetch paket");
      const data = await res.json();
      setPakets(data);
    } catch (error) {
      console.error("loadPakets:", error);
    }
  };


  /* ============================
     HAPUS TRANSAKSI
  ===============================*/
  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      await fetch("/api/transaksi", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      // refresh list
      await loadTransaksi();
    } catch (err) {
      console.error("delete transaksi:", err);
    }
  };

  /* ============================
     SIMPAN TRANSAKSI + DETAIL (single detail)
  ===============================*/
  const handleSubmit = async () => {
    // validation minimal
    if (!form.kode_invoice) {
      alert("Kode invoice wajib.");
      return;
    }
    if (!detailForm.id_paket) {
      alert("Pilih paket.");
      return;
    }

    // prepare payload
    const trxPayload = {
      ...form,
      tgl_bayar: form.tgl_bayar || null,
      biaya_tambahan: Number(form.biaya_tambahan) || 0,
      pajak: form.pajak || hitungPajak(form.biaya_tambahan || 0),
      diskon: Number(form.diskon) || 0, // expect fraction like 0.1
      grand_total: hitungGrandTotal(),
    };

    try {
      let trxId = editId;

      if (editId) {
        // update transaksi
        await fetch("/api/transaksi", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...trxPayload }),
        });
      } else {
        // create transaksi
        const res = await fetch("/api/transaksi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trxPayload),
        });
        const data = await res.json();
        trxId = data?.id;
      }

      // save detail (single)
      const detailPayload = {
        id_transaksi: trxId,
        id_paket: detailForm.id_paket,
        keterangan: detailForm.keterangan,
        harga: detailForm.harga,
      };

      await fetch("/api/transaksi", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detailPayload),
      });

      // close modal and refresh list
      setOpen(false);
      await loadTransaksi();
    } catch (err) {
      console.error("save transaksi:", err);
      alert("Gagal menyimpan. Cek console.");
    }
  };

  /* ============================
     UI RENDER
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
        <h2 className="text-xl font-bold text-white mb-4">Daftar Transaksi</h2>

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
            {transaksi.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Belum ada transaksi
                </td>
              </tr>
            )}

            {transaksi.map((t) => (
              <tr
                key={t.id}
                className="border-b border-gray-700 hover:bg-gray-800/40"
              >
                <td className="py-2">{t.kode_invoice}</td>
                <td>{t.id_member}</td>
                <td>{formatDateOnly(t.tgl)}</td>
                <td>{t.status}</td>
                <td>Rp {t.grand_total ?? 0}</td>

                <td className="space-x-4">
                  <button onClick={() => openEdit(t)} className="text-blue-400">
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
              {[
                ["Kode Invoice", "kode_invoice", "text"],
                ["ID Member", "id_member", "number"],
                ["Tanggal", "tgl", "date"],
                ["Batas Waktu", "batas_waktu", "date"],
                ["Biaya Tambahan", "biaya_tambahan", "number"],
              ].map(([label, key, type], i) => {
                type FormKey = keyof typeof form;
                return (
                  <div key={i}>
                    <label htmlFor={key} className="text-gray-300 text-sm">
                      {label}
                    </label>

                    <input
                      id={key}
                      type={type}
                      className="w-full p-3 rounded-xl bg-[#152036] border border-gray-600 text-white"
                      value={String(form[key as unknown as FormKey] ?? "")}
                      onChange={(e) => {
                        const val =
                          type === "number" ? Number(e.target.value) : e.target.value;
                        if (key === "biaya_tambahan") {
                          const numberVal = Number(val || 0);
                          setForm({
                            ...form,
                            biaya_tambahan: numberVal,
                            pajak: hitungPajak(subtotalDetail() + numberVal),
                          });
                        } else {
                          setForm((prev) => ({
                            ...prev,
                            [key as keyof typeof prev]: type === "number"
                              ? Number(val)
                              : val,
                          }));
                        }
                      }}
                    />
                  </div>
                );
              })}

              {/* PAJAK */}
              <div>
                <label htmlFor="pajak" className="text-gray-300 text-sm">
                  Pajak (10%)
                </label>
                <input
                  id="pajak"
                  type="number"
                  readOnly
                  className="w-full p-3 rounded-xl bg-[#152036] border border-gray-600 text-white"
                  value={form.pajak}
                />
              </div>

              {/* DETAIL (SINGLE) */}
              <div className="bg-[#152036] p-4 rounded-xl border border-gray-700">
                <h3 className="text-white font-semibold mb-3">Detail Transaksi</h3>

                {/* SELECT PAKET */}
                <label htmlFor="id_paket" className="text-gray-300 text-sm">
                  Paket
                </label>
                <select
                  id="id_paket"
                  className="w-full p-2 mb-3 rounded-lg bg-[#0F1A2E] text-white border border-gray-600"
                  value={detailForm.id_paket}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const found = pakets.find((p) => p.id === id);
                    setDetailForm({
                      ...detailForm,
                      id_paket: id,
                      harga: found ? found.harga : 0,
                      keterangan: found ? found.nama_paket : detailForm.keterangan,
                    });
                  }}
                >
                  <option value={0}>-- Pilih Paket --</option>
                  {pakets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_paket} — Rp {p.harga}
                    </option>
                  ))}
                </select>

                {/* HARGA */}
                <label htmlFor="harga" className="text-gray-300 text-sm">
                  Harga / unit
                </label>
                <input
                  id="harga"
                  type="number"
                  readOnly
                  className="w-full p-2 mb-3 rounded-lg bg-[#0F1A2E] text-white border border-gray-600"
                  value={detailForm.harga}
                />

                {/* TOTAL */}
                <div className="text-gray-300 text-sm mb-3">
                  Total:{" "}
                  <span className="text-white font-bold">
                    Rp {subtotalDetail()}
                  </span>
                </div>

                {/* KETERANGAN */}
                <label htmlFor="keterangan" className="text-gray-300 text-sm">
                  Keterangan
                </label>
                <textarea
                  id="keterangan"
                  className="w-full p-2 rounded-lg bg-[#0F1A2E] text-white border border-gray-600"
                  value={detailForm.keterangan}
                  onChange={(e) =>
                    setDetailForm({ ...detailForm, keterangan: e.target.value })
                  }
                ></textarea>
              </div>

              {/* GRAND TOTAL */}
              <div>
                <label htmlFor="grand_total" className="text-gray-300 text-sm">
                  Grand Total
                </label>
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
