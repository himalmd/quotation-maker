/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Printer, Download, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoUrl from './assets/images/logo.png';
import signUrl from './assets/images/rashmi-sign.png';

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

const QUALON_BLUE = '#3498db';
const QUALON_DARK = '#2c3e50';

const Logo = () => (
  <div className="flex items-center">
    <img src={logoUrl} alt="Qualon Logo" className="h-16 object-contain" />
  </div>
);

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

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const subTotal = data.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = discountValue > 0
    ? discountType === 'percentage'
      ? Math.min((subTotal * discountValue) / 100, subTotal)
      : Math.min(discountValue, subTotal)
    : 0;
  const total = subTotal - discountAmount;

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b bg-white px-6 py-4 print:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setActiveTab('edit')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Preview
              </button>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl p-6 print:p-0">
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
                          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Item name"
                          />
                          <textarea
                            value={item.details.join('\n')}
                            onChange={(e) => updateItem(item.id, 'details', e.target.value.split('\n'))}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                            placeholder="Details (one per line)"
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
                      Saving USD {discountAmount.toFixed(2)}
                    </span>
                  )}
                </div>

                {discountAmount > 0 && (
                  <div className="flex w-full max-w-xs justify-between text-sm text-green-600">
                    <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : `USD ${discountValue}`}):</span>
                    <span className="font-semibold">- USD {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex w-full max-w-xs justify-between border-t pt-2 text-lg font-bold text-blue-600">
                  <span>Total:</span>
                  <span>USD {total.toFixed(2)}</span>
                </div>
              </div>
            </section>
          </motion.div>
        </div>

        {/* Preview Section - Always in DOM for printing */}
        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} print:block flex justify-center bg-gray-100 py-10 print:bg-white print:p-0`}>
          <div className="w-[210mm] min-h-[297mm] bg-white p-12 shadow-2xl print:shadow-none">
            {/* PDF Header */}
            <div className="mb-12 flex items-start justify-between">
              <Logo />
            </div>

            {/* Quotation Bar */}
            <div className="relative mb-12 flex items-center justify-end">
              <div className="absolute left-0 right-0 h-10 bg-[#3498db] opacity-20"></div>
              <div className="z-10 bg-white px-4 py-2 flex items-center gap-4">
                <h1 className="text-4xl font-light tracking-[0.2em] text-gray-700 uppercase">QUOTATION</h1>
                <div className="h-10 w-10 bg-[#3498db]"></div>
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
                <tr className="bg-[#2c3e50] text-white text-sm">
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
                    <td className="border border-gray-300 px-4 py-4 text-center align-top whitespace-nowrap">USD {item.price}</td>
                    <td className="border border-gray-300 px-4 py-4 text-center align-top">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-4 text-center align-top whitespace-nowrap">USD {item.price * item.quantity}</td>
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
                    <span className="text-lg font-semibold text-gray-800">USD {subTotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex gap-12 items-center">
                      <span className="text-lg font-semibold text-gray-600">
                        Discount ({discountType === 'percentage' ? `${discountValue}%` : `USD ${discountValue}`}):
                      </span>
                      <span className="text-lg font-semibold text-green-600">- USD {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="w-full bg-[#3498db] flex justify-between items-center px-6 py-3 text-white">
                    <span className="text-xl font-bold uppercase tracking-widest">Total:</span>
                    <span className="text-xl font-bold">USD {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="mt-8 text-center self-end mr-8">
                <div className="mb-[-15px]">
                  <img src={signUrl} alt="Authorized Signature" className="mx-auto h-24 object-contain" />
                </div>
                <div className="w-48 border-t-2 border-gray-800 mx-auto pt-2">
                  <span className="font-bold text-gray-800">Authorized Sign</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-24 text-center">
              <div className="border-t border-[#3498db] pt-4 flex justify-center gap-4 text-[11px] text-gray-500 font-medium whitespace-nowrap flex-wrap">
                <span>+61449176357</span>
                <span className="text-[#3498db] hidden sm:inline">|</span>
                <span>10, Lestrange St Glenside SA 5065</span>
                <span className="text-[#3498db] hidden sm:inline">|</span>
                <span>https://qualon.xyz</span>
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
