import { AppProvider } from '@/context/AppContext';
import { ToastProvider } from '@/components/feedback/Toast';
import AppRoutes from '@/routes';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AppProvider>
  );
}
