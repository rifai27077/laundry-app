import {
  LayoutDashboard,
  Users,
  Store,
  PackageSearch,
  UserCog,
  FilePlus,
  BarChart3,
  Receipt,
  ListChecks,
} from "lucide-react";

export const featuresByRole = {
  admin: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      color: "text-blue-600",
      path: "/admin/dashboard",
    },
    {
      title: "Registrasi Pelanggan",
      icon: Users,
      color: "text-blue-600",
      path: "/admin/customers",
    },
    {
      title: "Outlet",
      icon: Store,
      color: "text-green-600",
      path: "/admin/outlets",
    },
    {
      title: "Paket Cucian",
      icon: PackageSearch,
      color: "text-yellow-600",
      path: "/admin/packages",
    },
    {
      title: "Pengguna",
      icon: UserCog,
      color: "text-purple-600",
      path: "/admin/users",
    },
    {
      title: "Entri Transaksi",
      icon: FilePlus,
      color: "text-orange-600",
      path: "/admin/transactions",
    },
    {
      title: "Generate Laporan",
      icon: BarChart3,
      color: "text-red-600",
      path: "/admin/reports",
    },
  ],

  kasir: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      color: "text-blue-600",
      path: "/kasir/dashboard",
    },
    {
      title: "Registrasi Pelanggan",
      icon: Users,
      color: "text-blue-600",
      path: "/kasir/customers",
    },
    {
      title: "Entri Transaksi",
      icon: Receipt,
      color: "text-orange-600",
      path: "/kasir/transactions",
    },
    {
      title: "Generate Laporan",
      icon: ListChecks,
      color: "text-green-600",
      path: "/kasir/reports",
    },
  ],

  owner: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      color: "text-blue-600",
      path: "/owner/dashboard",
    },
    {
      title: "Lihat Laporan",
      icon: BarChart3,
      color: "text-blue-600",
      path: "/owner/reports",
    },
    {
      title: "Data Transaksi",
      icon: Receipt,
      color: "text-purple-600",
      path: "/owner/transactions",
    },
  ],
};
