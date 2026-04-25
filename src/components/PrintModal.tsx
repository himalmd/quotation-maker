import { X, Printer, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { LayoutId } from '../../types';
import type { LayoutProps } from './layouts/types';
import ClassicLayout from './layouts/ClassicLayout';
import ModernLayout  from './layouts/ModernLayout';
import BoldLayout    from './layouts/BoldLayout';
import MinimalLayout from './layouts/MinimalLayout';

// A4 dimensions at 96 dpi
const A4_W_PX = 794;
const A4_H_PX = 1123;

const LAYOUTS: { id: LayoutId; name: string; desc: string; preview: React.ReactNode }[] = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Traditional bordered table',
    preview: (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <rect width="60" height="80" fill="white" />
        <rect x="4" y="4" width="20" height="6" rx="1" fill="#e5e7eb" />
        <rect x="4" y="14" width="52" height="4" rx="1" fill="#cbd5e1" opacity="0.5" />
        <rect x="4" y="22" width="52" height="3" rx="0" fill="#94a3b8" />
        <rect x="4" y="25" width="52" height="2.5" rx="0" fill="#e2e8f0" />
        <rect x="4" y="27.5" width="52" height="2.5" rx="0" fill="#f8fafc" />
        <rect x="4" y="30" width="52" height="2.5" rx="0" fill="#e2e8f0" />
        <rect x="36" y="40" width="20" height="2" rx="1" fill="#e5e7eb" />
        <rect x="36" y="44" width="20" height="2" rx="1" fill="#e5e7eb" />
        <rect x="36" y="50" width="20" height="5" rx="1" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Left accent, clean rows',
    preview: (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <rect width="60" height="80" fill="white" />
        <rect x="0" y="0" width="3" height="80" fill="#3b82f6" />
        <rect x="7" y="5" width="18" height="5" rx="1" fill="#e5e7eb" />
        <rect x="7" y="16" width="46" height="3" rx="1" fill="#1e293b" />
        <rect x="7" y="21" width="46" height="2.5" rx="0" fill="#f1f5f9" />
        <rect x="7" y="23.5" width="46" height="2.5" rx="0" fill="white" />
        <rect x="7" y="26" width="46" height="2.5" rx="0" fill="#f1f5f9" />
        <rect x="32" y="42" width="22" height="2" rx="1" fill="#e5e7eb" />
        <rect x="32" y="46" width="22" height="2" rx="1" fill="#e5e7eb" />
        <rect x="32" y="51" width="22" height="5" rx="2" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    id: 'bold',
    name: 'Bold',
    desc: 'Dark header, executive style',
    preview: (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <rect width="60" height="80" fill="white" />
        <rect x="0" y="0" width="60" height="18" fill="#1e293b" />
        <rect x="4" y="5" width="16" height="8" rx="1" fill="white" opacity="0.2" />
        <rect x="0" y="18" width="60" height="5" fill="#3b82f6" />
        <rect x="4" y="28" width="52" height="2" rx="0" fill="#cbd5e1" />
        <rect x="4" y="31" width="52" height="2.5" rx="0" fill="#f8fafc" />
        <rect x="4" y="33.5" width="52" height="2.5" rx="0" fill="white" />
        <rect x="30" y="52" width="26" height="2" rx="1" fill="#e5e7eb" />
        <rect x="30" y="56" width="26" height="2" rx="1" fill="#e5e7eb" />
        <rect x="30" y="61" width="26" height="6" rx="1" fill="#1e293b" />
        <rect x="0" y="74" width="60" height="6" fill="#3b82f6" />
      </svg>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Clean lines, elegant spacing',
    preview: (
      <svg viewBox="0 0 60 80" className="w-full h-full">
        <rect width="60" height="80" fill="white" />
        <rect x="4" y="5" width="18" height="5" rx="1" fill="#e5e7eb" />
        <rect x="42" y="4" width="14" height="1.5" rx="0" fill="#3b82f6" />
        <rect x="42" y="7" width="14" height="1.5" rx="0.5" fill="#cbd5e1" />
        <rect x="42" y="10" width="14" height="1.5" rx="0.5" fill="#cbd5e1" />
        <rect x="4" y="18" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="4" y="23" width="52" height="1" rx="0" fill="#3b82f6" opacity="0.8" />
        <rect x="4" y="26" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="4" y="29" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="4" y="32" width="52" height="1" rx="0" fill="#f1f5f9" />
        <rect x="32" y="48" width="24" height="1" rx="0" fill="#e5e7eb" />
        <rect x="32" y="51" width="24" height="1" rx="0" fill="#e5e7eb" />
        <rect x="32" y="55" width="24" height="1.5" rx="0" fill="#3b82f6" />
        <rect x="32" y="57" width="24" height="3" rx="0" fill="white" />
      </svg>
    ),
  },
];

interface PrintModalProps extends LayoutProps {
  open: boolean;
  layout: LayoutId;
  setLayout: (l: LayoutId) => void;
  onClose: () => void;
}

export default function PrintModal({ open, layout, setLayout, onClose, ...layoutProps }: PrintModalProps) {
  const LayoutComponent =
    layout === 'modern'  ? ModernLayout  :
    layout === 'bold'    ? BoldLayout    :
    layout === 'minimal' ? MinimalLayout :
    ClassicLayout;

  // Scale factor to fit A4 in the preview pane (~520px wide pane)
  const SCALE = 0.62;
  const scaledW = Math.round(A4_W_PX * SCALE);
  const scaledH = Math.round(A4_H_PX * SCALE);

  const handlePrint = () => {
    onClose();
    setTimeout(() => window.print(), 150);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-4 z-50 flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{ maxWidth: 1100, maxHeight: 820, margin: 'auto' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Print / Save PDF</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Select a layout, preview your quotation, then print or save as PDF.</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Layout selector */}
              <div className="w-52 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 overflow-y-auto">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">Layout</p>
                <div className="space-y-2">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLayout(l.id)}
                      className={`w-full rounded-xl border-2 p-2.5 text-left transition-all hover:shadow-md ${
                        layout === l.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className={`w-full h-16 mb-2 rounded overflow-hidden border ${layout === l.id ? 'border-blue-200 dark:border-blue-800' : 'border-gray-100 dark:border-gray-700'}`}>
                        {l.preview}
                      </div>
                      <p className={`text-xs font-bold ${layout === l.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{l.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Scaled A4 preview */}
              <div className="flex-1 bg-gray-100 dark:bg-gray-950 overflow-auto flex justify-center pt-8 pb-4 px-4">
                {/* Outer wrapper clips to the scaled size */}
                <div style={{ width: scaledW, height: scaledH, flexShrink: 0, overflow: 'hidden', borderRadius: 4 }}>
                  <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left', width: A4_W_PX }}>
                    <LayoutComponent {...layoutProps} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Tip: Your browser will open the system print dialog. Choose <strong>Save as PDF</strong> to download.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Printer size={15} />
                  Print / Save as PDF
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
