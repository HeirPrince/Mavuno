import { useState } from 'react';
import { useUser } from '@clerk/react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/components/feedback/Toast';
import { useActiveListings } from '@/hooks/useProduceListings';
import { usePlaceOrder } from '@/hooks/useOrders';
import { useRole } from '@/hooks/useRole';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';
import { RWANDA_DISTRICTS } from '@/lib/rwanda';

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const { user } = useUser();
  const { role } = useRole();
  const { showToast } = useToast();
  const placeOrder = usePlaceOrder();

  const filters = {
    crop: search || undefined,
    district: district || undefined,
  };

  const { data: listings = [], isLoading, error } = useActiveListings(filters);

  const handlePlaceOrder = async (listing: (typeof listings)[number]) => {
    if (!isSupabaseConfigured()) {
      showToast('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 'error');
      return;
    }

    if (role !== 'Buyer') {
      showToast('Only buyers can place orders.', 'error');
      return;
    }

    if (!user?.id) {
      showToast('Sign in to place an order.', 'error');
      return;
    }

    const qtyRaw = window.prompt(
      `How many kg of ${listing.crop_name}? (max ${listing.quantity_kg} kg)`,
      String(Math.min(100, Number(listing.quantity_kg))),
    );
    if (!qtyRaw) return;

    const quantityKg = Number(qtyRaw);
    if (!Number.isFinite(quantityKg) || quantityKg <= 0 || quantityKg > Number(listing.quantity_kg)) {
      showToast('Enter a valid quantity within the listing amount.', 'error');
      return;
    }

    const totalRwf = Math.round(quantityKg * Number(listing.price_per_kg_rwf));

    try {
      await placeOrder.mutateAsync({
        buyer_id: user.id,
        farmer_id: listing.farmer_id,
        listing_id: listing.id,
        quantity_kg: quantityKg,
        total_rwf: totalRwf,
        status: 'Pending',
        delivery_type: 'delivery',
      });
      showToast('Order placed successfully.', 'success');
    } catch {
      showToast('Could not place order. Please try again.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {!isSupabaseConfigured() ? (
        <p className="font-sans text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Supabase is not configured — marketplace data will not load until env vars are set.
        </p>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Search by crop or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#ece7e4] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="pl-11 pr-8 py-3 rounded-xl border border-[#ece7e4] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-48"
          >
            <option value="">All districts</option>
            {RWANDA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16 font-sans text-red-600">
          Could not load listings. Check your Supabase connection and RLS policies.
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 font-sans text-on-surface-variant">
          No listings match your search. Try adjusting filters.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => {
            const farmerName = listing.profiles?.full_name ?? 'Farmer';
            const location = listing.location ?? listing.profiles?.district ?? 'Rwanda';
            const imageUrl = listing.images?.[0];

            return (
              <article
                key={listing.id}
                className="bg-white rounded-2xl border border-[#ece7e4] overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-32 bg-primary/5 flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={listing.crop_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-lg font-bold text-primary/40">{listing.crop_name}</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-serif font-bold text-primary">{listing.crop_name}</h3>
                  <p className="font-sans text-sm text-on-surface-variant mt-1">
                    {farmerName} · {location}
                  </p>
                  <div className="flex justify-between items-center mt-4 font-sans text-sm">
                    <span className="font-bold text-secondary">
                      {Number(listing.price_per_kg_rwf).toLocaleString()} RWF/kg
                    </span>
                    <span className="text-on-surface-variant">{Number(listing.quantity_kg).toLocaleString()} kg</span>
                  </div>
                  <p className="font-sans text-xs text-on-surface-variant mt-2">
                    {listing.quality_grade}
                    {listing.harvest_date ? ` · Harvested ${listing.harvest_date}` : ''}
                  </p>
                  {role === 'Buyer' ? (
                    <button
                      type="button"
                      disabled={placeOrder.isPending}
                      onClick={() => handlePlaceOrder(listing)}
                      className="w-full mt-4 bg-primary text-white py-2.5 rounded-xl font-sans text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {placeOrder.isPending ? 'Placing…' : 'Place Order'}
                    </button>
                  ) : (
                    <p className="font-sans text-xs text-on-surface-variant mt-4 text-center">
                      Sign in as a buyer to place orders.
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
