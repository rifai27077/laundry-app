"use client";

import React from "react";

type Outlet = {
    id: number;
    nama: string;
    alamat: string;
    tip: string;
};

export default function ModalAddOutlet({
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
    form: Omit<Outlet, "id">;
    setForm: (f: Omit<Outlet, "id">) => void;
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
                        {editId ? "Edit Outlet" : "Tambah Outlet"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
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
                        <label htmlFor="namaOutlet" className="text-gray-300 text-sm">
                            Nama Outlet
                        </label>

                        <input
                            id="namaOutlet"
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="alamatOutlet" className="text-gray-300 text-sm">
                            Alamat Outlet
                        </label>

                        <input
                            id="alamatOutlet"
                            name="alamat"
                            value={form.alamat}
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="tipeOutlet" className="text-gray-300 text-sm">
                            Tipe Outlet
                        </label>

                        <select
                            id="tipeOutlet"
                            name="tip"
                            value={form.tip}
                            onChange={handleChange}
                            required
                            className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                        >
                            <option value="">-- Pilih Tipe --</option>
                            <option value="utama">Utama</option>
                            <option value="cabang">Cabang</option>
                            <option value="mitra">Mitra</option>
                        </select>
                    </div>

                    <div className="flex gap-3 mt-6">
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
