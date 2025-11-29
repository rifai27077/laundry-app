import { LucideIcon } from "lucide-react";
import Link from "next/link";

export default function FeatureCard({
  title,
  icon: Icon,
  path,
  color,
}: {
  title: string;
  icon: LucideIcon;
  path: string;
  color: string;
}) {
  return (
    <Link href={path}>
      <div className="p-5 bg-white shadow rounded-xl border hover:shadow-lg transition cursor-pointer">
        <Icon className={`w-8 h-8 mb-3 ${color}`} />
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
    </Link>
  );
}
