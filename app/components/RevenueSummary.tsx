"use client";

import { DollarSign } from "lucide-react";

export default function RevenueSummary({
  todayRevenue = 0,
  monthRevenue = 0,
  yearRevenue = 0,
}: {
  todayRevenue?: number;
  monthRevenue?: number;
  yearRevenue?: number;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

      {/* ======================= LEFT (60%) ======================= */}
      <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0D1526] border border-gray-700 shadow-xl">
        <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
          <h3 className="text-xl font-bold text-white">Pendapatan</h3>
          <span className="text-sm text-gray-400">
            Pendapatan Tahunan & Bulanan
          </span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">

          {/* Tahun Ini */}
          <div className="bg-[#152036] p-4 rounded-xl flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex justify-center items-center">
              <DollarSign className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                Rp {yearRevenue.toLocaleString("id-ID")}
              </p>
              <p className="text-gray-400 text-sm">Tahun Ini</p>
            </div>
          </div>

          {/* Bulan Ini */}
          <div className="bg-[#152036] p-4 rounded-xl flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-full bg-cyan-500 flex justify-center items-center">
              <DollarSign className="text-white" size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                Rp {monthRevenue.toLocaleString("id-ID")}
              </p>
              <p className="text-gray-400 text-sm">Bulan Ini</p>
            </div>
          </div>

        </div>
      </div>

      {/* ======================= RIGHT (40%) ======================= */}
      <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0D1526] border border-gray-700 shadow-xl">
        <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
          <h3 className="text-xl font-bold text-white">Pendapatan</h3>
          <span className="text-sm text-gray-400">Pendapatan Hari Ini</span>
        </div>

        <div className="grid grid-cols-1 gap-4">

          {/* Hari Ini */}
          <div className="bg-[#152036] p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex justify-center items-center">
              <DollarSign className="text-white" size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                Rp {todayRevenue.toLocaleString("id-ID")}
              </p>
              <p className="text-gray-400 text-sm">
                Hari Ini
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
