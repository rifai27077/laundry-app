"use client";

import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";

type User = {
  id: number;
  nama: string;
  username: string;
  password: string;
  id_outlet: number;
  role: "admin" | "kasir" | "owner";
};

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [form, setForm] = useState<Omit<User, "id">>({
    nama: "",
    username: "",
    password: "",
    id_outlet: 1,
    role: "admin",
  });

  const loadUsers = async () => {
    const res = await fetch("/api/users");
    const data = await res.json();
    setUsers(data);
  };

  // FIX useEffect async warning
  useEffect(() => {
    const fetchData = async () => {
      await loadUsers();
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (editId) {
      await fetch("/api/users", {
        method: "PUT",
        body: JSON.stringify({ id: editId, ...form }),
      });
    } else {
      await fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
    }

    setOpen(false);
    loadUsers();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/users", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    loadUsers();
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ nama: "", username: "", password: "", id_outlet: 1, role: "admin" });
    setOpen(true);
  };

  const openEdit = (u: User) => {
    setEditId(u.id);
    setForm({
      nama: u.nama,
      username: u.username,
      password: u.password,
      id_outlet: u.id_outlet,
      role: u.role,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-10 p-4 md:p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Pengguna</h1>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2"
        >
          <UserPlus size={20} />
          Tambah Pengguna
        </button>
      </div>

      {/* TABEL */}
      <div className="bg-[#0D1526] p-6 rounded-2xl border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Daftar Pengguna</h2>

        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>ID Outlet</th>
              <th className="text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Belum ada pengguna
                </td>
              </tr>
            )}

            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-700 hover:bg-[#111b2d] transition">
                <td className="py-2">{u.nama}</td>
                <td>{u.username}</td>
                <td className="capitalize">{u.role}</td>
                <td>{u.id_outlet}</td>

                <td className="text-center space-x-3">
                  <button
                    onClick={() => openEdit(u)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(u.id)}
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

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-[#0D1526] p-6 w-full max-w-lg rounded-2xl border border-gray-700 shadow-xl">

            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editId ? "Edit Pengguna" : "Tambah Pengguna"}
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Nama */}
              <div>
                <label htmlFor="nama" className="text-gray-300 text-sm">Nama</label>
                <input
                  id="nama"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                />
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="text-gray-300 text-sm">Username</label>
                <input
                  id="username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="text-gray-300 text-sm">Password</label>
                <input
                  id="password"
                  type="password"
                  value={form.password ?? ""}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                />
              </div>

              {/* ID Outlet */}
              <div>
                <label htmlFor="id_outlet" className="text-gray-300 text-sm">ID Outlet</label>
                <input
                  id="id_outlet"
                  type="number"
                  value={form.id_outlet}
                  onChange={(e) =>
                    setForm({ ...form, id_outlet: Number(e.target.value) })
                  }
                  className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="text-gray-300 text-sm">Role</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as User["role"] })
                  }
                  className="w-full p-3 mt-1 rounded-xl bg-[#152036] text-white border border-gray-600"
                >
                  <option value="admin">Admin</option>
                  <option value="kasir">Kasir</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              {/* Tombol */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setOpen(false)}
                  className="w-1/2 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl"
                >
                  Batal
                </button>

                <button
                  onClick={handleSubmit}
                  className="w-1/2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
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
