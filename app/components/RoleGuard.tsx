"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const userRole = session?.user?.role;

    // Jika belum login → redirect ke login
    if (!userRole) {
      router.replace("/login");
      return;
    }

    // Jika tidak punya akses → redirect ke dashboard role dia
    if (!allowedRoles.includes(userRole)) {
      router.replace(`/${userRole}/dashboard`);
    }
  }, [session, status, router, allowedRoles]);

  return <>{children}</>;
}
