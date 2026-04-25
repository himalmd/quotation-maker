import type { LayoutProps } from './types';

/** Minimal / Elegant — generous whitespace, hairline dividers, no borders */
export default function MinimalLayout({
  data, brand, discountType, discountValue, discountAmount,
  taxRate, taxAmount, subTotal, total, cur, terms,
}: LayoutProps) {
  const date = new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white px-14 py-12 shadow-2xl print:shadow-none">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          {brand.logoDataUrl
            ? <img src={brand.logoDataUrl} alt="Logo" className="h-12 object-contain" />
            : <span className="text-lg font-bold tracking-widest text-gray-800">{brand.companyName}</span>
          }
        </div>
        {/* Thin colored top-right rule */}
        <div className="flex flex-col items-end gap-1">
          <div className="w-12 h-0.5 mb-2" style={{ backgroundColor: brand.primaryColor }} />
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-gray-700">Quotation</h1>
          <p className="text-xs text-gray-400">{data.quotationNumber}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>

      {/* Thin top divider */}
      <div className="h-px bg-gray-100 mb-8" />

      {/* Client strip */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: brand.primaryColor }}>Prepared For</p>
          <p className="text-xl font-light text-gray-800">{data.clientName}</p>
        </div>
        <p className="text-xs text-gray-400">Delivery: <span className="font-semibold text-gray-600">{data.deliveryTime}</span></p>
      </div>

      {/* Table — no borders, just lines */}
      <div className="mb-8">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-2 pb-2 border-b text-[10px] font-black uppercase tracking-widest text-gray-400" style={{ borderColor: brand.primaryColor, borderBottomWidth: '2px' }}>
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        {/* Item rows */}
        {data.items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 py-3 border-b border-gray-100">
            <div className="col-span-6">
              <p className="text-sm font-semibold text-gray-800">{item.description}</p>
              {item.details.length > 0 && (
                <ul className="mt-1">
                  {item.details.map((d, i) => (
                    <li key={i} className="text-[11px] text-gray-400">— {d}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-span-2 text-right text-sm text-gray-500 self-start pt-0.5">
              {cur} {item.price.toFixed(2)}
            </div>
            <div className="col-span-2 text-center text-sm text-gray-500 self-start pt-0.5">
              {item.quantity}
            </div>
            <div className="col-span-2 text-right text-sm font-semibold text-gray-800 self-start pt-0.5">
              {cur} {(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Totals row */}
      <div className="flex justify-end mb-10">
        <div className="w-60 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span className="text-gray-700">{cur} {subTotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount ({discountType === 'percentage' ? `${discountValue}%` : `${cur} ${discountValue}`})</span>
              <span className="text-green-600">- {cur} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax ({taxRate}%)</span>
              <span className="text-gray-600">+ {cur} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 mt-1 border-t-2" style={{ borderColor: brand.primaryColor }}>
            <span className="text-sm font-black uppercase tracking-widest text-gray-800">Total</span>
            <span className="text-xl font-black" style={{ color: brand.primaryColor }}>{cur} {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="mb-8">
        {brand.signDataUrl && (
          <img src={brand.signDataUrl} alt="Signature" className="h-16 object-contain mb-[-10px]" />
        )}
        <div className="w-44 border-t border-gray-400 pt-1.5">
          <span className="text-xs font-semibold text-gray-500">Authorized Signature</span>
        </div>
      </div>

      {/* Terms */}
      {terms.trim() && (
        <div className="mb-8 border-t border-gray-100 pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Terms &amp; Conditions</p>
          <ol className="space-y-0.5">
            {terms.split('\n').filter(Boolean).map((line, i) => (
              <li key={i} className="text-[10px] text-gray-400 leading-relaxed">{line}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex justify-center gap-8 text-[10px] text-gray-400">
          {brand.phone   && <span>{brand.phone}</span>}
          {brand.address && <span>{brand.address}</span>}
          {brand.website && <span>{brand.website}</span>}
        </div>
      </div>
    </div>
  );
}
