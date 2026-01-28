"use client";

import { useState, useEffect } from "react";
import Pagination from "@/app/components/Pagination";

type Paket = {
  id: number;
  id_outlet: number;
  jenis: string;
  nama_paket: string;
  harga: number;
  berat_kg?: number;
};

// ======================= MODAL =======================
function ModalPaket({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  editId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: Omit<Paket, "id">;
  setForm: (f: Omit<Paket, "id">) => void;
  editId: number | null;
}) {
  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-[#0D1526] p-6 w-full max-w-lg rounded-2xl border border-gray-700 shadow-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {editId ? "Edit Paket" : "Tambah Paket"}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-5"
        >
          <div>
            <label htmlFor="id_outlet" className="text-gray-300 text-sm">ID Outlet</label>
            <input
              id="id_outlet"
              type="number"
              name="id_outlet"
              value={form.id_outlet}
              onChange={handleChange}
              required
              className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
            />
          </div>

          <div>
            <label htmlFor="jenis_paket" className="text-gray-300 text-sm">Jenis Paket</label>
            <select
              id="jenis_paket"
              name="jenis"
              value={form.jenis}
              onChange={handleChange}
              required
              className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
            >
              <option value="">-- Pilih Jenis --</option>
              <option value="kiloan">Kiloan</option>
              <option value="selimut">Selimut</option>
              <option value="bed_cover">Bed Cover</option>
              <option value="kaos">Kaos</option>
              <option value="lain">Lain-lain</option>
            </select>
          </div>

          <div>
            <label htmlFor="nama_paket" className="text-gray-300 text-sm">Nama Paket</label>
            <input
              id="nama_paket"
              name="nama_paket"
              value={form.nama_paket}
              onChange={handleChange}
              required
              className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
            />
          </div>

          {form.jenis === "kiloan" ? (
            <div>
              <label htmlFor="berat_kg" className="text-gray-300 text-sm">Berat (kg)</label>
              <input
                id="berat_kg"
                type="number"
                name="berat_kg"
                value={form.berat_kg ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    berat_kg: Number(e.target.value),
                    harga: Number(e.target.value) * 7000, // Otomatis hitung harga
                  })
                }
                required
                className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="harga" className="text-gray-300 text-sm">Harga</label>
              <input
                id="harga"
                type="number"
                name="harga"
                value={form.harga ?? 0}
                onChange={(e) =>
                  setForm({ ...form, harga: Number(e.target.value) })
                }
                required
                className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl"
            >
              Batal
            </button>

            <button
              type="submit"
              className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ======================= PAGE =======================
export default function PaketPage() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [pakets, setPakets] = useState<Paket[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const formatRupiah = new Intl.NumberFormat("id-ID").format;

  const loadPaket = async (page = 1) => {
    const res = await fetch(`/api/paket?page=${page}&limit=${limit}`);
    const result = await res.json();
    setPakets(result.data || []);
    setCurrentPage(result.meta?.page || 1);
    setTotalPages(result.meta?.totalPages || 1);
  };

  useEffect(() => {
    loadPaket(currentPage);
  }, [currentPage]);


  const [form, setForm] = useState<Omit<Paket, "id">>({
    id_outlet: 1,
    jenis: "",
    nama_paket: "",
    harga: 0,
    berat_kg: 0,
  });

  // ================== SUBMIT ==================
  const handleSubmit = async () => {
    const payload = {
      ...form,
      harga: form.jenis === "kiloan"
        ? Number(form.berat_kg) * 7000
        : form.harga,
    };

    if (editId) {
      await fetch("/api/paket", {
        method: "PUT",
        body: JSON.stringify({ id: editId, ...payload }),
      });
    } else {
      await fetch("/api/paket", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    setOpen(false);
    loadPaket();
  };

  const openCreate = () => {
    setEditId(null);
    setForm({
      id_outlet: 1,
      jenis: "",
      nama_paket: "",
      harga: 0,
      berat_kg: 0, // ← WAJIB agar tidak undefined
    });
    setOpen(true);
  };

  const handleEdit = (p: Paket) => {
    setEditId(p.id);
    setForm({
      id_outlet: p.id_outlet,
      jenis: p.jenis,
      nama_paket: p.nama_paket,
      harga: p.harga,
      berat_kg: p.berat_kg ?? 0,
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/paket", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    loadPaket();
  };

  return (
    <div className="space-y-10 p-4 md:p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Data Paket Laundry</h1>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          + Tambah Paket
        </button>
      </div>

      <ModalPaket
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editId={editId}
      />

      <div className="bg-[#0D1526] p-6 rounded-2xl border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Daftar Paket</h2>

        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Outlet</th>
              <th>Jenis</th>
              <th>Nama Paket</th>
              <th>Harga</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {pakets.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Belum ada data paket
                </td>
              </tr>
            )}

            {pakets.map((p) => (
              <tr key={p.id} className="border-b border-gray-700">
                <td className="py-2">{p.id_outlet}</td>
                <td className="capitalize">{p.jenis}</td>
                <td>{p.nama_paket}</td>
                <td>Rp {formatRupiah(p.harga)}</td>

                <td className="text-center space-x-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
