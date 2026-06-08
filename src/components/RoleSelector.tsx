import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/react';
import { ROLE_LABELS, type UserRole } from '@/lib/roles';
import { SELECTABLE_ROLES, selectableRoleSchema } from '@/lib/schemas/role';
import { ROUTES } from '@/lib/routes';

const ROLE_DESCRIPTIONS: Record<(typeof SELECTABLE_ROLES)[number], string> = {
  Farmer: 'List and sell produce from your farm',
  Buyer: 'Browse and order produce from farmers',
  Cooperative: 'Aggregate members and manage bulk supply',
  Transport: 'Register vehicles and accept dispatch requests',
  Storage: 'List and manage storage facilities',
};

export default function RoleSelector() {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  async function handleSubmit() {
    const result = selectableRoleSchema.safeParse(selected);
    if (!result.success) {
      setError('Please select a role to continue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: result.data }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Failed to save role');
      }

      await user?.reload();

      navigate(`${ROUTES.onboarding}?step=profile`, { replace: true });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="font-serif text-xl font-bold text-primary">What describes you best?</h2>
        <p className="font-sans text-sm text-on-surface-variant mt-2">
          Choose how you will use Mavuno on the platform.
        </p>
      </div>

      <div className="grid gap-3">
        {SELECTABLE_ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelected(role)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-colors cursor-pointer ${
              selected === role
                ? 'border-primary bg-primary/5'
                : 'border-[#ece7e4] hover:border-primary/40'
            }`}
          >
            <div className="font-sans font-semibold text-sm text-primary">{ROLE_LABELS[role]}</div>
            <div className="font-sans text-xs text-on-surface-variant mt-1">
              {ROLE_DESCRIPTIONS[role]}
            </div>
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600 font-sans">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || loading}
        className="w-full bg-primary text-white py-3 rounded-xl font-sans font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </div>
  );
}
