import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg imigongo-pattern flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        <p className="font-serif text-8xl font-bold text-primary/20">404</p>
        <h1 className="font-serif text-3xl font-bold text-primary mt-2">Page not found</h1>
        <p className="text-on-surface-variant font-sans mt-3 leading-relaxed">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            to={ROUTES.landing}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-sans text-sm font-bold hover:bg-primary/90 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 border border-[#ece7e4] bg-white px-6 py-3 rounded-xl font-sans text-sm font-bold text-primary hover:bg-surface-low transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
