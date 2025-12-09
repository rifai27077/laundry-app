"use client";

import { useMemo, useState, useEffect } from "react";

/* ============================
   TYPE DEFINISI
===============================*/
type Transaksi = {
  id: number;
  id_outlet: number;
  kode_invoice: string;
  id_member: number;
  tgl: string;
  batas_waktu: string;
  tgl_bayar?: string;
  biaya_tambahan: number;
  diskon: number;
  pajak: number;
  status: "baru" | "proses" | "selesai" | "diambil";
  dibayar: "dibayar" | "belum_dibayar";
  id_user: number;
  grand_total?: number;
};

type DetailTransaksi = {
  id: number;
  id_transaksi: number;
  id_paket: number;
  qty: number;
  keterangan: string;
  harga_perkilo: number;
};

type Paket = {
  id: number;
  nama_paket: string;
  harga: number;
};

type Member = {
  id: number;
  nama: string;
  alamat?: string;
  tlp?: string;
};

type Outlet = {
  id: number;
  nama: string;
};
/* ============================
   UTILS
===============================*/
const formatRupiah = (n: number) => n.toLocaleString("id-ID");

/* ============================
   PAGE Generate Laporan
===============================*/
export default function GenerateLaporanPage() {
  const [laporan, setLaporan] = useState<Transaksi[]>([]);
  const [detail, setDetail] = useState<DetailTransaksi[]>([]);
  const [membersDb, setMembersDb] = useState<Member[]>([]);
  const [outletsDb, setOutletsDb] = useState<Outlet[]>([]);
  const [paketsDb, setPaketsDb] = useState<Paket[]>([]);


  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterOutlet, setFilterOutlet] = useState<number | "">("");

  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);

  
  /* ============================
     FILTER
  ===============================*/
  const dataFiltered = useMemo(() => {
    return laporan.filter((t) => {
      const inStart = startDate ? t.tgl >= startDate : true;
      const inEnd = endDate ? t.tgl <= endDate : true;
      const byStatus = filterStatus ? t.status === filterStatus : true;
      const byOutlet = filterOutlet ? t.id_outlet === filterOutlet : true;
      return inStart && inEnd && byStatus && byOutlet;
    });
  }, [laporan, startDate, endDate, filterStatus, filterOutlet]);

  const summary = useMemo(() => {
    const totalTransactions = dataFiltered.length;
    const totalRevenue = dataFiltered.reduce((s, x) => s + (x.grand_total ?? 0), 0);
    const paidCount = dataFiltered.filter((d) => d.dibayar === "dibayar").length;
    const unpaidCount = dataFiltered.filter((d) => d.dibayar === "belum_dibayar").length;
    return { totalTransactions, totalRevenue, paidCount, unpaidCount };
  }, [dataFiltered]);

  useEffect(() => {
    async function loadData() {
      const params = new URLSearchParams();

      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);
      if (filterStatus) params.append("status", filterStatus);
      if (filterOutlet) params.append("outlet", String(filterOutlet));

      const res = await fetch(`/api/laporan?${params.toString()}`);
      const json = await res.json();

      setLaporan(json.transaksi ?? []);
      setDetail(json.detail ?? []);
      setMembersDb(json.members ?? []);
      setOutletsDb(json.outlets ?? []);
      setPaketsDb(json.pakets ?? []);
    }

    loadData();
  }, [startDate, endDate, filterStatus, filterOutlet]);

  const getDetailsFor = (trxId: number) =>
    detail
      .filter((d) => d.id_transaksi === trxId)
      .map((d) => {
        const paket = paketsDb.find((p) => p.id === d.id_paket);

        return {
          ...d,
          nama_paket: paket?.nama_paket ?? `Paket ${d.id_paket}`,
          harga_perkilo: paket?.harga ?? d.harga_perkilo,
          subtotal: d.qty * (paket?.harga ?? d.harga_perkilo),
        };
      });

  /* ============================
      EXPORT TO PDF
  ===============================*/
  const handleExportPdf = () => {
    const title = "Laporan Transaksi";

    const rowsHtml = dataFiltered
      .map((t) => {
        return `
            <tr>
              <td style="padding:8px;border:1px solid #ccc">${t.kode_invoice}</td>
              <td style="padding:8px;border:1px solid #ccc">
                ${
                  membersDb.find((m) => m.id === t.id_member)?.nama ??
                  `Member ${t.id_member}`
                }
              </td>
              <td style="padding:8px;border:1px solid #ccc">${t.tgl}</td>
              <td style="padding:8px;border:1px solid #ccc">${t.status}</td>
              <td style="padding:8px;border:1px solid #ccc">${t.dibayar}</td>
              <td style="padding:8px;border:1px solid #ccc">Rp ${formatRupiah(t.grand_total ?? 0)}</td>
            </tr>
          `;
      })
      .join("");

    const summaryHtml = `
      <div style="margin-bottom:10px;font-size:14px">
        <b>Total Transaksi:</b> ${summary.totalTransactions} &nbsp; |
        <b>Total Pendapatan:</b> Rp ${formatRupiah(summary.totalRevenue)} &nbsp; |
        <b>Sudah Dibayar:</b> ${summary.paidCount} &nbsp; |
        <b>Belum Dibayar:</b> ${summary.unpaidCount}
      </div>
    `;

    const style = `
      <style>
        body { font-family: Arial; padding:20px; }
        table { border-collapse: collapse; width:100%; }
        th { background:#eee; padding:8px; border:1px solid #ccc; }
      </style>
    `;

    const html = `
      <html>
        <head><title>${title}</title>${style}</head>
        <body>
          <h1>${title}</h1>
          ${summaryHtml}
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Member</th>
                <th>Tgl Masuk</th>
                <th>Status</th>
                <th>Dibayar</th>
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || `<tr><td colspan="6" style="padding:12px;text-align:center">Tidak ada data</td></tr>`}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return alert("Pop-up diblokir, izinkan pop-up.");

    w.document.open();
    w.document.write(html);
    w.document.close();

    setTimeout(() => {
      w.focus();
      w.print();
    }, 500);
  };

  /* ============================
     RENDER
  ===============================*/
  return (
    <div className="space-y-10 p-4 md:p-6">
      
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Generate Laporan</h1>

        <button
          onClick={handleExportPdf}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          + Export PDF / Print
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-[#0D1526] p-6 rounded-2xl border border-gray-700 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white">Filter Laporan</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Controls */}
          <div>
            <label htmlFor="tanggal_mulai" className="text-gray-300 text-sm">Tanggal Mulai</label>
            <input
              id="tanggal_mulai"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#152036] border border-gray-700 text-white"
            />
          </div>

          <div>
            <label htmlFor="tanggal_selesai" className="text-gray-300 text-sm">Tanggal Selesai</label>
            <input
              id="tanggal_selesai"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#152036] border border-gray-700 text-white"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="text-gray-300 text-sm">Status</label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#152036] border border-gray-700 text-white"
            >
              <option value="">Semua</option>
              <option value="baru">Baru</option>
              <option value="proses">Proses</option>
              <option value="selesai">Selesai</option>
              <option value="diambil">Diambil</option>
            </select>
          </div>

          {/* Outlet */}
          <div>
            <label htmlFor="outlet" className="text-gray-300 text-sm">Outlet</label>
            <select
              id="outlet"
              value={filterOutlet === "" ? "" : filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-[#152036] border border-gray-700 text-white"
            >
              <option value="">Semua</option>
              {outletsDb.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D1526] p-5 rounded-2xl border border-gray-700">
          <div className="text-gray-300 text-sm">Total Transaksi</div>
          <div className="text-3xl mt-1 font-bold text-white">{summary.totalTransactions}</div>
        </div>

        <div className="bg-[#0D1526] p-5 rounded-2xl border border-gray-700">
          <div className="text-gray-300 text-sm">Total Pendapatan</div>
          <div className="text-3xl mt-1 font-bold text-white">Rp {formatRupiah(summary.totalRevenue)}</div>
        </div>

        <div className="bg-[#0D1526] p-5 rounded-2xl border border-gray-700">
          <div className="text-gray-300 text-sm">Sudah Dibayar</div>
          <div className="text-3xl mt-1 font-bold text-white">{summary.paidCount}</div>
        </div>

        <div className="bg-[#0D1526] p-5 rounded-2xl border border-gray-700">
          <div className="text-gray-300 text-sm">Belum Dibayar</div>
          <div className="text-3xl mt-1 font-bold text-white">{summary.unpaidCount}</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#0D1526] p-6 rounded-2xl border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Hasil Laporan</h2>

        <table className="w-full text-gray-300">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="pb-3 text-left">Invoice</th>
              <th className="pb-3 text-left">Member</th>
              <th className="pb-3 text-left">Tgl Masuk</th>
              <th className="pb-3 text-left">Status</th>
              <th className="pb-3 text-left">Dibayar</th>
              <th className="pb-3 text-left">Grand Total</th>
              <th className="pb-3 text-left">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {dataFiltered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-5 text-center text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            ) : (
              dataFiltered.map((t) => {
                const member = membersDb.find((m) => m.id === t.id_member)?.nama ?? t.id_member;
                return (
                  <tr key={t.id} className="border-b border-gray-800 hover:bg-[#152036]/40">
                    <td className="py-3">{t.kode_invoice}</td>
                    <td>{member}</td>
                    <td>{t.tgl}</td>
                    <td>{t.status}</td>
                    <td>{t.dibayar}</td>
                    <td>Rp {formatRupiah(t.grand_total ?? 0)}</td>
                    <td>
                      <button
                        className="text-blue-400 hover:underline"
                        onClick={() => setSelectedTransaksi(t)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedTransaksi && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-start pt-24 z-50">
          <div className="bg-[#0D1526] p-6 w-full max-w-xl rounded-2xl border border-gray-700 shadow-xl max-h-[85vh] overflow-y-auto">

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Detail Transaksi</h3>
                <div className="text-gray-400 text-sm">{selectedTransaksi.kode_invoice}</div>
              </div>

              <button
                onClick={() => setSelectedTransaksi(null)}
                className="text-gray-400 text-xl"
              >
                ✕
              </button>
            </div>

            {/* INFO */}
            <div className="grid grid-cols-2 gap-4 text-gray-300 mb-5">
              <div>
                <div className="text-sm">Member</div>
                <div className="text-white">
                  {membersDb.find((m) => m.id === selectedTransaksi.id_member)?.nama}
                </div>
              </div>

              <div>
                <div className="text-sm">Tanggal</div>
                <div className="text-white">{selectedTransaksi.tgl}</div>
              </div>

              <div>
                <div className="text-sm">Batas Waktu</div>
                <div className="text-white">{selectedTransaksi.batas_waktu}</div>
              </div>

              <div>
                <div className="text-sm">Status</div>
                <div className="text-white">{selectedTransaksi.status}</div>
              </div>
            </div>

            {/* DETAIL ITEMS */}
            <div className="bg-[#152036] p-4 rounded-xl border border-gray-700 mb-5">
              <table className="w-full text-gray-300">
                <thead>
                  <tr className="text-gray-400">
                    <th className="pb-2 text-left">Paket</th>
                    <th className="pb-2 text-right">Harga/Kg</th>
                    <th className="pb-2 text-right">Qty</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {getDetailsFor(selectedTransaksi.id).map((d) => (
                    <tr key={d.id}>
                      <td className="py-2">{d.nama_paket}</td>
                      <td className="py-2 text-right">Rp {formatRupiah(d.harga_perkilo)}</td>
                      <td className="py-2 text-right">{d.qty}</td>
                      <td className="py-2 text-right">Rp {formatRupiah(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS */}
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">
                  Rp{" "}
                  {formatRupiah(
                    getDetailsFor(selectedTransaksi.id).reduce((s, it) => s + it.subtotal, 0)
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Biaya Tambahan</span>
                <span className="text-white">Rp {formatRupiah(selectedTransaksi.biaya_tambahan)}</span>
              </div>

              <div className="flex justify-between">
                <span>Diskon</span>
                <span className="text-white">{(selectedTransaksi.diskon * 100).toFixed(0)}%</span>
              </div>

              <div className="flex justify-between">
                <span>Pajak</span>
                <span className="text-white">Rp {formatRupiah(selectedTransaksi.pajak)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg text-white border-t border-gray-700 pt-2">
                <span>Grand Total</span>
                <span>Rp {formatRupiah(selectedTransaksi.grand_total ?? 0)}</span>
              </div>
            </div>

            <div className="text-right mt-6">
              <button
                onClick={() => setSelectedTransaksi(null)}
                className="px-4 py-2 bg-gray-700 rounded-xl text-white hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
