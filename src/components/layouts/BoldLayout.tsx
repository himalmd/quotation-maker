import type { LayoutProps } from './types';

/** Bold / Executive — full-width dark header, dramatic totals bar */
export default function BoldLayout({
  data, brand, discountType, discountValue, discountAmount,
  taxRate, taxAmount, subTotal, total, cur, terms,
}: LayoutProps) {
  const date = new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl print:shadow-none overflow-hidden">

      {/* Bold dark header */}
      <div className="px-10 py-8 flex items-center justify-between" style={{ backgroundColor: brand.darkColor }}>
        <div>
          {brand.logoDataUrl
            ? <img src={brand.logoDataUrl} alt="Logo" className="h-14 object-contain brightness-0 invert" />
            : <span className="text-2xl font-black tracking-widest text-white">{brand.companyName}</span>
          }
          <div className="mt-2 space-y-0.5">
            {brand.phone   && <p className="text-[11px] text-white/60">{brand.phone}</p>}
            {brand.address && <p className="text-[11px] text-white/60">{brand.address}</p>}
            {brand.website && <p className="text-[11px] text-white/60">{brand.website}</p>}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-5xl font-black tracking-[0.15em] text-white/20 uppercase leading-none">QUOTE</h1>
          <p className="text-white text-xl font-bold mt-1">{data.quotationNumber}</p>
          <p className="text-white/60 text-xs mt-1">{date}</p>
        </div>
      </div>

      {/* Colored meta bar */}
      <div className="px-10 py-3 flex justify-between items-center" style={{ backgroundColor: brand.primaryColor }}>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mr-3">Client:</span>
          <span className="text-sm font-bold text-white">{data.clientName}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mr-3">Delivery:</span>
          <span className="text-sm font-bold text-white">{data.deliveryTime}</span>
        </div>
      </div>

      {/* Table */}
      <div className="px-10 mt-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[11px] font-black uppercase tracking-widest text-gray-500 border-b-2 border-gray-200">
              <th className="py-2 text-center w-8">#</th>
              <th className="py-2 text-left pl-2">Description</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-center w-16">Qty</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={item.id} className={`border-b border-gray-100 ${index % 2 === 0 ? '' : 'bg-gray-50/60'}`}>
                <td className="py-3 text-center text-xs font-bold text-gray-300">{index + 1}</td>
                <td className="py-3 pl-2">
                  <p className="text-sm font-bold text-gray-800">{item.description}</p>
                  {item.details.length > 0 && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.details.join(' · ')}</p>
                  )}
                </td>
                <td className="py-3 text-right text-sm text-gray-600 whitespace-nowrap">{cur} {item.price.toFixed(2)}</td>
                <td className="py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                <td className="py-3 text-right text-sm font-bold text-gray-800 whitespace-nowrap">{cur} {(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-10 mt-8">
        <div className="flex justify-between items-start gap-12">
          {/* Left: Thank you + signature */}
          <div className="flex-1">
            <p className="text-lg font-black text-gray-800 mb-1">Thank You!</p>
            <p className="text-xs text-gray-400">We appreciate your business and look forward to working with you.</p>
            <div className="mt-8">
              {brand.signDataUrl && (
                <img src={brand.signDataUrl} alt="Signature" className="h-14 object-contain mb-[-10px]" />
              )}
              <div className="w-40 border-t-2 pt-1" style={{ borderColor: brand.darkColor }}>
                <span className="text-xs font-bold text-gray-700">Authorized Signature</span>
              </div>
            </div>
          </div>

          {/* Right: totals stack */}
          <div className="w-52">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-800">{cur} {subTotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-semibold text-green-600">- {cur} {discountAmount.toFixed(2)}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax ({taxRate}%)</span>
                  <span className="font-semibold text-gray-700">+ {cur} {taxAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
            {/* Grand Total bar */}
            <div className="flex justify-between items-center px-4 py-3 text-white rounded" style={{ backgroundColor: brand.darkColor }}>
              <span className="text-xs font-black uppercase tracking-widest">Grand Total</span>
              <span className="text-lg font-black">{cur} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      {terms.trim() && (
        <div className="px-10 mt-8 pt-5 border-t border-gray-100">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Terms &amp; Conditions</p>
          <ol className="space-y-0.5">
            {terms.split('\n').filter(Boolean).map((line, i) => (
              <li key={i} className="text-[10px] text-gray-400 leading-relaxed">{line}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Footer stripe */}
      <div className="mt-auto px-10 py-3 flex justify-center gap-6 text-[10px] font-semibold text-white" style={{ backgroundColor: brand.primaryColor, marginTop: '2rem' }}>
        {brand.phone   && <span>{brand.phone}</span>}
        {brand.address && <span>•</span>}
        {brand.address && <span>{brand.address}</span>}
        {brand.website && <span>•</span>}
        {brand.website && <span>{brand.website}</span>}
      </div>
    </div>
  );
}
