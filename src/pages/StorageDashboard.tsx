import { Warehouse } from 'lucide-react';

export default function StorageDashboard() {
  return (
    <div className="bg-surface-low rounded-2xl border border-[#ece7e4] p-12 text-center">
      <Warehouse className="w-12 h-12 text-primary/40 mx-auto" />
      <h3 className="font-serif text-xl font-bold text-primary mt-4">Storage Provider Module</h3>
      <p className="font-sans text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
        Facility registration, capacity management, and booking flows — coming in Phase 3.
      </p>
    </div>
  );
}
