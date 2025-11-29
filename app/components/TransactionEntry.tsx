"use client";

export default function TransactionEntry() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Entri Transaksi</h2>

      <form className="space-y-4">
        <div>
          <label className="font-medium">Pelanggan</label>
          <input className="border w-full p-2 rounded mt-1" placeholder="Nama pelanggan" />
        </div>

        <div>
          <label className="font-medium">Paket Cucian</label>
          <select className="border w-full p-2 rounded mt-1">
            <option>Cuci + Setrika</option>
            <option>Cuci Saja</option>
            <option>Setrika</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Berat (kg)</label>
          <input type="number" className="border w-full p-2 rounded mt-1" />
        </div>

        <button className="bg-orange-600 text-white w-full p-2 rounded">
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
}
