import type { ComponentType } from 'react';
import { Users, Package, ShoppingBag } from 'lucide-react';

export default function CoopDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Farmers" value="0" />
        <StatCard icon={Package} label="Total Produce" value="0 kg" />
        <StatCard icon={ShoppingBag} label="Active Orders" value="0" />
      </div>
      <div className="bg-surface-low rounded-2xl border border-[#ece7e4] p-8 text-center">
        <p className="font-sans text-on-surface-variant">
          Cooperative member management and produce aggregation — coming in Phase 2.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece7e4]">
      <Icon className="w-6 h-6 text-primary" />
      <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mt-4">{label}</p>
      <p className="font-serif text-2xl font-bold text-primary mt-1">{value}</p>
    </div>
  );
}
