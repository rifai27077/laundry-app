"use client";

export default function CustomerRegistration() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Registrasi Pelanggan</h2>

      <form className="space-y-4">
        <div>
          <label className="font-medium">Nama Pelanggan</label>
          <input
            className="border w-full p-2 rounded mt-1"
            placeholder="Masukkan nama"
          />
        </div>

        <div>
          <label className="font-medium">Alamat</label>
          <input
            className="border w-full p-2 rounded mt-1"
            placeholder="Masukkan alamat"
          />
        </div>

        <div>
          <label className="font-medium">Nomor Telepon</label>
          <input
            className="border w-full p-2 rounded mt-1"
            placeholder="08xxxxxxxx"
          />
        </div>

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          Simpan Pelanggan
        </button>
      </form>
    </div>
  );
}
