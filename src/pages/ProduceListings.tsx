import { useState, type FormEvent, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { produceListingSchema } from '@/lib/schemas/produceListing';
import { RWANDA_DISTRICTS } from '@/lib/rwanda';
import { useToast } from '@/components/feedback/Toast';
import { useProduceListings } from '@/hooks/useProduceListings';

type FieldErrors = Partial<Record<string, string>>;

export default function ProduceListings() {
  const { showToast } = useToast();
  const { listings, addListing, deleteListing, canSave } = useProduceListings();
  const [form, setForm] = useState({
    cropName: '',
    quantityKg: '',
    unit: 'kg' as 'kg' | 'tons' | 'bags',
    harvestDate: '',
    location: '' as (typeof RWANDA_DISTRICTS)[number] | '',
    qualityGrade: 'Grade A',
    pricePerKgRwf: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = produceListingSchema.safeParse({
      ...form,
      location: form.location || undefined,
    });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? 'form';
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (!canSave) {
      showToast('Sign in to save listings.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addListing(result.data);
      showToast('Listing saved.', 'success');
      setShowForm(false);
      setForm({
        cropName: '',
        quantityKg: '',
        unit: 'kg',
        harvestDate: '',
        location: '',
        qualityGrade: 'Grade A',
        pricePerKgRwf: '',
      });
    } catch {
      showToast('Could not save listing. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, cropName: string) => {
    try {
      await deleteListing(id);
      showToast(`Removed ${cropName} from your listings.`, 'success');
    } catch {
      showToast('Could not remove listing.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="font-sans text-sm text-on-surface-variant">
          Manage your produce listings for the marketplace.
        </p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-sans text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer"
        >
          {showForm ? 'Cancel' : 'Add Listing'}
        </button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#ece7e4] p-6 grid sm:grid-cols-2 gap-4"
        >
          <FormField label="Crop Name" error={errors.cropName}>
            <input
              value={form.cropName}
              onChange={(e) => setForm({ ...form, cropName: e.target.value })}
              className={inputClass(errors.cropName)}
            />
          </FormField>
          <FormField label="Quantity (kg)" error={errors.quantityKg}>
            <input
              type="number"
              value={form.quantityKg}
              onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
              className={inputClass(errors.quantityKg)}
            />
          </FormField>
          <FormField label="Unit" error={errors.unit}>
            <select
              value={form.unit}
              onChange={(e) =>
                setForm({ ...form, unit: e.target.value as 'kg' | 'tons' | 'bags' })
              }
              className={inputClass(errors.unit)}
            >
              <option value="kg">kg</option>
              <option value="tons">tons</option>
              <option value="bags">bags</option>
            </select>
          </FormField>
          <FormField label="Harvest Date" error={errors.harvestDate}>
            <input
              type="date"
              value={form.harvestDate}
              onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
              className={inputClass(errors.harvestDate)}
            />
          </FormField>
          <FormField label="Location (District)" error={errors.location}>
            <select
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value as (typeof RWANDA_DISTRICTS)[number] })
              }
              className={inputClass(errors.location)}
            >
              <option value="">Select district</option>
              {RWANDA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Quality Grade" error={errors.qualityGrade}>
            <select
              value={form.qualityGrade}
              onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
              className={inputClass(errors.qualityGrade)}
            >
              <option value="Grade A">Grade A</option>
              <option value="Grade B">Grade B</option>
              <option value="Grade C">Grade C</option>
            </select>
          </FormField>
          <FormField label="Price per kg (RWF)" error={errors.pricePerKgRwf}>
            <input
              type="number"
              value={form.pricePerKgRwf}
              onChange={(e) => setForm({ ...form, pricePerKgRwf: e.target.value })}
              className={inputClass(errors.pricePerKgRwf)}
            />
          </FormField>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-sans font-bold text-sm hover:bg-primary/90 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Saving…' : 'Save Listing'}
            </button>
          </div>
        </form>
      ) : null}

      {listings.length === 0 ? (
        <div className="bg-surface-low rounded-2xl border border-[#ece7e4] p-8 text-center">
          <p className="font-sans text-on-surface-variant">
            No active listings. Add your first produce listing above.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="bg-white rounded-2xl border border-[#ece7e4] p-5 flex flex-col"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-serif font-bold text-primary">{listing.cropName}</h3>
                  <p className="font-sans text-sm text-on-surface-variant mt-1">
                    {listing.location} · {listing.qualityGrade}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(listing.id, listing.cropName)}
                  className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  aria-label={`Delete ${listing.cropName} listing`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 flex justify-between items-center font-sans text-sm">
                <span className="font-bold text-secondary">
                  {listing.pricePerKgRwf.toLocaleString()} RWF/kg
                </span>
                <span className="text-on-surface-variant">
                  {listing.quantityKg.toLocaleString()} {listing.unit}
                </span>
              </div>
              <p className="font-sans text-xs text-on-surface-variant mt-2">
                Harvested {listing.harvestDate}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({
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
      <label className="block font-sans text-xs font-bold text-on-surface-variant uppercase mb-1.5">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : null}
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full px-4 py-2.5 rounded-xl border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
    error ? 'border-red-400' : 'border-[#ece7e4]'
  }`;
}
