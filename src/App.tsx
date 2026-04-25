/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import OutOfCreditsModal from './components/OutOfCreditsModal';
import PrintModal from './components/PrintModal';
import AppNav from './components/layout/AppNav';
import AITab from './components/tabs/AITab';
import BrandTab from './components/tabs/BrandTab';
import EditTab from './components/tabs/EditTab';
import PreviewTab from './components/tabs/PreviewTab';
import { generateItemDescription, extractQuotationFromConversation } from './lib/gemini';
import { loadBrand } from './lib/brandStorage';
import { useCredits, CREDIT_COSTS } from './hooks/useCredits';
import { useTheme } from './hooks/useTheme';
import type { QuotationData, QuotationItem, BrandSettings, LayoutId } from './types';

type Tab = 'ai' | 'edit' | 'preview' | 'brand';

const DEFAULT_DATA: QuotationData = {
  clientName: 'Mr. Mohamed',
  quotationNumber: 'QO0530',
  date: new Date().toISOString().split('T')[0],
  items: [
    { id: '1', description: 'WordPress Standard Package (4 Pages)', details: ['Home', 'Recipes', 'Recipe Category Template', 'Recipe Template'], price: 400, quantity: 1 },
    { id: '2', description: 'Additional Pages', details: ['About', 'Contact', 'Terms of Use (Free of Charge)', 'Privacy Policy (Free of Charge)'], price: 70, quantity: 2 },
    { id: '3', description: 'Blog Posts', details: ['Total Blog Posts in the website : 119'], price: 5, quantity: 119 },
  ],
  deliveryTime: '21 Days',
};

const DEFAULT_TERMS =
  '1. This quotation is valid for 30 days from the date of issue.\n' +
  '2. A 50% advance payment is required to commence work.\n' +
  '3. The remaining balance is due upon project completion.\n' +
  '4. Prices are subject to change without prior notice after the validity period.';

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const { user, loading, signOut } = useAuth();
  const { credits, canAfford, deductCredits } = useCredits();
  const { isDark, toggleTheme } = useTheme();

  // ── Core state ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const [layout, setLayout] = useState<LayoutId>('classic');
  const [data, setData] = useState<QuotationData>(DEFAULT_DATA);
  const [brand, setBrand] = useState<BrandSettings>(loadBrand);

  // ── Pricing state ─────────────────────────────────────────────────────────
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [terms, setTerms] = useState(DEFAULT_TERMS);

  // ── AI state ──────────────────────────────────────────────────────────────
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiConversation, setAiConversation] = useState('');
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiSuccess, setAiSuccess] = useState<{ itemCount: number; clientName: string } | null>(null);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // ── Computed totals ───────────────────────────────────────────────────────
  const subTotal = data.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = discountValue > 0
    ? discountType === 'percentage'
      ? Math.min((subTotal * discountValue) / 100, subTotal)
      : Math.min(discountValue, subTotal)
    : 0;
  const afterDiscount = subTotal - discountAmount;
  const taxAmount = taxRate > 0 ? (afterDiscount * taxRate) / 100 : 0;
  const total = afterDiscount + taxAmount;
  const cur = brand.currency;

  // ── Brand handlers ────────────────────────────────────────────────────────
  const updateBrand = useCallback((patch: Partial<BrandSettings>) => {
    setBrand(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('quotation_brand', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleImageUpload = useCallback((field: 'logoDataUrl' | 'signDataUrl', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => updateBrand({ [field]: e.target?.result as string });
    reader.readAsDataURL(file);
  }, [updateBrand]);

  // ── Item handlers ─────────────────────────────────────────────────────────
  const addItem = () => setData(prev => ({
    ...prev,
    items: [...prev.items, { id: Math.random().toString(36).substr(2, 9), description: '', details: [], price: 0, quantity: 1 }],
  }));

  const removeItem = (id: string) => setData(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => setData(prev => ({
    ...prev,
    items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i),
  }));

  // ── AI handlers ───────────────────────────────────────────────────────────
  const handleAIGenerate = useCallback(async (itemId: string, currentDescription: string) => {
    if (!currentDescription.trim()) return;
    if (!canAfford(CREDIT_COSTS.ITEM_REWRITE)) { setShowOutOfCredits(true); return; }
    setAiLoading(prev => ({ ...prev, [itemId]: true }));
    try {
      const result = await generateItemDescription(currentDescription);
      const deducted = await deductCredits(CREDIT_COSTS.ITEM_REWRITE);
      if (!deducted) { setShowOutOfCredits(true); return; }
      updateItem(itemId, 'description', result.description);
      updateItem(itemId, 'details', result.details);
    } catch (err: any) {
      alert(err.message ?? 'AI generation failed. Please try again.');
    } finally {
      setAiLoading(prev => ({ ...prev, [itemId]: false }));
    }
  }, [canAfford, deductCredits]);

  const handleExtractQuotation = useCallback(async () => {
    if (!aiConversation.trim()) return;
    if (!canAfford(CREDIT_COSTS.FULL_QUOTATION)) { setShowOutOfCredits(true); return; }
    setAiExtracting(true);
    setAiSuccess(null);
    try {
      const result = await extractQuotationFromConversation(aiConversation);
      const deducted = await deductCredits(CREDIT_COSTS.FULL_QUOTATION);
      if (!deducted) { setShowOutOfCredits(true); return; }
      setData(prev => ({ ...prev, clientName: result.clientName || prev.clientName, deliveryTime: result.deliveryTime || prev.deliveryTime, items: result.items }));
      setAiSuccess({ itemCount: result.items.length, clientName: result.clientName });
      setTimeout(() => setActiveTab('edit'), 1200);
    } catch (err: any) {
      alert(err.message ?? 'Extraction failed. Please try again.');
    } finally {
      setAiExtracting(false);
    }
  }, [aiConversation, canAfford, deductCredits]);

  // ── Auth gates ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-qs-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-qs-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-qs-text-sec">Loading…</p>
        </div>
      </div>
    );
  }
  if (!user) return <AuthPage />;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <OutOfCreditsModal open={showOutOfCredits} onClose={() => setShowOutOfCredits(false)} />
      <PrintModal
        open={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        layout={layout}
        setLayout={setLayout}
        data={data}
        brand={brand}
        discountType={discountType}
        discountValue={discountValue}
        discountAmount={discountAmount}
        taxRate={taxRate}
        taxAmount={taxAmount}
        subTotal={subTotal}
        total={total}
        cur={cur}
        terms={terms}
      />

      <AppNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brand={brand}
        credits={credits}
        setShowOutOfCredits={setShowOutOfCredits}
        onOpenPrintModal={() => setShowPrintModal(true)}
        user={user}
        signOut={signOut}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      <main className="p-6 print:p-0">
        <div className={`${activeTab === 'ai'      ? 'block' : 'hidden'} print:hidden`}>
          <AITab aiConversation={aiConversation} setAiConversation={setAiConversation} aiExtracting={aiExtracting} aiSuccess={aiSuccess} setAiSuccess={setAiSuccess} handleExtractQuotation={handleExtractQuotation} />
        </div>
        <div className={`${activeTab === 'brand'   ? 'block' : 'hidden'} print:hidden`}>
          <BrandTab brand={brand} updateBrand={updateBrand} handleImageUpload={handleImageUpload} />
        </div>
        <div className={`${activeTab === 'edit'    ? 'block' : 'hidden'} print:hidden`}>
          <EditTab data={data} setData={setData} brand={brand} layout={layout} discountType={discountType} setDiscountType={setDiscountType} discountValue={discountValue} setDiscountValue={setDiscountValue} taxRate={taxRate} setTaxRate={setTaxRate} terms={terms} setTerms={setTerms} subTotal={subTotal} discountAmount={discountAmount} taxAmount={taxAmount} total={total} cur={cur} aiLoading={aiLoading} handleAIGenerate={handleAIGenerate} addItem={addItem} removeItem={removeItem} updateItem={updateItem} />
        </div>
        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} print:block`}>
          <PreviewTab data={data} brand={brand} discountType={discountType} discountValue={discountValue} discountAmount={discountAmount} taxRate={taxRate} taxAmount={taxAmount} subTotal={subTotal} total={total} cur={cur} terms={terms} layout={layout} setLayout={setLayout} />
        </div>
      </main>

      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav  { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; max-width: none !important; }
          .print\\:hidden    { display: none !important; }
          .print\\:p-0       { padding: 0 !important; }
          .print\\:bg-white  { background: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
