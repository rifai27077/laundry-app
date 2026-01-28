"use client";

import { useState, useEffect } from "react";
import ModalRegisterMember from "@/app/components/ModalRegisterMember";
import Pagination from "@/app/components/Pagination";

interface Member {
  id: number;
  nama: string;
  tlp: string;
  jenis_kelamin: string;
  alamat: string;
  poin: number;
  saldo: number;
}

interface FormMember {
  nama: string;
  tlp: string;
  jenis_kelamin: string;
  alamat: string;
}

export default function MemberPage() {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Top Up State
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [topUpAmount, setTopUpAmount] = useState(0);

  const loadMembers = async (page = 1) => {
    const res = await fetch(`/api/member?page=${page}&limit=${limit}`);
    const result = await res.json();
    setMembers(result.data || []);
    setCurrentPage(result.meta?.page || 1);
    setTotalPages(result.meta?.totalPages || 1);
  };

  const handleSubmit = async (form: FormMember) => {
    const res = await fetch("/api/member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);

    setOpen(false);
    loadMembers();
  };

  const handleTopUp = async () => {
    if (!selectedMember || topUpAmount <= 0) return;
    
    try {
      const res = await fetch("/api/member/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_member: selectedMember.id, jumlah: topUpAmount })
      });
      
      if (res.ok) {
        alert("Top up berhasil");
        setTopUpOpen(false);
        setTopUpAmount(0);
        loadMembers(currentPage);
      } else {
        alert("Gagal top up");
      }
    } catch (error) {
      console.error("TopUp Error:", error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadMembers(currentPage);
  }, [currentPage]);

  return (
    <div className="space-y-10 p-4 md:p-6">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Data Pelanggan</h1>

        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          + Tambah Pelanggan
        </button>
      </div>

      <ModalRegisterMember
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />

      <div className="bg-[#0D1526] p-6 rounded-2xl border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Daftar Pelanggan</h2>

        <table className="w-full text-left text-gray-300">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2">Nama</th>
              <th>Telepon</th>
              <th>Poin</th>
              <th>Saldo</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Belum ada data pelanggan
                </td>
              </tr>
            )}

            {members.map((m) => (
              <tr key={m.id} className="border-b border-gray-700">
                <td className="py-2">{m.nama}</td>
                <td>{m.tlp || '-'}</td>
                <td className="text-yellow-400 font-bold">{m.poin}</td>
                <td className="text-green-400 font-bold">Rp {m.saldo?.toLocaleString()}</td>
                <td>{m.alamat || '-'}</td>
                <td>
                  <button 
                    onClick={() => { setSelectedMember(m); setTopUpOpen(true); }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Top Up
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOP UP MODAL */}
        {topUpOpen && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-[#0D1526] p-6 rounded-2xl w-full max-w-sm border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4 text-center">Top Up Saldo</h2>
              <p className="text-gray-400 text-sm mb-4 text-center">{selectedMember?.nama}</p>
              
              <div className="space-y-4">
                <input 
                  type="number" 
                  autoFocus
                  className="w-full p-3 rounded-xl bg-[#152036] border border-gray-600 text-white text-center text-lg"
                  placeholder="Jumlah Top Up"
                  value={topUpAmount || ''}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setTopUpOpen(false)}
                    className="p-3 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-800"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleTopUp}
                    className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold"
                  >
                    Top Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

    </div>
  );
}
