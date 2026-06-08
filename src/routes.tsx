import { Routes, Route } from 'react-router-dom';
import RequireAuth from '@/components/RequireAuth';
import RequireRole from '@/components/RequireRole';
import RoleRedirect from '@/components/RoleRedirect';
import AppLayout from '@/layouts/AppLayout';
import RoleLayout from '@/layouts/RoleLayout';
import { SignInPage, SignUpPage } from '@/pages/AuthPage';
import Landing from '@/pages/Landing';
import NotFound from '@/pages/NotFound';
import OnboardingPage from '@/pages/Onboarding';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import FleetPage from '@/pages/FleetPage';
import RequestsPage from '@/pages/RequestsPage';
import TrackingPage from '@/pages/TrackingPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import FarmerDashboard from '@/pages/FarmerDashboard';
import BuyerDashboard from '@/pages/BuyerDashboard';
import Marketplace from '@/pages/Marketplace';
import Orders from '@/pages/Orders';
import ProduceListings from '@/pages/ProduceListings';
import CoopDashboard from '@/pages/CoopDashboard';
import StorageDashboard from '@/pages/StorageDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="sign-in/*" element={<SignInPage />} />
      <Route path="sign-up/*" element={<SignUpPage />} />

      <Route element={<RequireAuth />}>
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="app" element={<RoleRedirect />} />

        <Route element={<RequireRole allowed="Farmer" />}>
          <Route element={<RoleLayout title="Farmer Dashboard" subtitle="Manage your produce and orders." />}>
            <Route path="app/farmer" element={<FarmerDashboard />} />
            <Route path="app/farmer/listings" element={<ProduceListings />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed="Buyer" />}>
          <Route element={<RoleLayout title="Buyer Dashboard" subtitle="Discover produce and track deliveries." />}>
            <Route path="app/buyer" element={<BuyerDashboard />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed={['Buyer', 'Farmer', 'Cooperative', 'Admin']} />}>
          <Route element={<RoleLayout title="Marketplace" subtitle="Browse active produce listings across Rwanda." />}>
            <Route path="app/marketplace" element={<Marketplace />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed={['Farmer', 'Buyer']} />}>
          <Route element={<RoleLayout title="Orders" subtitle="Track and manage your orders." />}>
            <Route path="app/orders" element={<Orders />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed="Cooperative" />}>
          <Route element={<RoleLayout title="Cooperative Dashboard" subtitle="Manage members and aggregate produce." />}>
            <Route path="app/cooperative" element={<CoopDashboard />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed="Storage" />}>
          <Route element={<RoleLayout title="Storage Dashboard" subtitle="Manage facilities and bookings." />}>
            <Route path="app/storage" element={<StorageDashboard />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed={['Admin', 'Transport']} />}>
          <Route element={<AppLayout />}>
            <Route path="app/admin/fleet" element={<FleetPage />} />
            <Route path="app/admin/tracking" element={<TrackingPage />} />
          </Route>
        </Route>

        <Route element={<RequireRole allowed="Admin" />}>
          <Route element={<AppLayout />}>
            <Route path="app/admin" element={<DashboardPage />} />
            <Route path="app/admin/users" element={<UsersPage />} />
            <Route path="app/admin/requests" element={<RequestsPage />} />
            <Route path="app/admin/reports" element={<ReportsPage />} />
            <Route path="app/admin/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
