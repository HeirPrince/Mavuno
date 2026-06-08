import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from '@/components/RequireAuth';
import AppLayout from '@/layouts/AppLayout';
import { SignInPage, SignUpPage } from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/UsersPage';
import FleetPage from '@/pages/FleetPage';
import RequestsPage from '@/pages/RequestsPage';
import TrackingPage from '@/pages/TrackingPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="sign-in/*" element={<SignInPage />} />
      <Route path="sign-up/*" element={<SignUpPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="fleet" element={<FleetPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="tracking" element={<TrackingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
