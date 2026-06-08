import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Truck } from 'lucide-react';
import { useUser } from '@clerk/react';
import { useActiveListingsCount } from '@/hooks/useProduceListings';
import { useOrderStats } from '@/hooks/useOrders';
import { ROUTES } from '@/lib/routes';

export default function BuyerDashboard() {
  const { user } = useUser();
  const { data: listingCount = 0 } = useActiveListingsCount();
  const { data: orderStats } = useOrderStats(user?.id ?? '', 'Buyer');

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-6">
        <StatCard label="Available Produce" value={`${listingCount} listings`} />
        <StatCard label="Active Orders" value={String(orderStats?.active ?? 0)} />
        <StatCard label="In Delivery" value={String(orderStats?.inDelivery ?? 0)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to={ROUTES.marketplace}
          className="bg-white rounded-2xl p-6 border border-[#ece7e4] hover:border-primary/30 hover:shadow-md transition-all flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-primary">Search Produce</h3>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Browse the marketplace by crop, district, and price.
            </p>
          </div>
        </Link>
        <Link
          to={ROUTES.orders}
          className="bg-white rounded-2xl p-6 border border-[#ece7e4] hover:border-primary/30 hover:shadow-md transition-all flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Truck className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-primary">Track Deliveries</h3>
            <p className="font-sans text-sm text-on-surface-variant mt-1">
              Monitor order status from placement to delivery.
            </p>
          </div>
        </Link>
      </div>

      {(orderStats?.active ?? 0) === 0 ? (
        <div className="bg-surface-low rounded-2xl p-8 border border-[#ece7e4] text-center">
          <ShoppingBag className="w-10 h-10 text-primary/40 mx-auto" />
          <p className="font-sans text-on-surface-variant mt-4">
            No active orders yet. Browse the marketplace to place your first order.
          </p>
          <Link
            to={ROUTES.marketplace}
            className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-sans text-sm font-bold hover:bg-primary/90 transition-all"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#ece7e4]">
      <p className="font-sans text-xs font-bold text-on-surface-variant uppercase">{label}</p>
      <p className="font-serif text-2xl font-bold text-primary mt-2">{value}</p>
    </div>
  );
}
