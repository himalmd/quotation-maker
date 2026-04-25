import { Upload } from 'lucide-react';
import { motion } from 'motion/react';
import type { BrandSettings } from '../../types';
import { CURRENCIES } from '../../lib/brandStorage';

interface BrandTabProps {
  brand: BrandSettings;
  updateBrand: (patch: Partial<BrandSettings>) => void;
  handleImageUpload: (field: 'logoDataUrl' | 'signDataUrl', file: File) => void;
}

const inputClass = 'w-full rounded-lg border border-qs-border bg-qs-bg text-qs-text px-4 py-2 focus:border-qs-primary focus:outline-none';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-qs-text-sec';
const sectionClass = 'rounded-xl border border-qs-border bg-qs-surface p-6 shadow-sm';

export default function BrandTab({ brand, updateBrand, handleImageUpload }: BrandTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8">

      {/* Company Details */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-lg font-semibold text-qs-text">Company Details</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { label: 'Company Name', key: 'companyName', placeholder: 'Acme Inc.' },
            { label: 'Phone',        key: 'phone',        placeholder: '+1 000 000 0000' },
            { label: 'Address',      key: 'address',      placeholder: '123 Main St, City' },
            { label: 'Website',      key: 'website',      placeholder: 'https://example.com' },
          ].map(({ label, key, placeholder }) => (
            <div key={key} className="space-y-2">
              <label className={labelClass}>{label}</label>
              <input
                type="text"
                value={(brand as any)[key]}
                onChange={(e) => updateBrand({ [key]: e.target.value } as any)}
                className={inputClass}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Visual Identity */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-lg font-semibold text-qs-text">Visual Identity</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Primary Color */}
          <div className="space-y-2">
            <label className={labelClass}>Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={brand.primaryColor} onChange={(e) => updateBrand({ primaryColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded border border-qs-border" />
              <input type="text"  value={brand.primaryColor} onChange={(e) => updateBrand({ primaryColor: e.target.value })} className="w-full rounded-lg border border-qs-border bg-qs-bg text-qs-text px-3 py-2 text-sm focus:border-qs-primary focus:outline-none font-mono" placeholder="#3498db" />
            </div>
          </div>
          {/* Dark Color */}
          <div className="space-y-2">
            <label className={labelClass}>Table Header Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={brand.darkColor} onChange={(e) => updateBrand({ darkColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded border border-qs-border" />
              <input type="text"  value={brand.darkColor} onChange={(e) => updateBrand({ darkColor: e.target.value })} className="w-full rounded-lg border border-qs-border bg-qs-bg text-qs-text px-3 py-2 text-sm focus:border-qs-primary focus:outline-none font-mono" placeholder="#2c3e50" />
            </div>
          </div>
          {/* Currency */}
          <div className="space-y-2">
            <label className={labelClass}>Currency</label>
            <select value={brand.currency} onChange={(e) => updateBrand({ currency: e.target.value })} className={inputClass}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Logo & Signature */}
      <section className={sectionClass}>
        <h2 className="mb-4 text-lg font-semibold text-qs-text">Logo &amp; Signature</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Logo */}
          <div className="space-y-3">
            <label className={labelClass}>Company Logo</label>
            {brand.logoDataUrl && <img src={brand.logoDataUrl} alt="Logo preview" className="h-20 object-contain rounded border border-qs-border p-2" />}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-qs-border bg-qs-bg px-4 py-3 text-sm text-qs-text-sec hover:border-qs-primary hover:text-qs-primary transition-colors">
              <Upload size={16} />
              {brand.logoDataUrl ? 'Replace Logo' : 'Upload Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('logoDataUrl', e.target.files[0])} />
            </label>
            {brand.logoDataUrl && <button onClick={() => updateBrand({ logoDataUrl: '' })} className="text-xs text-qs-error hover:underline">Remove logo</button>}
          </div>
          {/* Signature */}
          <div className="space-y-3">
            <label className={labelClass}>Authorized Signature</label>
            {brand.signDataUrl && <img src={brand.signDataUrl} alt="Signature preview" className="h-20 object-contain rounded border border-qs-border p-2" />}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-qs-border bg-qs-bg px-4 py-3 text-sm text-qs-text-sec hover:border-qs-primary hover:text-qs-primary transition-colors">
              <Upload size={16} />
              {brand.signDataUrl ? 'Replace Signature' : 'Upload Signature'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('signDataUrl', e.target.files[0])} />
            </label>
            {brand.signDataUrl && <button onClick={() => updateBrand({ signDataUrl: '' })} className="text-xs text-qs-error hover:underline">Remove signature</button>}
          </div>
        </div>
      </section>

    </motion.div>
  );
}
