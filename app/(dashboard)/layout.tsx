"use client";

import Sidebar from "@/app/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-6 transition-all overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
