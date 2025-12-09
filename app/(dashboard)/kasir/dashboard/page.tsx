"use client";

import { useEffect, useState } from "react";
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

type DashboardStats = {
  masuk: number;
  diproses: number;
  selesai: number;
  diambil: number;
  dibatalkan: number;
};

type RevenueItem = {
  day?: string;
  month?: string;
  year?: string;
  total: number;
};

type ChartItem = {
  day: string;     // wajib
  month: string;   // wajib
  masuk: number;
};

type DashboardResponse = {
  customers: number;
  stats: DashboardStats;
  daily: ChartItem[];
  monthly: ChartItem[];
  dailyRevenue: RevenueItem[];
  monthlyRevenue: RevenueItem[];
  yearlyRevenue: RevenueItem[];
};

type IncomingChartItem = {
  day?: string;
  month?: string;
  masuk?: number;
};

export default function DashboardPage() {
  const { data: session } = useSession() as {
    data: { user: CustomUser } | null;
  };

  const [loading, setLoading] = useState(true);
const [data, setData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const json = await res.json();

        setData({
        ...json,

        daily: (json.daily as IncomingChartItem[])?.map((d) => ({
          day: d.day ?? "",
          month: d.month ?? "",
          masuk: d.masuk ?? 0,
        })) ?? [],

        monthly: (json.monthly as IncomingChartItem[])?.map((d) => ({
          day: d.day ?? "",
          month: d.month ?? "",
          masuk: d.masuk ?? 0,
        })) ?? [],

        stats: json.stats ?? {
          masuk: 0,
          diproses: 0,
          selesai: 0,
          diambil: 0,
          dibatalkan: 0,
        },
      });

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 text-center text-gray-600 dark:text-gray-300">
        Loading dashboard...
      </div>
    );
  }

  const dailyData = data.daily;
  const monthlyData = data.monthly;

  const dailyRevenue = data.dailyRevenue;
  const monthlyRevenue = data.monthlyRevenue;
  const yearlyRevenue = data.yearlyRevenue;

  return (
    <RoleGuard allowedRoles={["kasir"]}>
      <div className="space-y-10 p-4 md:p-6">

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-900 p-6 md:p-8 rounded-2xl shadow-lg border dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white leading-tight">
            Selamat Datang,
            <span className="text-blue-600 dark:text-blue-400">
              {" "}
              {session?.user?.nama ?? "Kasir"}
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
            <StatCard title="Total Customer" value={data.customers} color="bg-blue-600" icon={<Users />} />
            <StatCard title="Laundry Masuk" value={data.stats.masuk} color="bg-yellow-500" icon={<Truck />} />
            <StatCard title="Sedang Diproses" value={data.stats.diproses} color="bg-orange-500" icon={<Clock4 />} />
            <StatCard title="Laundry Selesai" value={data.stats.selesai} color="bg-green-600" icon={<CheckCircle2 />} />
            <StatCard title="Sudah Diambil" value={data.stats.diambil} color="bg-purple-600" icon={<PackageCheck />} />
            <StatCard title="Dibatalkan" value={data.stats.dibatalkan} color="bg-red-600" icon={<XCircle />} />
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
