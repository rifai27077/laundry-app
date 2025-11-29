"use client";

export default function ReportGenerator() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Generate Laporan</h2>

      <form className="space-y-4 mb-4">
        <div>
          <label className="font-medium">Dari Tanggal</label>
          <input type="date" className="border w-full p-2 rounded mt-1" />
        </div>

        <div>
          <label className="font-medium">Sampai Tanggal</label>
          <input type="date" className="border w-full p-2 rounded mt-1" />
        </div>

        <button className="bg-red-600 text-white w-full p-2 rounded">
          Generate PDF
        </button>
      </form>
    </div>
  );
}
