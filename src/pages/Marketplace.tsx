import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { RWANDA_DISTRICTS } from '@/lib/rwanda';

const DEMO_LISTINGS = [
  {
    id: '1',
    crop: 'Arabica Coffee',
    farmer: 'Claudine M.',
    district: 'Nyamagabe',
    grade: 'Grade A',
    price: 3200,
    quantity: 500,
    harvestDate: '2026-05-28',
  },
  {
    id: '2',
    crop: 'Maize',
    farmer: 'Emmanuel K.',
    district: 'Kayonza',
    grade: 'Grade B',
    price: 450,
    quantity: 2000,
    harvestDate: '2026-06-01',
  },
  {
    id: '3',
    crop: 'Irish Potatoes',
    farmer: 'Jean P.',
    district: 'Musanze',
    grade: 'Grade A',
    price: 380,
    quantity: 1500,
    harvestDate: '2026-06-03',
  },
];

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');

  const filtered = DEMO_LISTINGS.filter((l) => {
    const matchesSearch =
      !search ||
      l.crop.toLowerCase().includes(search.toLowerCase()) ||
      l.district.toLowerCase().includes(search.toLowerCase());
    const matchesDistrict = !district || l.district === district;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-6">
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

      {filtered.length === 0 ? (
        <div className="text-center py-16 font-sans text-on-surface-variant">
          No listings match your search. Try adjusting filters.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <article
              key={listing.id}
              className="bg-white rounded-2xl border border-[#ece7e4] overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-32 bg-primary/5 flex items-center justify-center">
                <span className="font-serif text-lg font-bold text-primary/40">{listing.crop}</span>
              </div>
              <div className="p-5">
                <h3 className="font-serif font-bold text-primary">{listing.crop}</h3>
                <p className="font-sans text-sm text-on-surface-variant mt-1">
                  {listing.farmer} · {listing.district}
                </p>
                <div className="flex justify-between items-center mt-4 font-sans text-sm">
                  <span className="font-bold text-secondary">
                    {listing.price.toLocaleString()} RWF/kg
                  </span>
                  <span className="text-on-surface-variant">{listing.quantity} kg</span>
                </div>
                <p className="font-sans text-xs text-on-surface-variant mt-2">
                  {listing.grade} · Harvested {listing.harvestDate}
                </p>
                <button
                  type="button"
                  onClick={() => alert('Order placement will connect to Supabase in Phase 1.')}
                  className="w-full mt-4 bg-primary text-white py-2.5 rounded-xl font-sans text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Place Order
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
