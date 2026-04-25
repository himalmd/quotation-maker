import type { LayoutProps } from './types';

/** Modern — clean two-tone header, borderless alternating-row table */
export default function ModernLayout({
  data, brand, discountType, discountValue, discountAmount,
  taxRate, taxAmount, subTotal, total, cur, terms,
}: LayoutProps) {
  const date = new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl print:shadow-none overflow-hidden">

      {/* Header band */}
      <div className="flex items-stretch">
        {/* Left accent */}
        <div className="w-2 flex-shrink-0" style={{ backgroundColor: brand.primaryColor }} />
        {/* Header content */}
        <div className="flex-1 px-10 py-8 flex items-center justify-between">
          <div>
            {brand.logoDataUrl
              ? <img src={brand.logoDataUrl} alt="Logo" className="h-14 object-contain" />
              : <span className="text-xl font-bold tracking-widest" style={{ color: brand.primaryColor }}>{brand.companyName}</span>
            }
            {brand.companyName && brand.logoDataUrl && (
              <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide">{brand.companyName}</p>
            )}
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-black tracking-[0.15em] text-gray-800 uppercase">Quotation</h1>
            <p className="text-sm font-semibold mt-1" style={{ color: brand.primaryColor }}>{data.quotationNumber}</p>
            <p className="text-xs text-gray-400 mt-0.5">{date}</p>
          </div>
        </div>
      </div>

      {/* Thin divider */}
      <div className="h-px mx-10 bg-gray-100" />

      {/* Client info row */}
      <div className="px-10 py-5 flex justify-between items-start bg-gray-50">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Prepared For</p>
          <p className="text-base font-semibold text-gray-800">{data.clientName}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Delivery</p>
          <p className="text-sm font-semibold text-gray-700">{data.deliveryTime}</p>
        </div>
      </div>

      {/* Table */}
      <div className="px-10 mt-6">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-widest text-white px-4 py-2.5 rounded-lg" style={{ backgroundColor: brand.darkColor }}>
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Description</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-2 text-center">Qty</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        {/* Rows */}
        {data.items.map((item, index) => (
          <div key={item.id} className={`grid grid-cols-12 gap-2 px-4 py-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="col-span-1 text-center text-xs font-bold text-gray-400 pt-0.5">{index + 1}</div>
            <div className="col-span-5">
              <p className="text-sm font-bold text-gray-800">{item.description}</p>
              {item.details.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {item.details.map((d, i) => (
                    <li key={i} className="text-[11px] text-gray-500 flex items-start gap-1">
                      <span style={{ color: brand.primaryColor }} className="mt-0.5 flex-shrink-0">›</span>{d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-span-2 text-right text-sm text-gray-600 pt-0.5">{cur} {item.price.toFixed(2)}</div>
            <div className="col-span-2 text-center text-sm text-gray-600 pt-0.5">{item.quantity}</div>
            <div className="col-span-2 text-right text-sm font-bold text-gray-800 pt-0.5">{cur} {(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
        <div className="h-px bg-gray-200 mt-2" />
      </div>

      {/* Totals + Signature */}
      <div className="px-10 mt-6 flex justify-between items-start gap-8">
        {/* Signature */}
        <div className="flex-1">
          {brand.signDataUrl && (
            <img src={brand.signDataUrl} alt="Signature" className="h-16 object-contain mb-[-10px]" />
          )}
          <div className="w-40 border-t-2 border-gray-800 pt-1.5">
            <span className="text-xs font-bold text-gray-700">Authorized Signature</span>
          </div>
        </div>
        {/* Totals */}
        <div className="w-56 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span><span className="font-medium text-gray-800">{cur} {subTotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Discount ({discountType === 'percentage' ? `${discountValue}%` : `${cur} ${discountValue}`})</span>
              <span className="text-green-600 font-medium">- {cur} {discountAmount.toFixed(2)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tax ({taxRate}%)</span>
              <span className="text-gray-700 font-medium">+ {cur} {taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center px-3 py-2 rounded-lg mt-2 text-white" style={{ backgroundColor: brand.primaryColor }}>
            <span className="text-sm font-bold uppercase tracking-wider">Total</span>
            <span className="text-base font-black">{cur} {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      {terms.trim() && (
        <div className="px-10 mt-8 border-t border-gray-100 pt-5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Terms &amp; Conditions</p>
          <ol className="space-y-0.5">
            {terms.split('\n').filter(Boolean).map((line, i) => (
              <li key={i} className="text-[10px] text-gray-400 leading-relaxed">{line}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Footer */}
      <div className="px-10 mt-auto pt-8 pb-6">
        <div className="h-px bg-gray-100 mb-4" />
        <div className="flex justify-center gap-6 text-[10px] text-gray-400 font-medium">
          {brand.phone   && <span>{brand.phone}</span>}
          {brand.address && <span>{brand.address}</span>}
          {brand.website && <span>{brand.website}</span>}
        </div>
      </div>
    </div>
  );
}
