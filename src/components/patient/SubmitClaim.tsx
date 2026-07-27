import { useRef, useState } from 'react';
import { FileImage, UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClaims, type NewClaimInput } from '@/hooks/useClaims';
import { fileToDataUrl } from '@/lib/utils';

interface FormState {
  name: string;
  email: string;
  claimAmount: string;
  description: string;
  documentUrl: string | null;
  documentName: string | null;
}

interface Errors {
  name?: string;
  email?: string;
  claimAmount?: string;
  description?: string;
}

const initialState: FormState = {
  name: '',
  email: '',
  claimAmount: '',
  description: '',
  documentUrl: null,
  documentName: null,
};

export function SubmitClaim({ onSubmitted }: { onSubmitted?: () => void }) {
  const { user } = useAuth();
  const { addClaim } = useClaims();
  const [form, setForm] = useState<FormState>({
    ...initialState,
    name: user.name,
    email: user.email,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate(): boolean {
    const next: Errors = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
    const amt = parseFloat(form.claimAmount);
    if (!form.claimAmount.trim()) next.claimAmount = 'Claim amount is required';
    else if (Number.isNaN(amt) || amt <= 0) next.claimAmount = 'Enter a positive amount';
    if (!form.description.trim()) next.description = 'Description is required';
    else if (form.description.trim().length < 10) next.description = 'Please provide at least 10 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, description: e.description }));
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((f) => ({ ...f, documentUrl: dataUrl, documentName: file.name }));
    } catch {
      // ignore read errors
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function clearDocument() {
    setForm((f) => ({ ...f, documentUrl: null, documentName: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const input: NewClaimInput = {
      name: form.name.trim(),
      email: form.email.trim(),
      claimAmount: parseFloat(form.claimAmount),
      description: form.description.trim(),
      documentUrl: form.documentUrl,
    };
    // simulate async submission
    setTimeout(() => {
      addClaim(input);
      setSubmitting(false);
      setSuccess(true);
      setForm({ ...initialState, name: user.name, email: user.email });
      setTimeout(() => setSuccess(false), 4000);
      onSubmitted?.();
    }, 600);
  }

  const fieldClass = (err?: string) => `input-base ${err ? 'input-error' : ''}`;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">Submit a New Claim</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the details below. Your claim will be reviewed by the insurer and tracked in your dashboard.
        </p>
      </div>

      {success && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 animate-scale-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span className="font-medium">Claim submitted successfully!</span>
          <span className="text-emerald-700">It's now pending review.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card overflow-hidden">
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={fieldClass(errors.name)}
              placeholder="Jane Doe"
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={fieldClass(errors.email)}
              placeholder="jane@example.com"
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Claim Amount</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.claimAmount}
                onChange={(e) => setForm((f) => ({ ...f, claimAmount: e.target.value }))}
                className={`${fieldClass(errors.claimAmount)} pl-7`}
                placeholder="0.00"
              />
            </div>
            {errors.claimAmount && <ErrorText>{errors.claimAmount}</ErrorText>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className={`${fieldClass(errors.description)} resize-none`}
              placeholder="Describe the treatment, reason for the claim, and any relevant details..."
            />
            {errors.description && <ErrorText>{errors.description}</ErrorText>}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Supporting Document <span className="font-normal text-slate-400">(optional)</span>
            </label>

            {form.documentUrl ? (
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
                  <img
                    src={form.documentUrl}
                    alt="Document preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <FileImage className="h-4 w-4 text-brand-600" />
                    <span className="truncate">{form.documentName ?? 'Uploaded document'}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">Receipt/prescription attached as Base64 preview</p>
                </div>
                <button
                  type="button"
                  onClick={clearDocument}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                  aria-label="Remove document"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group cursor-pointer rounded-xl border-2 border-dashed px-4 py-7 text-center transition ${
                  dragOver
                    ? 'border-brand-500 bg-brand-50/60'
                    : 'border-slate-200 bg-slate-50/50 hover:border-brand-400 hover:bg-brand-50/30'
                }`}
              >
                <UploadCloud
                  className={`mx-auto h-8 w-8 transition ${
                    dragOver ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'
                  }`}
                />
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Drag & drop or <span className="text-brand-600">browse</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-400">PNG, JPG, or GIF — stored as Base64 preview</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:px-7">
          <button type="button" onClick={() => setForm({ ...initialState, name: user.name, email: user.email })} className="btn-ghost">
            Reset
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Claim'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {children}
    </p>
  );
}
