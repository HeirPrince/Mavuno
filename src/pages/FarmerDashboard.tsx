import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { FileText, ShoppingBag, DollarSign, Bell, Plus, Truck } from 'lucide-react';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useOrderStats } from '@/hooks/useOrders';
import { useProduceListings } from '@/hooks/useProduceListings';
import { ROUTES } from '@/lib/routes';

export default function FarmerDashboard() {
  const { user } = useUser();
  const { listings } = useProduceListings();
  const { data: orderStats } = useOrderStats(user?.id ?? '', 'Farmer');
  const { unreadCount } = useUnreadNotificationCount(user?.id ?? '');

  const CARDS = [
    {
      label: 'Active Listings',
      value: String(listings.length),
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Orders',
      value: String(orderStats?.active ?? 0),
      icon: ShoppingBag,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Revenue (RWF)',
      value: (orderStats?.revenue ?? 0).toLocaleString(),
      icon: DollarSign,
      color: 'bg-tertiary/10 text-tertiary',
    },
    {
      label: 'Notifications',
      value: String(unreadCount),
      icon: Bell,
      color: 'bg-primary/10 text-primary',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-6 border border-[#ece7e4]"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-sans text-xs font-bold text-on-surface-variant uppercase mt-4">
                {card.label}
              </p>
              <p className="font-serif text-2xl font-bold text-primary mt-1">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ActionLink
          to={ROUTES.farmer.listings}
          icon={Plus}
          title="Add Produce"
          desc="List a new harvest for the marketplace"
        />
        <ActionLink
          to={ROUTES.orders}
          icon={ShoppingBag}
          title="View Orders"
          desc="Track incoming and active orders"
        />
        <ActionLink
          to={ROUTES.admin.requests}
          icon={Truck}
          title="Request Transport"
          desc="Arrange delivery for your produce"
        />
      </div>
    </div>
  );
}

function ActionLink({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="bg-white rounded-2xl p-6 border border-[#ece7e4] hover:border-primary/30 hover:shadow-md transition-all group"
    >
      <Icon className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
      <h3 className="font-serif font-bold text-primary mt-3">{title}</h3>
      <p className="font-sans text-sm text-on-surface-variant mt-1">{desc}</p>
    </Link>
  );
}
