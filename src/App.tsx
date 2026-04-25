/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, Printer, Upload, LogOut, Sparkles, Wand2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './components/AuthPage';
import OutOfCreditsModal from './components/OutOfCreditsModal';
import { generateItemDescription, extractQuotationFromConversation } from './lib/gemini';
import { useCredits, CREDIT_COSTS } from './hooks/useCredits';

interface QuotationItem {
  id: string;
  description: string;
  details: string[];
  price: number;
  quantity: number;
}

interface QuotationData {
  clientName: string;
  quotationNumber: string;
  date: string;
  items: QuotationItem[];
  deliveryTime: string;
}

interface BrandSettings {
  companyName: string;
  phone: string;
  address: string;
  website: string;
  primaryColor: string;
  darkColor: string;
  currency: string;
  logoDataUrl: string;
  signDataUrl: string;
}

const CURRENCIES = ['USD', 'AUD', 'EUR', 'GBP', 'CAD', 'SGD', 'AED', 'INR'];

const DEFAULT_BRAND: BrandSettings = {
  companyName: 'My Company',
  phone: '+1 000 000 0000',
  address: '123 Main St, City, Country',
  website: 'https://example.com',
  primaryColor: '#3498db',
  darkColor: '#2c3e50',
  currency: 'USD',
  logoDataUrl: '',
  signDataUrl: '',
};

function loadBrand(): BrandSettings {
  try {
    const saved = localStorage.getItem('quotation_brand');
    return saved ? { ...DEFAULT_BRAND, ...JSON.parse(saved) } : DEFAULT_BRAND;
  } catch {
    return DEFAULT_BRAND;
  }
}

export default function App() {
  const [data, setData] = useState<QuotationData>({
    clientName: 'Mr. Mohamed',
    quotationNumber: 'QO0530',
    date: new Date().toISOString().split('T')[0],
    items: [
      {
        id: '1',
        description: 'WordPress Standard Package (4 Pages)',
        details: ['Home', 'Recipes', 'Recipe Category Template', 'Recipe Template'],
        price: 400,
        quantity: 1,
      },
      {
        id: '2',
        description: 'Additional Pages',
        details: ['About', 'Contact', 'Terms of Use (Free of Charge)', 'Privacy Policy (Free of Charge)'],
        price: 70,
        quantity: 2,
      },
      {
        id: '3',
        description: 'Blog Posts',
        details: ['Total Blog Posts in the website : 119'],
        price: 5,
        quantity: 119,
      },
    ],
    deliveryTime: '21 Days',
  });

  const [activeTab, setActiveTab] = useState<'ai' | 'edit' | 'preview' | 'brand'>('ai');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [terms, setTerms] = useState<string>(
    '1. This quotation is valid for 30 days from the date of issue.\n' +
    '2. A 50% advance payment is required to commence work.\n' +
    '3. The remaining balance is due upon project completion.\n' +
    '4. Prices are subject to change without prior notice after the validity period.'
  );
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [aiConversation, setAiConversation] = useState('');
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiSuccess, setAiSuccess] = useState<{ itemCount: number; clientName: string } | null>(null);
  const [showOutOfCredits, setShowOutOfCredits] = useState(false);
  const [brand, setBrand] = useState<BrandSettings>(loadBrand);

  const { credits, canAfford, deductCredits } = useCredits();

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

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      details: [],
      price: 0,
      quantity: 1,
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    setData({ ...data, items: data.items.filter((item) => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setData({
      ...data,
      items: data.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  const handleAIGenerate = useCallback(async (itemId: string, currentDescription: string) => {
    const prompt = currentDescription.trim();
    if (!prompt) return;
    if (!canAfford(CREDIT_COSTS.ITEM_REWRITE)) { setShowOutOfCredits(true); return; }
    setAiLoading(prev => ({ ...prev, [itemId]: true }));
    try {
      const result = await generateItemDescription(prompt);
      const deducted = await deductCredits(CREDIT_COSTS.ITEM_REWRITE);
      if (!deducted) { setShowOutOfCredits(true); return; }
      updateItem(itemId, 'description', result.description);
      updateItem(itemId, 'details', result.details);
    } catch (err: any) {
      alert(err.message ?? 'AI generation failed. Please try again.');
    } finally {
      setAiLoading(prev => ({ ...prev, [itemId]: false }));
    }
  }, [updateItem, canAfford, deductCredits]);

  const handleExtractQuotation = useCallback(async () => {
    if (!aiConversation.trim()) return;
    if (!canAfford(CREDIT_COSTS.FULL_QUOTATION)) { setShowOutOfCredits(true); return; }
    setAiExtracting(true);
    setAiSuccess(null);
    try {
      const result = await extractQuotationFromConversation(aiConversation);
      const deducted = await deductCredits(CREDIT_COSTS.FULL_QUOTATION);
      if (!deducted) { setShowOutOfCredits(true); return; }
      setData(prev => ({
        ...prev,
        clientName: result.clientName || prev.clientName,
        deliveryTime: result.deliveryTime || prev.deliveryTime,
        items: result.items,
      }));
      setAiSuccess({ itemCount: result.items.length, clientName: result.clientName });
      setTimeout(() => setActiveTab('edit'), 1200);
    } catch (err: any) {
      alert(err.message ?? 'Extraction failed. Please try again.');
    } finally {
      setAiExtracting(false);
    }
  }, [aiConversation, canAfford, deductCredits]);

  const handlePrint = () => window.print();

  const { user, loading, signOut } = useAuth();

  // While Supabase resolves the session, show a minimal loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <OutOfCreditsModal open={showOutOfCredits} onClose={() => setShowOutOfCredits(false)} />
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b bg-white px-6 py-4 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {/* Dynamic Logo */}
          <div className="flex items-center">
            {brand.logoDataUrl
              ? <img src={brand.logoDataUrl} alt="Logo" className="h-14 object-contain" />
              : <span className="text-xl font-bold tracking-widest text-gray-800">{brand.companyName}</span>
            }
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button onClick={() => setActiveTab('ai')} className={`rounded-md px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === 'ai' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Wand2 size={14} />
                AI
              </button>
              <button onClick={() => setActiveTab('brand')} className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'brand' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Brand</button>
              <button onClick={() => setActiveTab('edit')} className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Edit</button>
              <button onClick={() => setActiveTab('preview')} className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Preview</button>
            </div>
            {/* Credit Badge */}
            <button
              onClick={() => { if (credits !== null && credits === 0) setShowOutOfCredits(true); }}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                credits === null ? 'border-gray-200 text-gray-400' :
                credits === 0 ? 'border-red-200 bg-red-50 text-red-600 cursor-pointer hover:bg-red-100' :
                credits <= 20 ? 'border-amber-200 bg-amber-50 text-amber-600' :
                'border-gray-200 bg-gray-50 text-gray-600'
              }`}
              title="AI Credits remaining"
            >
              <Zap size={12} className={credits !== null && credits <= 20 ? 'text-amber-500' : 'text-gray-400'} />
              {credits === null ? '…' : `${credits} credits`}
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
              <Printer size={16} />
              Print / Save PDF
            </button>
            {/* User Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-800 truncate max-w-[150px]">{user.email}</p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl p-6 print:p-0">

        {/* ── AI TAB ── */}
        <div className={`${activeTab === 'ai' ? 'block' : 'hidden'} print:hidden`}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6">

            {/* Header */}
            <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600">
                  <Wand2 size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">AI Quotation Generator</h2>
                  <p className="text-sm text-gray-500">Paste a client conversation and let AI build the entire quotation for you.</p>
                </div>
              </div>
            </div>

            {/* Conversation Input */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">Client Conversation</label>
              <p className="text-xs text-gray-400 mb-3">Paste any conversation — WhatsApp, email, Slack message, meeting notes. The AI will extract client name, services, prices, quantities, and delivery time.</p>
              <textarea
                value={aiConversation}
                onChange={(e) => { setAiConversation(e.target.value); setAiSuccess(null); }}
                rows={14}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-y font-mono leading-relaxed"
                placeholder={`Paste your client conversation here...

Example:
Hi, I'm Sarah from Bloom Bakery. We need a new website.
- 6 pages total (Home, About, Menu, Gallery, Blog, Contact)
- We have 24 blog posts ready
- Need it done in 3 weeks
- Budget is around $800 for the main site, $5 per blog post
Can you help?`}
              />

              {/* Success Banner */}
              <AnimatePresence>
                {aiSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700"
                  >
                    <span className="text-lg">✓</span>
                    <span>
                      <strong>{aiSuccess.itemCount} line items</strong> extracted for <strong>{aiSuccess.clientName}</strong>. Switching to Edit tab…
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-gray-400">Tip: The more detail in the conversation, the better the quotation.</p>
                <button
                  onClick={handleExtractQuotation}
                  disabled={!aiConversation.trim() || aiExtracting}
                  className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: aiExtracting ? '#7c3aed' : 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                >
                  {aiExtracting
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analysing conversation…</>
                    : <><Wand2 size={16} />Generate Quotation</>}
                </button>
              </div>
            </section>

          </motion.div>
        </div>

        {/* ── BRAND TAB ── */}
        <div className={`${activeTab === 'brand' ? 'block' : 'hidden'} print:hidden`}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8">

            {/* Company Details */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Company Details</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[
                  { label: 'Company Name', key: 'companyName', placeholder: 'Acme Inc.' },
                  { label: 'Phone', key: 'phone', placeholder: '+1 000 000 0000' },
                  { label: 'Address', key: 'address', placeholder: '123 Main St, City' },
                  { label: 'Website', key: 'website', placeholder: 'https://example.com' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
                    <input
                      type="text"
                      value={(brand as any)[key]}
                      onChange={(e) => updateBrand({ [key]: e.target.value } as any)}
                      className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Visual Identity */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Visual Identity</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Primary Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={brand.primaryColor} onChange={(e) => updateBrand({ primaryColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded border border-gray-200" />
                    <input type="text" value={brand.primaryColor} onChange={(e) => updateBrand({ primaryColor: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono" placeholder="#3498db" />
                  </div>
                </div>
                {/* Dark Color */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Table Header Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={brand.darkColor} onChange={(e) => updateBrand({ darkColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded border border-gray-200" />
                    <input type="text" value={brand.darkColor} onChange={(e) => updateBrand({ darkColor: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none font-mono" placeholder="#2c3e50" />
                  </div>
                </div>
                {/* Currency */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Currency</label>
                  <select value={brand.currency} onChange={(e) => updateBrand({ currency: e.target.value })} className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Logo & Signature */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Logo &amp; Signature</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Logo Upload */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Company Logo</label>
                  {brand.logoDataUrl && <img src={brand.logoDataUrl} alt="Logo preview" className="h-20 object-contain rounded border border-gray-100 p-2" />}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                    <Upload size={16} />
                    {brand.logoDataUrl ? 'Replace Logo' : 'Upload Logo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('logoDataUrl', e.target.files[0])} />
                  </label>
                  {brand.logoDataUrl && <button onClick={() => updateBrand({ logoDataUrl: '' })} className="text-xs text-red-500 hover:underline">Remove logo</button>}
                </div>
                {/* Signature Upload */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Authorized Signature</label>
                  {brand.signDataUrl && <img src={brand.signDataUrl} alt="Signature preview" className="h-20 object-contain rounded border border-gray-100 p-2" />}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors">
                    <Upload size={16} />
                    {brand.signDataUrl ? 'Replace Signature' : 'Upload Signature'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload('signDataUrl', e.target.files[0])} />
                  </label>
                  {brand.signDataUrl && <button onClick={() => updateBrand({ signDataUrl: '' })} className="text-xs text-red-500 hover:underline">Remove signature</button>}
                </div>
              </div>
            </section>

          </motion.div>
        </div>

        {/* ── EDIT TAB ── */}
        <div className={`${activeTab === 'edit' ? 'block' : 'hidden'} print:hidden`}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8"
          >
            {/* Header Info */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">General Information</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Quotation for</label>
                  <input
                    type="text"
                    value={data.clientName}
                    onChange={(e) => setData({ ...data, clientName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Client Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Quotation #</label>
                  <input
                    type="text"
                    value={data.quotationNumber}
                    onChange={(e) => setData({ ...data, quotationNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="QO0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Date</label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Delivery Time</label>
                  <input
                    type="text"
                    value={data.deliveryTime}
                    onChange={(e) => setData({ ...data, deliveryTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. 21 Days"
                  />
                </div>
              </div>
            </section>

            {/* Items Section */}
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Line Items</h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              <div className="space-y-6">
                <AnimatePresence>
                  {data.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative rounded-lg border border-gray-100 bg-gray-50 p-4"
                    >
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
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
                              {aiLoading[item.id] ? 'Generating…' : 'AI Generate'}
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
                        <div className="lg:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Price (USD)</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Qty.</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="lg:col-span-2 space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</label>
                          <div className="flex h-9 items-center rounded-md border border-transparent bg-gray-100 px-3 text-sm font-semibold">
                            USD {item.price * item.quantity}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-8 flex flex-col items-end gap-3 border-t pt-6">
                <div className="flex w-full max-w-xs justify-between text-sm text-gray-500">
                  <span>Sub Total:</span>
                  <span className="font-semibold text-gray-900">USD {subTotal.toFixed(2)}</span>
                </div>

                {/* Discount Controls */}
                <div className="flex w-full items-center gap-3 flex-wrap py-2">
                  <span className="text-sm font-medium text-gray-500 mr-1">Discount:</span>
                  <div className="flex rounded-lg bg-gray-100 p-0.5">
                    <button
                      onClick={() => setDiscountType('percentage')}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        discountType === 'percentage' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      % Percentage
                    </button>
                    <button
                      onClick={() => setDiscountType('fixed')}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        discountType === 'fixed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      $ Fixed
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-400">
                      {discountType === 'percentage' ? '%' : 'USD'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? 100 : undefined}
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder={discountType === 'percentage' ? '0' : '0.00'}
                    />
                  </div>
                  {discountAmount > 0 && (
                    <span className="text-xs text-green-600 font-semibold ml-auto">
                      Saving {cur} {discountAmount.toFixed(2)}
                    </span>
                  )}
                </div>

                {discountAmount > 0 && (
                  <div className="flex w-full max-w-xs justify-between text-sm text-green-600">
                    <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : `${cur} ${discountValue}`}):</span>
                    <span className="font-semibold">- {cur} {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {/* Tax Controls */}
                <div className="flex w-full items-center gap-3 flex-wrap py-2 border-t pt-3">
                  <span className="text-sm font-medium text-gray-500 mr-1">Tax / VAT:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxRate || ''}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                    <span className="text-xs font-medium text-gray-400">%</span>
                  </div>
                  {taxAmount > 0 && (
                    <span className="text-xs text-gray-500 ml-auto">
                      Tax: {cur} {taxAmount.toFixed(2)}
                    </span>
                  )}
                </div>

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
        </div>

        {/* Preview Section - Always in DOM for printing */}
        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} print:block flex justify-center bg-gray-100 py-10 print:bg-white print:p-0`}>
          <div className="w-[210mm] min-h-[297mm] bg-white p-12 shadow-2xl print:shadow-none">
            {/* PDF Header */}
            <div className="mb-12 flex items-start justify-between">
              {brand.logoDataUrl
                ? <img src={brand.logoDataUrl} alt="Logo" className="h-16 object-contain" />
                : <span className="text-2xl font-bold tracking-widest" style={{ color: brand.primaryColor }}>{brand.companyName}</span>
              }
            </div>

            {/* Quotation Bar */}
            <div className="relative mb-12 flex items-center justify-end">
              <div className="absolute left-0 right-0 h-10 opacity-20" style={{ backgroundColor: brand.primaryColor }}></div>
              <div className="z-10 bg-white px-4 py-2 flex items-center gap-4">
                <h1 className="text-4xl font-light tracking-[0.2em] text-gray-700 uppercase">QUOTATION</h1>
                <div className="h-10 w-10" style={{ backgroundColor: brand.primaryColor }}></div>
              </div>
            </div>

            {/* Client & Meta Info */}
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
                  <span className="text-gray-600 min-w-[100px]">{new Date(data.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</span>
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
                        {item.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
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
                      <span className="text-lg font-semibold text-gray-600">
                        Discount ({discountType === 'percentage' ? `${discountValue}%` : `${cur} ${discountValue}`}):
                      </span>
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

            {/* Terms & Conditions on PDF */}
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
                {brand.phone && <span>{brand.phone}</span>}
                {brand.phone && brand.address && <span style={{ color: brand.primaryColor }} className="hidden sm:inline">|</span>}
                {brand.address && <span>{brand.address}</span>}
                {brand.address && brand.website && <span style={{ color: brand.primaryColor }} className="hidden sm:inline">|</span>}
                {brand.website && <span>{brand.website}</span>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          nav {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
