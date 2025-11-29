"use client";

export default function PackageCrud() {
    return (
        <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">CRUD Paket Cucian</h2>

        <form className="space-y-4 mb-6">
            <div>
            <label htmlFor="nama_paket" className="font-medium">
                Nama Paket
            </label>
            <input
                id="nama_paket"
                name="nama_paket"
                className="border w-full p-2 rounded mt-1"
            />
            </div>

            <div>
            <label htmlFor="harga" className="font-medium">
                Harga
            </label>
            <input
                id="harga"
                name="harga"
                type="number"
                className="border w-full p-2 rounded mt-1"
            />
            </div>

            <button className="bg-yellow-600 text-white w-full p-2 rounded">
            Tambah Paket
            </button>
        </form>

        <table className="w-full border">
            <thead>
            <tr className="bg-gray-200">
                <th className="p-2">ID</th>
                <th className="p-2">Paket</th>
                <th className="p-2">Harga</th>
                <th className="p-2">Aksi</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td className="p-2">1</td>
                <td className="p-2">Cuci + Setrika</td>
                <td className="p-2">8000</td>
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
