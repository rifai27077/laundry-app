"use client";

import { useState } from "react";
import ModalAddOutlet from "@/app/components/ModalAddOutlet";

type Outlet = {
    id: number;
    nama: string;
    alamat: string;
    tip: string;
};

export default function OutletCrud() {
    const [outlets, setOutlets] = useState<Outlet[]>([
        { id: 1, nama: "Outlet Pusat", alamat: "Jl. Mawar No.12", tip: "utama" },
        { id: 2, nama: "Outlet Cabang 1", alamat: "Jl. Kenanga No.7", tip: "cabang" },
    ]);

    const [lastId, setLastId] = useState(2);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [form, setForm] = useState<Omit<Outlet, "id">>({
        nama: "",
        alamat: "",
        tip: "",
    });

    const openCreate = () => {
        setEditId(null);
        setForm({ nama: "", alamat: "", tip: "" });
        setOpen(true);
    };

    const handleSubmit = () => {
        if (editId) {
        setOutlets((prev) =>
            prev.map((o) => (o.id === editId ? { ...o, ...form } : o))
        );
        } else {
        setLastId((prev) => prev + 1);
        setOutlets((prev) => [...prev, { id: lastId + 1, ...form }]);
        }

        setOpen(false);
    };

    const handleEdit = (outlet: Outlet) => {
        setEditId(outlet.id);
        setForm({ nama: outlet.nama, alamat: outlet.alamat, tip: outlet.tip });
        setOpen(true);
    };

    const handleDelete = (id: number) => {
        setOutlets((prev) => prev.filter((o) => o.id !== id));
    };

    return (
        <div className="space-y-10 p-4 md:p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Data Outlet Laundry</h1>

                <button
                    onClick={openCreate}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                    + Tambah Outlet
                </button>
            </div>

            {/* Modal terpisah */}
            <ModalAddOutlet
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleSubmit}
                form={form}
                setForm={setForm}
                editId={editId}
            />

            <div className="bg-[#0D1526] p-6 rounded-2xl border border-gray-700 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4">Daftar Outlet</h2>

                <table className="w-full text-left text-gray-300">
                    <thead>
                        <tr className="border-b border-gray-700">
                        <th className="py-2">ID</th>
                        <th>Nama</th>
                        <th>Alamat</th>
                        <th>Tipe</th>
                        <th className="text-center">Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {outlets.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-4 text-gray-500">
                                Belum ada data outlet
                            </td>
                        </tr>
                        )}

                        {outlets.map((o) => (
                        <tr key={o.id} className="border-b border-gray-700">
                            <td className="py-2">{o.id}</td>
                            <td>{o.nama}</td>
                            <td>{o.alamat}</td>
                            <td className="capitalize">{o.tip}</td>
                            <td className="text-center space-x-3">
                                <button
                                    onClick={() => handleEdit(o)}
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => handleDelete(o.id)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
