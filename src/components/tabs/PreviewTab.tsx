import type { QuotationData, BrandSettings, LayoutId } from '../../types';
import PdfPreview from '../PdfPreview';

interface PreviewTabProps {
  data: QuotationData;
  brand: BrandSettings;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  subTotal: number;
  total: number;
  cur: string;
  terms: string;
  layout: LayoutId;
  setLayout: (l: LayoutId) => void;
}

const LAYOUTS: { id: LayoutId; name: string; description: string; preview: React.ReactNode }[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional bordered table',
    preview: (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <rect width="60" height="80" fill="white" />
        <rect x="4" y="4" width="20" height="6" rx="1" fill="#e5e7eb" />
        <rect x="4" y="14" width="52" height="4" rx="1" fill="#cbd5e1" opacity="0.5" />
        <rect x="4" y="22" width="52" height="3" rx="0" fill="#94a3b8" />
        <rect x="4" y="25" width="52" height="2.5" rx="0" fill="#e2e8f0" />
        <rect x="4" y="27.5" width="52" height="2.5" rx="0" fill="#f8fafc" />
        <rect x="4" y="30" width="52" height="2.5" rx="0" fill="#e2e8f0" />
        <rect x="36" y="40" width="20" height="2" rx="1" fill="#e5e7eb" />
        <rect x="36" y="44" width="20" height="2" rx="1" fill="#e5e7eb" />
        <rect x="36" y="50" width="20" height="5" rx="1" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Left accent, clean rows',
    preview: (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <rect width="60" height="80" fill="white" />
        <rect x="0" y="0" width="3" height="80" fill="#3b82f6" />
        <rect x="7" y="5" width="18" height="5" rx="1" fill="#e5e7eb" />
        <rect x="7" y="16" width="46" height="3" rx="1" fill="#1e293b" />
        <rect x="7" y="21" width="46" height="2.5" rx="0" fill="#f1f5f9" />
        <rect x="7" y="23.5" width="46" height="2.5" rx="0" fill="white" />
        <rect x="7" y="26" width="46" height="2.5" rx="0" fill="#f1f5f9" />
        <rect x="7" y="28.5" width="46" height="2.5" rx="0" fill="white" />
        <rect x="32" y="40" width="22" height="2" rx="1" fill="#e5e7eb" />
        <rect x="32" y="44" width="22" height="2" rx="1" fill="#e5e7eb" />
        <rect x="32" y="49" width="22" height="5" rx="2" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Dark header, executive style',
    preview: (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <rect width="60" height="80" fill="white" />
        <rect x="0" y="0" width="60" height="18" fill="#1e293b" />
        <rect x="4" y="5" width="16" height="8" rx="1" fill="white" opacity="0.2" />
        <rect x="0" y="18" width="60" height="5" fill="#3b82f6" />
        <rect x="4" y="28" width="52" height="2" rx="0" fill="#cbd5e1" />
        <rect x="4" y="31" width="52" height="2.5" rx="0" fill="#f8fafc" />
        <rect x="4" y="33.5" width="52" height="2.5" rx="0" fill="white" />
        <rect x="4" y="36" width="52" height="2.5" rx="0" fill="#f8fafc" />
        <rect x="30" y="50" width="26" height="2" rx="1" fill="#e5e7eb" />
        <rect x="30" y="54" width="26" height="2" rx="1" fill="#e5e7eb" />
        <rect x="30" y="59" width="26" height="6" rx="1" fill="#1e293b" />
        <rect x="0" y="74" width="60" height="6" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean lines, elegant spacing',
    preview: (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <rect width="60" height="80" fill="white" />
        <rect x="4" y="5" width="18" height="5" rx="1" fill="#e5e7eb" />
        <rect x="42" y="4" width="14" height="1.5" rx="0" fill="#3b82f6" />
        <rect x="42" y="7" width="14" height="1.5" rx="0.5" fill="#cbd5e1" />
        <rect x="42" y="10" width="14" height="1.5" rx="0.5" fill="#cbd5e1" />
        <rect x="4" y="18" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="4" y="23" width="52" height="1" rx="0" fill="#3b82f6" opacity="0.8" />
        <rect x="4" y="26" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="4" y="29" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="4" y="32" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="4" y="35" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="32" y="47" width="24" height="1" rx="0" fill="#e5e7eb" />
        <rect x="32" y="50" width="24" height="1" rx="0" fill="#e5e7eb" />
        <rect x="32" y="55" width="24" height="1.5" rx="0" fill="#3b82f6" />
        <rect x="32" y="57" width="24" height="3" rx="0" fill="white" />
        <text x="32" y="61" fontSize="5" fontWeight="bold" fill="#3b82f6">TOTAL</text>
      </svg>
    ),
  },
];

export default function PreviewTab({
  data, brand, discountType, discountValue, discountAmount,
  taxRate, taxAmount, subTotal, total, cur, terms,
  layout, setLayout,
}: PreviewTabProps) {
  const layoutProps = { data, brand, discountType, discountValue, discountAmount, taxRate, taxAmount, subTotal, total, cur, terms };

  return (
    <div>
      {/* Layout Selector — hidden on print */}
      <div className="mb-6 print:hidden">
        <p className="text-xs font-bold uppercase tracking-widest text-qs-text-sec mb-3">Choose Layout</p>
        <div className="grid grid-cols-4 gap-4">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayout(l.id)}
              className={`rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                layout === l.id
                  ? 'border-qs-primary bg-qs-soft shadow-md'
                  : 'border-qs-border bg-qs-surface hover:border-qs-text-muted'
              }`}
            >
              <div className={`w-full h-20 mb-2 rounded overflow-hidden border ${layout === l.id ? 'border-qs-primary/40' : 'border-qs-border'}`}>
                {l.preview}
              </div>
              <p className={`text-xs font-bold ${layout === l.id ? 'text-qs-primary' : 'text-qs-text'}`}>{l.name}</p>
              <p className="text-[10px] text-qs-text-muted mt-0.5">{l.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Multi-page A4 Preview — scrollable, just like a PDF viewer */}
      <div className="bg-qs-inset py-10 px-6 print:bg-white print:p-0">
        <PdfPreview
          layout={layout}
          layoutProps={layoutProps}
          scale={1}
          className="mx-auto"
        />
      </div>
    </div>
  );
}
