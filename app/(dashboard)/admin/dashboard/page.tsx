"use client";

import RoleGuard from "@/app/components/RoleGuard";
import { useSession } from "next-auth/react";
import StatCard from "@/app/components/StatCard";
import ChartLaundry from "@/app/components/ChartLaundry";
import RevenueSummary from "@/app/components/RevenueSummary";

import {
  Users,
  Truck,
  Clock4,
  CheckCircle2,
  PackageCheck,
  XCircle,
} from "lucide-react";

type CustomUser = {
  nama?: string;
  name?: string;
  email?: string;
  image?: string;
};

export default function DashboardPage() {

  const { data: session } = useSession() as {
    data: { user: CustomUser } | null;
  };

  // Dummy untuk dihubungkan ke DB nanti
  const stats = {
    customers: 120,
    masuk: 45,
    diproses: 18,
    selesai: 22,
    diambil: 15,
    dibatalkan: 2,
  };

  // ----- GRAFIK LAUNDRY -----
  const dailyData = [
    { day: "Sen", masuk: 10 },
    { day: "Sel", masuk: 15 },
    { day: "Rab", masuk: 7 },
    { day: "Kam", masuk: 12 },
    { day: "Jum", masuk: 20 },
    { day: "Sab", masuk: 14 },
    { day: "Min", masuk: 5 },
  ];

  const monthlyData = [
    { month: "Jan", masuk: 120 },
    { month: "Feb", masuk: 90 },
    { month: "Mar", masuk: 150 },
    { month: "Apr", masuk: 130 },
    { month: "Mei", masuk: 170 },
    { month: "Jun", masuk: 160 },
  ];

  // ----- GRAFIK PENDAPATAN -----
  const dailyRevenue = [
    { day: "Sen", total: 250000 },
    { day: "Sel", total: 270000 },
    { day: "Rab", total: 180000 },
    { day: "Kam", total: 300000 },
    { day: "Jum", total: 410000 },
    { day: "Sab", total: 350000 },
    { day: "Min", total: 120000 },
  ];

  const monthlyRevenue = [
    { month: "Jan", total: 4_200_000 },
    { month: "Feb", total: 3_800_000 },
    { month: "Mar", total: 5_100_000 },
    { month: "Apr", total: 4_700_000 },
    { month: "Mei", total: 6_000_000 },
  ];

  const yearlyRevenue = [
    { year: "2021", total: 38_000_000 },
    { year: "2022", total: 42_000_000 },
    { year: "2023", total: 55_000_000 },
    { year: "2024", total: 61_000_000 },
  ];

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="space-y-10 p-4 md:p-6">

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-lg border dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white leading-tight">
            Selamat Datang,
            <span className="text-blue-600 dark:text-blue-400">
              {" "}
              {session?.user?.nama ?? "Admin"}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-3">
            Ringkasan aktivitas & pendapatan laundry.
          </p>
        </div>

        {/* STATISTIK */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
            Statistik Laundry
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatCard title="Total Customer" value={stats.customers} color="bg-blue-600" icon={<Users />} />
            <StatCard title="Laundry Masuk" value={stats.masuk} color="bg-yellow-500" icon={<Truck />} />
            <StatCard title="Sedang Diproses" value={stats.diproses} color="bg-orange-500" icon={<Clock4 />} />
            <StatCard title="Laundry Selesai" value={stats.selesai} color="bg-green-600" icon={<CheckCircle2 />} />
            <StatCard title="Sudah Diambil" value={stats.diambil} color="bg-purple-600" icon={<PackageCheck />} />
            <StatCard title="Dibatalkan" value={stats.dibatalkan} color="bg-red-600" icon={<XCircle />} />
          </div>
        </div>

        {/* GRAFIK PENDAPATAN */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
            Grafik Pendapatan
          </h2>

          <RevenueSummary
            daily={dailyRevenue}
            monthly={monthlyRevenue}
            yearly={yearlyRevenue}
          />

        </div>

        {/* GRAFIK LAUNDRY */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-200">
            Grafik Laundry Masuk
          </h2>

          <ChartLaundry
            dailyData={dailyData}
            monthlyData={monthlyData}
          />
        </div>

      </div>
    </RoleGuard>
  );
}
