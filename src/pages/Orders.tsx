import { useUser } from '@clerk/react';
import { Loader2, Package } from 'lucide-react';
import { useToast } from '@/components/feedback/Toast';
import { useOrdersRealtime } from '@/hooks/useOrderRealtime';
import { useBuyerOrders, useFarmerOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useRole } from '@/hooks/useRole';
import type { OrderStatus } from '@/lib/database.types';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Accepted',
  'In Transit',
  'Delivered',
  'Completed',
];

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Accepted: 'bg-blue-50 text-blue-800 border-blue-200',
  'In Transit': 'bg-purple-50 text-purple-800 border-purple-200',
  Delivered: 'bg-green-50 text-green-800 border-green-200',
  Completed: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function Orders() {
  const { user } = useUser();
  const { role } = useRole();
  const { showToast } = useToast();
  const userId = user?.id ?? '';

  const buyerQuery = useBuyerOrders(role === 'Buyer' ? userId : '');
  const farmerQuery = useFarmerOrders(role === 'Farmer' ? userId : '');
  const updateStatus = useUpdateOrderStatus();

  useOrdersRealtime(userId, role === 'Farmer' ? 'Farmer' : 'Buyer');

  const query = role === 'Farmer' ? farmerQuery : buyerQuery;
  const orders = query.data ?? [];
  const isLoading = query.isLoading;

  const handleAccept = async (orderId: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: 'Accepted' });
      showToast('Order accepted.', 'success');
    } catch {
      showToast('Could not update order.', 'error');
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: 'Delivered' });
      showToast('Order marked as delivered.', 'success');
    } catch {
      showToast('Could not update order.', 'error');
    }
  };

  const handleComplete = async (orderId: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: 'Completed' });
      showToast('Order completed.', 'success');
    } catch {
      showToast('Could not update order.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {!isSupabaseConfigured() ? (
        <p className="font-sans text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Supabase is not configured — orders will not load until env vars are set.
        </p>
      ) : null}

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

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#ece7e4] p-12 text-center">
          <Package className="w-12 h-12 text-primary/30 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-primary mt-4">No orders yet</h3>
          <p className="font-sans text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
            Orders will appear here once buyers place orders and farmers accept them.
            Order references follow the format MVN-{'{YEAR}'}-{'{5-digit-seq}'}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const listing = order.produce_listings as
              | { crop_name?: string; quantity_kg?: number; images?: string[] }
              | null;
            const counterparty =
              role === 'Farmer'
                ? (order.profiles as { full_name?: string; phone?: string } | null)
                : (order.profiles as { full_name?: string; phone?: string } | null);
            const statusClass =
              STATUS_COLORS[order.status] ?? 'bg-surface-low text-on-surface-variant border-[#ece7e4]';

            return (
              <article
                key={order.id}
                className="bg-white rounded-2xl border border-[#ece7e4] p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif font-bold text-primary">
                      {order.order_ref ?? order.id.slice(0, 8)}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full border text-xs font-sans font-semibold ${statusClass}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-sans text-sm text-on-surface-variant mt-1">
                    {listing?.crop_name ?? 'Produce'} · {Number(order.quantity_kg).toLocaleString()} kg ·{' '}
                    {Number(order.total_rwf).toLocaleString()} RWF
                  </p>
                  {counterparty?.full_name ? (
                    <p className="font-sans text-xs text-on-surface-variant mt-1">
                      {role === 'Farmer' ? 'Buyer' : 'Farmer'}: {counterparty.full_name}
                      {counterparty.phone ? ` · ${counterparty.phone}` : ''}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {role === 'Farmer' && order.status === 'Pending' ? (
                    <button
                      type="button"
                      disabled={updateStatus.isPending}
                      onClick={() => handleAccept(order.id)}
                      className="px-4 py-2 rounded-xl bg-primary text-white font-sans text-xs font-bold hover:bg-primary/90 cursor-pointer disabled:opacity-60"
                    >
                      Accept
                    </button>
                  ) : null}
                  {role === 'Farmer' && order.status === 'Accepted' ? (
                    <button
                      type="button"
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutateAsync({ orderId: order.id, status: 'In Transit' })}
                      className="px-4 py-2 rounded-xl bg-secondary text-white font-sans text-xs font-bold hover:bg-secondary/90 cursor-pointer disabled:opacity-60"
                    >
                      Mark In Transit
                    </button>
                  ) : null}
                  {role === 'Farmer' && order.status === 'In Transit' ? (
                    <button
                      type="button"
                      disabled={updateStatus.isPending}
                      onClick={() => handleMarkDelivered(order.id)}
                      className="px-4 py-2 rounded-xl bg-secondary text-white font-sans text-xs font-bold hover:bg-secondary/90 cursor-pointer disabled:opacity-60"
                    >
                      Mark Delivered
                    </button>
                  ) : null}
                  {role === 'Buyer' && order.status === 'Delivered' ? (
                    <button
                      type="button"
                      disabled={updateStatus.isPending}
                      onClick={() => handleComplete(order.id)}
                      className="px-4 py-2 rounded-xl bg-primary text-white font-sans text-xs font-bold hover:bg-primary/90 cursor-pointer disabled:opacity-60"
                    >
                      Confirm Received
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
