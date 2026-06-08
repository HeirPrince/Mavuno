import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { profileSetupSchema } from '@/lib/schemas/profile';
import { RWANDA_DISTRICTS, RWANDA_SECTORS, type RwandaDistrict } from '@/lib/rwanda';
import { USER_ROLES, ROLE_LABELS, getDashboardPath, type UserRole } from '@/lib/roles';
import {
  saveLocalProfile,
  getPendingRole,
  clearPendingRole,
  useProfile,
} from '@/hooks/useProfile';
import { ROUTES } from '@/lib/routes';

type FieldErrors = Partial<Record<string, string>>;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { profile } = useProfile();
  const pendingRole = getPendingRole();

  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    phone: '',
    email: user?.primaryEmailAddress?.emailAddress ?? profile.email,
    district: '' as RwandaDistrict | '',
    sector: '',
    role: (pendingRole ?? profile.role) as UserRole,
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
      saveLocalProfile({
        role: result.data.role,
        fullName: result.data.fullName,
        phone: result.data.phone,
        district: result.data.district,
        sector: result.data.sector,
        onboardingComplete: true,
      });
      clearPendingRole();

      if (user) {
        await user.update({
          unsafeMetadata: {
            role: result.data.role,
            fullName: result.data.fullName,
            phone: result.data.phone,
            district: result.data.district,
            sector: result.data.sector,
            onboardingComplete: true,
          },
        });
      }

      navigate(getDashboardPath(result.data.role), { replace: true });
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
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass(errors.email)}
            />
          </Field>

          <Field label="User Type" error={errors.role}>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className={inputClass(errors.role)}
            >
              {USER_ROLES.filter((r) => r !== 'Admin').map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
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

          {form.role === 'Farmer' ? (
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

          {form.role === 'Buyer' ? (
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

          {form.role === 'Cooperative' ? (
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
