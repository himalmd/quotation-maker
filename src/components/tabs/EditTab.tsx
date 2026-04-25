import { Plus, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { QuotationData, QuotationItem } from '../../types';
import { CREDIT_COSTS } from '../../hooks/useCredits';

interface EditTabProps {
  data: QuotationData;
  setData: React.Dispatch<React.SetStateAction<QuotationData>>;
  discountType: 'percentage' | 'fixed';
  setDiscountType: (v: 'percentage' | 'fixed') => void;
  discountValue: number;
  setDiscountValue: (v: number) => void;
  taxRate: number;
  setTaxRate: (v: number) => void;
  terms: string;
  setTerms: (v: string) => void;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  cur: string;
  aiLoading: Record<string, boolean>;
  handleAIGenerate: (itemId: string, description: string) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof QuotationItem, value: any) => void;
}

export default function EditTab({
  data, setData,
  discountType, setDiscountType, discountValue, setDiscountValue,
  taxRate, setTaxRate, terms, setTerms,
  subTotal, discountAmount, taxAmount, total, cur,
  aiLoading, handleAIGenerate, addItem, removeItem, updateItem,
}: EditTabProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8">

      {/* General Information */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">General Information</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Quotation for', field: 'clientName' as const,      placeholder: 'Client Name',  type: 'text' },
            { label: 'Quotation #',   field: 'quotationNumber' as const,  placeholder: 'QO0000',       type: 'text' },
            { label: 'Date',          field: 'date' as const,             placeholder: '',             type: 'date' },
            { label: 'Delivery Time', field: 'deliveryTime' as const,     placeholder: 'e.g. 21 Days', type: 'text' },
          ].map(({ label, field, placeholder, type }) => (
            <div key={field} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
              <input
                type={type}
                value={data[field]}
                onChange={(e) => setData({ ...data, [field]: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Line Items */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Line Items</h2>
          <button onClick={addItem} className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
            <Plus size={16} />Add Item
          </button>
        </div>

        <div className="space-y-6">
          <AnimatePresence>
            {data.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative rounded-lg border border-gray-100 bg-gray-50 p-4"
              >
                <button onClick={() => removeItem(item.id)} className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200 transition-colors">
                  <Trash2 size={14} />
                </button>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  {/* Description + AI */}
                  <div className="lg:col-span-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</label>
                      <button
                        type="button"
                        onClick={() => handleAIGenerate(item.id, item.description)}
                        disabled={!item.description.trim() || aiLoading[item.id]}
                        title="Generate with AI"
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {aiLoading[item.id]
                          ? <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                          : <Sparkles size={11} />}
                        {aiLoading[item.id]
                          ? 'Generating…'
                          : <><Sparkles size={11} />AI Generate<span className="ml-1 rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold text-purple-500">{CREDIT_COSTS.ITEM_REWRITE}</span></>
                        }
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="Type a brief description, then click AI Generate"
                    />
                    <textarea
                      value={item.details.join('\n')}
                      onChange={(e) => updateItem(item.id, 'details', e.target.value.split('\n'))}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="Details (one per line) — auto-filled by AI"
                      rows={3}
                    />
                  </div>
                  {/* Price */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Price ({cur})</label>
                    <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  {/* Qty */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Qty.</label>
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" />
                  </div>
                  {/* Total */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</label>
                    <div className="flex h-9 items-center rounded-md border border-transparent bg-gray-100 px-3 text-sm font-semibold">
                      {cur} {item.price * item.quantity}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Totals Summary */}
        <div className="mt-8 flex flex-col items-end gap-3 border-t pt-6">
          <div className="flex w-full max-w-xs justify-between text-sm text-gray-500">
            <span>Sub Total:</span>
            <span className="font-semibold text-gray-900">{cur} {subTotal.toFixed(2)}</span>
          </div>

          {/* Discount */}
          <div className="flex w-full items-center gap-3 flex-wrap py-2">
            <span className="text-sm font-medium text-gray-500 mr-1">Discount:</span>
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              <button onClick={() => setDiscountType('percentage')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${discountType === 'percentage' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>% Percentage</button>
              <button onClick={() => setDiscountType('fixed')}      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${discountType === 'fixed'      ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>$ Fixed</button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-400">{discountType === 'percentage' ? '%' : cur}</span>
              <input type="number" min="0" max={discountType === 'percentage' ? 100 : undefined} value={discountValue || ''} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder={discountType === 'percentage' ? '0' : '0.00'} />
            </div>
            {discountAmount > 0 && <span className="text-xs text-green-600 font-semibold ml-auto">Saving {cur} {discountAmount.toFixed(2)}</span>}
          </div>
          {discountAmount > 0 && (
            <div className="flex w-full max-w-xs justify-between text-sm text-green-600">
              <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : `${cur} ${discountValue}`}):</span>
              <span className="font-semibold">- {cur} {discountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Tax */}
          <div className="flex w-full items-center gap-3 flex-wrap border-t py-2 pt-3">
            <span className="text-sm font-medium text-gray-500 mr-1">Tax / VAT:</span>
            <div className="flex items-center gap-1.5">
              <input type="number" min="0" max="100" value={taxRate || ''} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
              <span className="text-xs font-medium text-gray-400">%</span>
            </div>
            {taxAmount > 0 && <span className="text-xs text-gray-500 ml-auto">Tax: {cur} {taxAmount.toFixed(2)}</span>}
          </div>

          {/* Grand Total */}
          <div className="flex w-full max-w-xs justify-between border-t pt-2 text-lg font-bold text-blue-600">
            <span>Total:</span>
            <span>{cur} {total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Terms & Conditions */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold">Terms &amp; Conditions</h2>
        <p className="text-xs text-gray-400 mb-3">These will appear at the bottom of the quotation PDF.</p>
        <textarea
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none resize-y"
          placeholder="Enter your terms and conditions, one per line..."
        />
      </section>

    </motion.div>
  );
}
