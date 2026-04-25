import { Printer, Wand2, Zap, LogOut, Sun, Moon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { BrandSettings } from '../../types';

type Tab = 'ai' | 'edit' | 'preview' | 'brand';

interface AppNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  brand: BrandSettings;
  credits: number | null;
  setShowOutOfCredits: (v: boolean) => void;
  onOpenPrintModal: () => void;
  user: User | null;
  signOut: () => Promise<void>;
  isDark: boolean;
  toggleTheme: () => void;
}

export default function AppNav({
  activeTab, setActiveTab, brand, credits,
  setShowOutOfCredits, onOpenPrintModal, user, signOut,
  isDark, toggleTheme,
}: AppNavProps) {
  const tabBtn = (tab: Tab, label: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 ${
        activeTab === tab
          ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const creditClass = credits === null
    ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
    : credits === 0
    ? 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900'
    : credits <= 20
    ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300';

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4 print:hidden">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          {brand.logoDataUrl
            ? <img src={brand.logoDataUrl} alt="Logo" className="h-14 object-contain" />
            : <span className="text-xl font-bold tracking-widest text-gray-800 dark:text-gray-100">{brand.companyName}</span>
          }
        </div>

        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            {tabBtn('ai', <><Wand2 size={14} />AI</>)}
            {tabBtn('brand', 'Brand')}
            {tabBtn('edit', 'Edit')}
            {tabBtn('preview', 'Preview')}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Credit Badge */}
          <button
            onClick={() => { if (credits !== null && credits === 0) setShowOutOfCredits(true); }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${creditClass}`}
            title="AI Credits remaining"
          >
            <Zap size={12} className={credits !== null && credits <= 20 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'} />
            {credits === null ? '…' : `${credits} credits`}
          </button>

          {/* Print — only on Edit / Preview tabs */}
          {(activeTab === 'edit' || activeTab === 'preview') && (
            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px] hidden sm:block">
              {user?.email}
            </p>
            <button
              onClick={signOut}
              title="Sign out"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
