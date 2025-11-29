"use client";

import { useSession } from "next-auth/react";
import FeatureCard from "../../components/FeatureCard";
import { featuresByRole } from "../../components/featuresByRole";

export default function KasirDashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "kasir";

  const fitur = featuresByRole[role];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Dashboard Kasir
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {fitur.map((item: any, index: number) => (
          <FeatureCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
}
