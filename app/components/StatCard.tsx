"use client";

import { ReactNode } from "react";

export default function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
}) {
  return (
    <div
      className="
        bg-white dark:bg-gray-900 
        p-5 rounded-2xl 
        shadow-md border dark:border-gray-700 
        flex items-center gap-4
        hover:shadow-lg hover:-translate-y-1 transition transform
      "
    >
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-xl text-white ${color}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
          {value}
        </h3>
      </div>
    </div>
  );
}
