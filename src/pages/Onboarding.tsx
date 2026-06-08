import { useState, type FormEvent, type ReactNode } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/react';
import { useQueryClient } from '@tanstack/react-query';
import { profileSetupSchema } from '@/lib/schemas/profile';
import { RWANDA_DISTRICTS, RWANDA_SECTORS, type RwandaDistrict } from '@/lib/rwanda';
import { ROLE_LABELS, type UserRole } from '@/lib/roles';
import { saveLocalProfile, useProfile } from '@/hooks/useProfile';
import { useRole } from '@/hooks/useRole';
import { getRoleHome } from '@/lib/roleRedirect';
import { ROUTES } from '@/lib/routes';
import RoleSelector from '@/components/RoleSelector';

type FieldErrors = Partial<Record<string, string>>;

export default function OnboardingPage() {
  const [searchParams] = useSearchParams();
  const step = searchParams.get('step') ?? 'role';
  const { role, isLoaded: roleLoaded } = useRole();
  const { profile, isLoaded: profileLoaded } = useProfile();

  if (!roleLoaded || !profileLoaded) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (profile.onboardingComplete && role) {
    return <Navigate to={getRoleHome(role)} replace />;
  }

  if (step === 'profile' && role) {
    return <ProfileSetupStep role={role} />;
  }

  if (role && step !== 'role') {
    return <Navigate to={`${ROUTES.onboarding}?step=profile`} replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ece7e4] p-8 shadow-sm">
        <RoleSelector />
      </div>
    </div>
  );
}

function ProfileSetupStep({ role }: { role: UserRole }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { profile, refetchProfile } = useProfile();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? profile.fullName,
    phone: profile.phone,
    email: user?.primaryEmailAddress?.emailAddress ?? profile.email,
    district: (profile.district || '') as RwandaDistrict | '',
    sector: profile.sector,
    role,
    farmSizeHectares: '',
    organisationType: '',
    memberCapacity: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const sectors = form.district ? RWANDA_SECTORS[form.district] : [];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      ...form,
      farmSizeHectares: form.farmSizeHectares ? Number(form.farmSizeHectares) : undefined,
      memberCapacity: form.memberCapacity ? Number(form.memberCapacity) : undefined,
      organisationType: form.organisationType || undefined,
    };

    const result = profileSetupSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? 'form';
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: result.data.fullName,
          phone: result.data.phone,
          district: result.data.district,
          sector: result.data.sector,
          farmSizeHectares: result.data.farmSizeHectares,
          organisationType: result.data.organisationType,
          memberCapacity: result.data.memberCapacity,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile');
      }

      saveLocalProfile({
        fullName: result.data.fullName,
        phone: result.data.phone,
        district: result.data.district,
        sector: result.data.sector,
        onboardingComplete: true,
      });

      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      await refetchProfile();
      await user?.reload();

      navigate(getRoleHome(role), { replace: true });
    } catch {
      setErrors({ form: 'Could not save profile. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-primary">Complete your profile</h1>
          <p className="font-sans text-sm text-on-surface-variant mt-2">
            Tell us about yourself to get started on Mavuno.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-[#ece7e4] p-8 space-y-5 shadow-sm"
        >
          {errors.form ? (
            <p className="text-sm text-red-600 font-sans">{errors.form}</p>
          ) : null}

          <Field label="Full Name" error={errors.fullName}>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClass(errors.fullName)}
            />
          </Field>

          <Field label="Phone Number" error={errors.phone}>
            <input
              type="tel"
              placeholder="+250 7XX XXX XXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass(errors.phone)}
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              type="email"
              value={form.email}
              readOnly
              className={`${inputClass(errors.email)} bg-gray-50`}
            />
          </Field>

          <Field label="User Type">
            <input
              type="text"
              value={ROLE_LABELS[role]}
              readOnly
              className={`${inputClass()} bg-gray-50`}
            />
          </Field>

          <Field label="District" error={errors.district}>
            <select
              value={form.district}
              onChange={(e) =>
                setForm({ ...form, district: e.target.value as RwandaDistrict, sector: '' })
              }
              className={inputClass(errors.district)}
            >
              <option value="">Select district</option>
              {RWANDA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sector" error={errors.sector}>
            <select
              value={form.sector}
              disabled={!form.district}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className={inputClass(errors.sector)}
            >
              <option value="">Select sector</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          {role === 'Farmer' ? (
            <Field label="Farm size (hectares)" error={errors.farmSizeHectares}>
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.farmSizeHectares}
                onChange={(e) => setForm({ ...form, farmSizeHectares: e.target.value })}
                className={inputClass(errors.farmSizeHectares)}
              />
            </Field>
          ) : null}

          {role === 'Buyer' ? (
            <Field label="Organisation type" error={errors.organisationType}>
              <input
                type="text"
                placeholder="e.g. Restaurant, Exporter, Retailer"
                value={form.organisationType}
                onChange={(e) => setForm({ ...form, organisationType: e.target.value })}
                className={inputClass(errors.organisationType)}
              />
            </Field>
          ) : null}

          {role === 'Cooperative' ? (
            <Field label="Member capacity" error={errors.memberCapacity}>
              <input
                type="number"
                min="1"
                value={form.memberCapacity}
                onChange={(e) => setForm({ ...form, memberCapacity: e.target.value })}
                className={inputClass(errors.memberCapacity)}
              />
            </Field>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-3 rounded-xl font-sans font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 cursor-pointer"
          >
            {submitting ? 'Saving…' : 'Complete setup'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate(ROUTES.landing)}
          className="mt-4 w-full text-center font-sans text-sm text-on-surface-variant hover:text-primary cursor-pointer"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600 mt-1 font-sans">{error}</p> : null}
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full px-4 py-2.5 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    error ? 'border-red-400' : 'border-[#ece7e4]'
  }`;
}
