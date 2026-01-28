import { useState, useEffect } from "react";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transaksi: {
    id: number;
    grand_total: number;
    kode_invoice: string;
    id_member?: number | null;
  } | null;
  onSuccess: () => void;
};

export default function PaymentModal({
  isOpen,
  onClose,
  transaksi,
  onSuccess,
}: PaymentModalProps) {
  const [jumlahBayar, setJumlahBayar] = useState<number>(0);
  const [metode, setMetode] = useState<"cash" | "transfer" | "qris" | "saldo">("cash");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberBalance, setMemberBalance] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && transaksi?.id_member) {
      fetch(`/api/member?id=${transaksi.id_member}`)
        .then(res => res.json())
        .then(data => {
            // Assuming the API returns a member object directly or in a specific format
            // Based on earlier context, api/member might return { data: [...] } for list or single object
            setMemberBalance(data.saldo ?? 0);
        })
        .catch(err => console.error("Fetch balance error:", err));
    }
  }, [isOpen, transaksi?.id_member]);

  // Auto-set jumlahBayar if using saldo
  useEffect(() => {
    if (metode === "saldo" && transaksi) {
      setJumlahBayar(transaksi.grand_total);
    }
  }, [metode, transaksi]);

  if (!isOpen || !transaksi) return null;

  const kembalian = Math.max(0, jumlahBayar - transaksi.grand_total);
  const kurang = Math.max(0, transaksi.grand_total - jumlahBayar);

  const handleBayar = async () => {
    if (jumlahBayar <= 0) {
      alert("Masukkan jumlah bayar");
      return;
    }

    if (metode === "saldo") {
        if (!transaksi.id_member) {
            alert("Hanya member yang bisa bayar pakai saldo!");
            return;
        }
        if (memberBalance !== null && memberBalance < transaksi.grand_total) {
            alert("Saldo tidak mencukupi!");
            return;
        }
    } else {
        if (jumlahBayar < transaksi.grand_total) {
          alert("Nominal pembayaran kurang dari total tagihan!");
          return;
        }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transaksi/bayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_transaksi: transaksi.id,
          jumlah_bayar: jumlahBayar,
          metode_pembayaran: metode,
          keterangan,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Pembayaran berhasil!");
        onSuccess();
        onClose();
      } else {
        alert(data.error || "Gagal memproses pembayaran");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-[#0D1526] p-6 rounded-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">
          Bayar: {transaksi.kode_invoice}
        </h2>

        <div className="mb-4 space-y-2 text-gray-300 text-sm">
            <div className="flex justify-between">
                <span>Total Tagihan:</span>
                <span className="text-white font-bold text-lg">Rp {transaksi.grand_total.toLocaleString()}</span>
            </div>
            {transaksi.id_member && memberBalance !== null && (
                <div className="flex justify-between text-blue-400">
                    <span>Saldo Member:</span>
                    <span className="font-bold">Rp {memberBalance.toLocaleString()}</span>
                </div>
            )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm block mb-1">Metode Pembayaran</label>
            <select 
               className="w-full p-3 rounded-xl bg-[#152036] border border-gray-600 text-white"
               value={metode}
               onChange={(e) => setMetode(e.target.value as any)}
            >
               <option value="cash">Cash / Tunai</option>
               <option value="transfer">Transfer Bank</option>
               <option value="qris">QRIS</option>
               <option value="saldo">Saldo Member</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm block mb-1">Jumlah Bayar</label>
            <input
              type="number"
              className={`w-full p-3 rounded-xl bg-[#152036] border border-gray-600 text-white ${metode === 'saldo' ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={jumlahBayar || ""}
              readOnly={metode === 'saldo'}
              onChange={(e) => setJumlahBayar(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm block mb-1">Keterangan (Opsional)</label>
            <textarea
              className="w-full p-2 rounded-xl bg-[#152036] border border-gray-600 text-white"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {metode !== 'saldo' && jumlahBayar > 0 && (
             <div className={`p-3 rounded-xl ${kurang > 0 ? 'bg-red-900/30 border border-red-800' : 'bg-green-900/30 border border-green-800'}`}>
                {kurang > 0 ? (
                    <div className="flex justify-between text-red-200">
                        <span>Kurang:</span>
                        <span className="font-bold">Rp {kurang.toLocaleString()}</span>
                    </div>
                ) : (
                    <div className="flex justify-between text-green-200">
                        <span>Kembalian:</span>
                        <span className="font-bold">Rp {kembalian.toLocaleString()}</span>
                    </div>
                )}
             </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="w-1/2 py-3 bg-gray-700 text-white rounded-xl"
              disabled={loading}
            >
              Batal
            </button>
            <button
              onClick={handleBayar}
              disabled={loading}
              className="w-1/2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500"
            >
              {loading ? "Proses..." : "Bayar Sekarang"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
