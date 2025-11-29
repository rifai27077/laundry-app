"use client";

export default function OutletCrud() {
    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">CRUD Outlet</h2>

            <form className="space-y-4 mb-6">
                <div>
                    <label htmlFor="nama_outlet" className="font-medium">
                        Nama Outlet
                    </label>
                    <input
                        id="nama_outlet"
                        name="nama_outlet"
                        className="border w-full p-2 rounded mt-1"
                    />
                </div>

                <div>
                    <label htmlFor="alamat_outlet" className="font-medium">
                        Alamat Outlet
                    </label>
                    <input
                        id="alamat_outlet"
                        name="alamat_outlet"
                        className="border w-full p-2 rounded mt-1"
                    />
                </div>

                <button className="bg-green-600 text-white w-full p-2 rounded">
                    Tambah Outlet
                </button>
            </form>

            <h3 className="font-semibold mb-2">Data Outlet</h3>

            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">ID</th>
                        <th className="p-2">Nama</th>
                        <th className="p-2">Alamat</th>
                        <th className="p-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-2">1</td>
                        <td className="p-2">Outlet Pusat</td>
                        <td className="p-2">Jl. Mawar 12</td>
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
