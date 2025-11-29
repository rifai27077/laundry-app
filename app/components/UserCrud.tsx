"use client";

export default function UserCrud() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">CRUD Pengguna</h2>

      <form className="space-y-4 mb-6">
        <div>
          <label className="font-medium">Nama</label>
          <input className="border w-full p-2 rounded mt-1" />
        </div>

        <div>
          <label className="font-medium">Username</label>
          <input className="border w-full p-2 rounded mt-1" />
        </div>

        <div>
          <label className="font-medium">Role</label>
          <select className="border w-full p-2 rounded mt-1">
            <option value="admin">Admin</option>
            <option value="kasir">Kasir</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <button className="bg-purple-600 text-white w-full p-2 rounded">
          Tambah Pengguna
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">ID</th>
            <th className="p-2">Nama</th>
            <th className="p-2">Role</th>
            <th className="p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2">1</td>
            <td className="p-2">Admin Utama</td>
            <td className="p-2">Admin</td>
            <td className="p-2 text-center">
              <button className="text-blue-600 mr-3">Edit</button>
              <button className="text-red-600">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
