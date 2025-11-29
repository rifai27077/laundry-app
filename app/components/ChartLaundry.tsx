"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

export default function ChartLaundry({
  dailyData,
  monthlyData,
}: {
  dailyData: { day: string; masuk: number }[];
  monthlyData: { month: string; masuk: number }[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">

      {/* ===================== GRAFIK HARIAN (60%) ===================== */}
      <div className="lg:col-span-6 bg-[#0D1526] p-6 rounded-2xl shadow-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">
          Laundry Masuk per Hari
        </h3>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyData}>
            {/* Garis grid halus */}
            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />

            {/* Axis minimalis */}
            <XAxis
              dataKey="day"
              stroke="#94A3B8"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#94A3B8"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "1px solid #475569",
                borderRadius: "10px",
                color: "white"
              }}
            />

            {/* LINE STYLE seperti screenshot */}
            <Line
              type="monotone"
              dataKey="masuk"
              stroke="#3b82f6"
              strokeWidth={4}
              dot={{
                r: 5,
                strokeWidth: 3,
                stroke: "#1E40AF",
                fill: "#3b82f6"
              }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ===================== GRAFIK BULANAN (40%) ===================== */}
      <div className="lg:col-span-4 bg-[#0D1526] p-6 rounded-2xl shadow-xl border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">
          Laundry Masuk per Bulan
        </h3>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData}>
            <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" />

            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#94A3B8"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={{ stroke: "#334155" }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "1px solid #475569",
                borderRadius: "10px",
                color: "white"
              }}
            />

            {/* Bar modern rounded */}
            <Bar
              dataKey="masuk"
              fill="#10b981"
              radius={[12, 12, 0, 0]}
              barSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
