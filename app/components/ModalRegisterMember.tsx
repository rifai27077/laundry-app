"use client";

import { useState } from "react";

type MemberForm = {
    nama: string;
    alamat: string;
    jenis_kelamin: "L" | "P";
    tlp: string;
};

type InputEvent =
    | React.ChangeEvent<HTMLInputElement>
    | React.ChangeEvent<HTMLTextAreaElement>
    | React.ChangeEvent<HTMLSelectElement>;

export default function ModalRegisterMember({
    open,
    onClose,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (form: MemberForm) => void;
}) {
    const [form, setForm] = useState<MemberForm>({
        nama: "",
        alamat: "",
        jenis_kelamin: "L",
        tlp: "",
    });

    const handleChange = (e: InputEvent) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(form);
        setForm({ nama: "", alamat: "", jenis_kelamin: "L", tlp: "" });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#0D1526] p-6 w-full max-w-lg rounded-2xl border border-gray-700 shadow-xl">

                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Registrasi Pelanggan</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="nama" className="text-gray-300 text-sm">Nama</label>
                        <input
                            id="nama"
                            type="text"
                            name="nama"
                            required
                            className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                    <label htmlFor="alamat" className="text-gray-300 text-sm">Alamat</label>
                    <textarea
                        id="alamat"
                        name="alamat"
                        required
                        className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                        onChange={handleChange}
                    ></textarea>
                    </div>

                    <div>
                    <label htmlFor="jk" className="text-gray-300 text-sm">Jenis Kelamin</label>
                    <select
                        id="jk"
                        name="jenis_kelamin"
                        className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                        onChange={handleChange}
                    >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                    </select>
                    </div>

                    <div>
                    <label htmlFor="tlp" className="text-gray-300 text-sm">Telepon</label>
                    <input
                        id="tlp"
                        type="text"
                        name="tlp"
                        maxLength={15}
                        required
                        className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                        onChange={handleChange}
                    />
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
