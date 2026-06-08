import { Package } from 'lucide-react';

const ORDER_STATUSES = [
  'Pending',
  'Accepted',
  'In Transit',
  'Delivered',
  'Completed',
] as const;

export default function Orders() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {ORDER_STATUSES.map((status) => (
          <span
            key={status}
            className="px-3 py-1 rounded-full bg-surface-low border border-[#ece7e4] font-sans text-xs font-semibold text-on-surface-variant"
          >
            {status}
          </span>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#ece7e4] p-12 text-center">
        <Package className="w-12 h-12 text-primary/30 mx-auto" />
        <h3 className="font-serif text-xl font-bold text-primary mt-4">No orders yet</h3>
        <p className="font-sans text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
          Orders will appear here once buyers place orders and farmers accept them.
          Order references follow the format MVN-{'{YEAR}'}-{'{5-digit-seq}'}.
        </p>
      </div>
    </div>
  );
}
