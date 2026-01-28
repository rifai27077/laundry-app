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
              <th>Jenis</th>
              <th>Alamat</th>
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
                <td>{m.tlp}</td>
                <td>{m.jenis_kelamin}</td>
                <td>{m.alamat}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
