import { useState } from 'react';
import { Plus, Trash2, Sparkles, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { QuotationData, QuotationItem, BrandSettings, LayoutId } from '../../types';
import { CREDIT_COSTS } from '../../hooks/useCredits';
import ClassicLayout from '../layouts/ClassicLayout';
import ModernLayout  from '../layouts/ModernLayout';
import BoldLayout    from '../layouts/BoldLayout';
import MinimalLayout from '../layouts/MinimalLayout';

interface EditTabProps {
  data: QuotationData;
  setData: React.Dispatch<React.SetStateAction<QuotationData>>;
  brand: BrandSettings;
  layout: LayoutId;
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

const sectionClass = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm';
const labelClass = 'text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400';
const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:border-blue-500 focus:outline-none';
const itemInputClass = 'w-full rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none';
const smallLabelClass = 'text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500';

// A4 px at 96dpi
const A4_W = 794;
const PANE_W = 360; // px - preview pane width
const SCALE = (PANE_W - 24) / A4_W; // ~0.42

export default function EditTab({
  data, setData, brand, layout,
  discountType, setDiscountType, discountValue, setDiscountValue,
  taxRate, setTaxRate, terms, setTerms,
  subTotal, discountAmount, taxAmount, total, cur,
  aiLoading, handleAIGenerate, addItem, removeItem, updateItem,
}: EditTabProps) {
  const [previewOpen, setPreviewOpen] = useState(true);

  const LayoutComponent =
    layout === 'modern'  ? ModernLayout  :
    layout === 'bold'    ? BoldLayout    :
    layout === 'minimal' ? MinimalLayout :
    ClassicLayout;

  const layoutProps = { data, brand, discountType, discountValue, discountAmount, taxRate, taxAmount, subTotal, total, cur, terms };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">

      {/* ── Left: edit form ── */}
      <div className="flex-1 min-w-0 grid gap-8">

        {/* General Information */}
        <section className={sectionClass}>
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">General Information</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Quotation for', field: 'clientName'     as const, placeholder: 'Client Name',  type: 'text' },
              { label: 'Quotation #',   field: 'quotationNumber' as const, placeholder: 'QO0000',       type: 'text' },
              { label: 'Date',          field: 'date'            as const, placeholder: '',             type: 'date' },
              { label: 'Delivery Time', field: 'deliveryTime'    as const, placeholder: 'e.g. 21 Days', type: 'text' },
            ].map(({ label, field, placeholder, type }) => (
              <div key={field} className="space-y-2">
                <label className={labelClass}>{label}</label>
                <input
                  type={type}
                  value={data[field]}
                  onChange={(e) => setData({ ...data, [field]: e.target.value })}
                  className={inputClass}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Line Items */}
        <section className={sectionClass}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Line Items</h2>
            <button onClick={addItem} className="flex items-center gap-2 rounded-lg border border-blue-600 dark:border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
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
                  className="relative rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-4"
                >
                  <button onClick={() => removeItem(item.id)} className="absolute -right-2 -top-2 rounded-full bg-red-100 dark:bg-red-950 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={smallLabelClass}>Description</label>
                        <button
                          type="button"
                          onClick={() => handleAIGenerate(item.id, item.description)}
                          disabled={!item.description.trim() || aiLoading[item.id]}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {aiLoading[item.id]
                            ? <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                            : <Sparkles size={11} />}
                          {aiLoading[item.id]
                            ? 'Generating…'
                            : <>AI Generate<span className="ml-1 rounded-full bg-purple-100 dark:bg-purple-900 px-1.5 py-0.5 text-[9px] font-bold text-purple-500 dark:text-purple-300">{CREDIT_COSTS.ITEM_REWRITE}</span></>
                          }
                        </button>
                      </div>
                      <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className={itemInputClass} placeholder="Type a brief description, then click AI Generate" />
                      <textarea value={item.details.join('\n')} onChange={(e) => updateItem(item.id, 'details', e.target.value.split('\n'))} className={itemInputClass} placeholder="Details (one per line) — auto-filled by AI" rows={3} />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className={smallLabelClass}>Price ({cur})</label>
                      <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className={itemInputClass} />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className={smallLabelClass}>Qty.</label>
                      <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} className={itemInputClass} />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className={smallLabelClass}>Total</label>
                      <div className="flex h-9 items-center rounded-md border border-transparent bg-gray-100 dark:bg-gray-600 px-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {cur} {item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Totals */}
          <div className="mt-8 flex flex-col items-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex w-full max-w-xs justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Sub Total:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{cur} {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex w-full items-center gap-3 flex-wrap py-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">Discount:</span>
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-0.5">
                <button onClick={() => setDiscountType('percentage')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${discountType === 'percentage' ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>% Percentage</button>
                <button onClick={() => setDiscountType('fixed')}      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${discountType === 'fixed'      ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>$ Fixed</button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{discountType === 'percentage' ? '%' : cur}</span>
                <input type="number" min="0" max={discountType === 'percentage' ? 100 : undefined} value={discountValue || ''} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} className="w-24 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder={discountType === 'percentage' ? '0' : '0.00'} />
              </div>
              {discountAmount > 0 && <span className="text-xs text-green-600 dark:text-green-400 font-semibold ml-auto">Saving {cur} {discountAmount.toFixed(2)}</span>}
            </div>
            {discountAmount > 0 && (
              <div className="flex w-full max-w-xs justify-between text-sm text-green-600 dark:text-green-400">
                <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : `${cur} ${discountValue}`}):</span>
                <span className="font-semibold">- {cur} {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex w-full items-center gap-3 flex-wrap border-t border-gray-200 dark:border-gray-700 py-2 pt-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-1">Tax / VAT:</span>
              <div className="flex items-center gap-1.5">
                <input type="number" min="0" max="100" value={taxRate || ''} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="w-24 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none" placeholder="0" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">%</span>
              </div>
              {taxAmount > 0 && <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Tax: {cur} {taxAmount.toFixed(2)}</span>}
            </div>
            <div className="flex w-full max-w-xs justify-between border-t border-gray-200 dark:border-gray-700 pt-2 text-lg font-bold text-blue-600 dark:text-blue-400">
              <span>Total:</span><span>{cur} {total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Terms & Conditions */}
        <section className={sectionClass}>
          <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">Terms &amp; Conditions</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">These will appear at the bottom of the quotation PDF.</p>
          <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={6} className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none resize-y" placeholder="Enter your terms and conditions, one per line..." />
        </section>

      </div>

      {/* ── Toggle button (visible when pane is closed) ── */}
      {!previewOpen && (
        <button
          onClick={() => setPreviewOpen(true)}
          title="Show live preview"
          className="sticky top-20 flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors flex-shrink-0"
        >
          <PanelRightOpen size={16} />
          <span className="text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr]">Preview</span>
        </button>
      )}

      {/* ── Right: live preview pane ── */}
      <div
        className="flex-shrink-0 sticky top-20 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: previewOpen ? PANE_W : 0, height: previewOpen ? 'calc(100vh - 88px)' : 0 }}
      >
        <div style={{ width: PANE_W }} className="h-full flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          {/* Pane header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Live Preview</span>
            <button
              onClick={() => setPreviewOpen(false)}
              title="Hide preview"
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 transition-colors"
            >
              <PanelRightClose size={14} />
            </button>
          </div>
          {/* Scaled A4 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 dark:bg-gray-950 p-3">
            <div style={{ width: Math.round(A4_W * SCALE), height: Math.round(1123 * SCALE), overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left', width: A4_W }}>
                <LayoutComponent {...layoutProps} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
