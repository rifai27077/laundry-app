"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { featuresByRole } from "./featuresByRole";
import { LogOut, UserCircle2, Menu } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role ?? "admin";
  const menu = featuresByRole[role];

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50
          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          shadow-xl p-6 flex flex-col transition-transform duration-300 
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Profile Section */}
        <div className="flex items-center gap-3 mb-10">
          <UserCircle2 className="w-11 h-11 text-gray-600 dark:text-gray-300" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-200 text-lg">
              {session?.user?.nama ?? "User"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {role}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {menu.map((item: any, index: number) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <Link
                key={index}
                href={item.path}
                className={`
                  flex items-center gap-3 p-3 rounded-xl
                  transition-all duration-200 group
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
                onClick={() => setOpen(false)}
              >
                <Icon
                  className={`
                    w-5 h-5 transition-transform duration-200 
                    group-hover:scale-110
                    ${active ? "text-white" : item.color}
                  `}
                />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={() => signOut()}
          className="
            flex items-center gap-3 p-3 mt-6 
            rounded-xl text-red-600 
            hover:bg-red-100 dark:hover:bg-red-900 
            transition
          "
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </aside>
    </>
  );
}
