import { Printer, Wand2, Zap, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { BrandSettings } from '../../types';

type Tab = 'ai' | 'edit' | 'preview' | 'brand';

interface AppNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  brand: BrandSettings;
  credits: number | null;
  setShowOutOfCredits: (v: boolean) => void;
  handlePrint: () => void;
  user: User | null;
  signOut: () => Promise<void>;
}

export default function AppNav({
  activeTab, setActiveTab, brand, credits,
  setShowOutOfCredits, handlePrint, user, signOut,
}: AppNavProps) {
  const tabBtn = (tab: Tab, label: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`rounded-md px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 ${
        activeTab === tab ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="sticky top-0 z-10 border-b bg-white px-6 py-4 print:hidden">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          {brand.logoDataUrl
            ? <img src={brand.logoDataUrl} alt="Logo" className="h-14 object-contain" />
            : <span className="text-xl font-bold tracking-widest text-gray-800">{brand.companyName}</span>
          }
        </div>

        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            {tabBtn('ai', <><Wand2 size={14} />AI</>)}
            {tabBtn('brand', 'Brand')}
            {tabBtn('edit', 'Edit')}
            {tabBtn('preview', 'Preview')}
          </div>

          {/* Credit Badge */}
          <button
            onClick={() => { if (credits !== null && credits === 0) setShowOutOfCredits(true); }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              credits === null   ? 'border-gray-200 text-gray-400' :
              credits === 0      ? 'border-red-200 bg-red-50 text-red-600 cursor-pointer hover:bg-red-100' :
              credits <= 20      ? 'border-amber-200 bg-amber-50 text-amber-600' :
                                   'border-gray-200 bg-gray-50 text-gray-600'
            }`}
            title="AI Credits remaining"
          >
            <Zap size={12} className={credits !== null && credits <= 20 ? 'text-amber-500' : 'text-gray-400'} />
            {credits === null ? '…' : `${credits} credits`}
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <p className="text-xs font-medium text-gray-800 truncate max-w-[150px] hidden sm:block">
              {user?.email}
            </p>
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
  );
}
