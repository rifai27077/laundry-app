"use client";

import { useEffect, useState } from "react";
import ModalAddOutlet from "@/app/components/ModalAddOutlet";

type Outlet = {
    id: number;
    nama: string;
    alamat: string;
    tlp: string;
};

export default function OutletPage() {
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [form, setForm] = useState<Omit<Outlet, "id">>({
        nama: "",
        alamat: "",
        tlp: "",
    });

    // ============================
    // LOAD ALL OUTLETS
    // ============================
    const loadOutlets = async () => {
        const res = await fetch("/api/outlet");
        const data = await res.json();

        console.log("DATA API:", data, "isArray?", Array.isArray(data));

        if (Array.isArray(data)) {
            setOutlets(data);
        } else {
            setOutlets([]);
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            await loadOutlets();
        };

        fetchData();
    }, []);

    // ============================
    // SUBMIT FORM
    // ============================
    const handleSubmit = async () => {
        if (editId) {
        // PUT UPDATE
        await fetch("/api/outlet", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editId, ...form }),
        });
        } else {
        // POST CREATE
        await fetch("/api/outlet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        }

        setOpen(false);
        loadOutlets();
    };

    // ============================
    // EDIT
    // ============================
    const handleEdit = (o: Outlet) => {
        setEditId(o.id);
        setForm({ nama: o.nama, alamat: o.alamat, tlp: o.tlp });
        setOpen(true);
    };

    // ============================
    // DELETE
    // ============================
    const handleDelete = async (id: number) => {
        await fetch("/api/outlet", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        });

        loadOutlets();
    };

    // ============================
    // UI
    // ============================
    return (
        <div className="space-y-10 p-4 md:p-6">
        <div className="flex justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Data Outlet Laundry</h1>

            <button
            onClick={() => {
                setEditId(null);
                setForm({ nama: "", alamat: "", tlp: "" });
                setOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
            + Tambah Outlet
            </button>
        </div>

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
                <th>Telepon</th>
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
                    <td>{o.tlp}</td>
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
