import type { LayoutProps } from './types';

/** Classic — the original Qualon design */
export default function ClassicLayout({
  data, brand, discountType, discountValue, discountAmount,
  taxRate, taxAmount, subTotal, total, cur, terms,
}: LayoutProps) {
  return (
    <div className="w-[210mm] min-h-[297mm] bg-white p-12 shadow-2xl print:shadow-none">

      {/* Logo */}
      <div className="mb-12 flex items-start justify-between">
        {brand.logoDataUrl
          ? <img src={brand.logoDataUrl} alt="Logo" className="h-16 object-contain" />
          : <span className="text-2xl font-bold tracking-widest" style={{ color: brand.primaryColor }}>{brand.companyName}</span>
        }
      </div>

      {/* Quotation Bar */}
      <div className="relative mb-12 flex items-center justify-end">
        <div className="absolute left-0 right-0 h-10 opacity-20" style={{ backgroundColor: brand.primaryColor }} />
        <div className="z-10 bg-white px-4 py-2 flex items-center gap-4">
          <h1 className="text-4xl font-light tracking-[0.2em] text-gray-700 uppercase">QUOTATION</h1>
          <div className="h-10 w-10" style={{ backgroundColor: brand.primaryColor }} />
        </div>
      </div>

      {/* Client & Meta */}
      <div className="mb-12 flex justify-between">
        <div>
          <h3 className="text-2xl font-light text-gray-800 mb-2">Quotation to:</h3>
          <p className="text-gray-600">For: {data.clientName}</p>
        </div>
        <div className="text-right">
          <div className="flex justify-end gap-8 mb-1">
            <span className="font-bold text-gray-800">Quotation #</span>
            <span className="text-gray-600 min-w-[100px]">{data.quotationNumber}</span>
          </div>
          <div className="flex justify-end gap-8">
            <span className="font-bold text-gray-800">Date</span>
            <span className="text-gray-600 min-w-[100px]">
              {new Date(data.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="text-white text-sm" style={{ backgroundColor: brand.darkColor }}>
            <th className="border border-gray-300 px-4 py-3 font-semibold text-center w-12">SL</th>
            <th className="border border-gray-300 px-6 py-3 font-semibold text-left">Item Description</th>
            <th className="border border-gray-300 px-4 py-3 font-semibold text-center w-24">Price</th>
            <th className="border border-gray-300 px-4 py-3 font-semibold text-center w-20">Qty.</th>
            <th className="border border-gray-300 px-4 py-3 font-semibold text-center w-32">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={item.id} className="text-sm text-gray-700">
              <td className="border border-gray-300 px-4 py-4 text-center font-bold align-top">{index + 1}</td>
              <td className="border border-gray-300 px-6 py-4 align-top">
                <div className="font-bold text-gray-800 mb-2">{item.description}</div>
                <ul className="list-decimal list-inside space-y-1 text-gray-600 pl-2">
                  {item.details.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </td>
              <td className="border border-gray-300 px-4 py-4 text-center align-top whitespace-nowrap">{cur} {item.price}</td>
              <td className="border border-gray-300 px-4 py-4 text-center align-top">{item.quantity}</td>
              <td className="border border-gray-300 px-4 py-4 text-center align-top whitespace-nowrap">{cur} {item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex flex-col items-end gap-12">
        <div className="flex justify-between w-full">
          <div className="space-y-4">
            <h4 className="text-xl font-bold text-gray-800">Thank You</h4>
            <p className="text-gray-600">Estimated Delivery Time: {data.deliveryTime}</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex gap-12 items-center">
              <span className="text-lg font-semibold text-gray-600">Sub Total:</span>
              <span className="text-lg font-semibold text-gray-800">{cur} {subTotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex gap-12 items-center">
                <span className="text-lg font-semibold text-gray-600">Discount ({discountType === 'percentage' ? `${discountValue}%` : `${cur} ${discountValue}`}):</span>
                <span className="text-lg font-semibold text-green-600">- {cur} {discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex gap-12 items-center">
                <span className="text-lg font-semibold text-gray-600">Tax ({taxRate}%):</span>
                <span className="text-lg font-semibold text-gray-700">+ {cur} {taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="w-full flex justify-between items-center px-6 py-3 text-white" style={{ backgroundColor: brand.primaryColor }}>
              <span className="text-xl font-bold uppercase tracking-widest">Total:</span>
              <span className="text-xl font-bold">{cur} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="mt-8 text-center self-end mr-8">
          {brand.signDataUrl && (
            <div className="mb-[-15px]">
              <img src={brand.signDataUrl} alt="Authorized Signature" className="mx-auto h-24 object-contain" />
            </div>
          )}
          <div className="w-48 border-t-2 border-gray-800 mx-auto pt-2">
            <span className="font-bold text-gray-800">Authorized Sign</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      {terms.trim() && (
        <div className="mt-10 border-t pt-6">
          <h5 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Terms &amp; Conditions</h5>
          <ol className="space-y-1">
            {terms.split('\n').filter(Boolean).map((line, i) => (
              <li key={i} className="text-[11px] text-gray-500 leading-relaxed">{line}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-10 text-center">
        <div className="pt-4 flex justify-center gap-4 text-[11px] text-gray-500 font-medium whitespace-nowrap flex-wrap" style={{ borderTop: `1px solid ${brand.primaryColor}` }}>
          {brand.phone   && <span>{brand.phone}</span>}
          {brand.phone   && brand.address && <span style={{ color: brand.primaryColor }}>|</span>}
          {brand.address && <span>{brand.address}</span>}
          {brand.address && brand.website && <span style={{ color: brand.primaryColor }}>|</span>}
          {brand.website && <span>{brand.website}</span>}
        </div>
      </div>
    </div>
  );
}
