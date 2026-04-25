import { Printer, Wand2, Zap, LogOut, Sun, Moon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { BrandSettings } from '../../types';
import logoPrimary from '../../assets/logo-primary.webp';
import logoWhite   from '../../assets/logo-white.webp';

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
          ? 'bg-qs-surface shadow-sm text-qs-text'
          : 'text-qs-text-muted hover:text-qs-text'
      }`}
    >
      {label}
    </button>
  );

  const creditClass = credits === null
    ? 'border-qs-border text-qs-text-muted'
    : credits === 0
    ? 'border-qs-error bg-red-50 text-qs-error cursor-pointer hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900'
    : credits <= 20
    ? 'border-qs-warning bg-amber-50 text-qs-warning dark:bg-amber-950'
    : 'border-qs-border bg-qs-bg text-qs-text-sec';

  return (
    <nav className="sticky top-0 z-10 border-b border-qs-border bg-qs-surface px-6 py-4 print:hidden">
      <div className="flex items-center justify-between">
        {/* App Logo — always uses QuoteSuite brand assets */}
        <div className="flex items-center">
          <img
            src={isDark ? logoWhite : logoPrimary}
            alt="QuoteSuite"
            className="h-10 object-contain"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex rounded-lg bg-qs-inset p-1">
            {tabBtn('ai', <><Wand2 size={14} />AI</>)}
            {tabBtn('brand', 'Brand')}
            {tabBtn('edit', 'Edit')}
            {tabBtn('preview', 'Preview')}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-qs-border bg-qs-bg text-qs-text-muted hover:bg-qs-inset transition-colors"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Credit Badge */}
          <button
            onClick={() => { if (credits !== null && credits === 0) setShowOutOfCredits(true); }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${creditClass}`}
            title="AI Credits remaining"
          >
            <Zap size={12} className={credits !== null && credits <= 20 ? 'text-qs-warning' : 'text-qs-text-muted'} />
            {credits === null ? '…' : `${credits} credits`}
          </button>

          {/* Print — only on Edit / Preview tabs */}
          {(activeTab === 'edit' || activeTab === 'preview') && (
            <button
              onClick={onOpenPrintModal}
              className="flex items-center gap-2 rounded-lg bg-qs-primary px-4 py-2 text-sm font-medium text-white hover:bg-qs-hover transition-colors"
            >
              <Printer size={16} />
              Print / Save PDF
            </button>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-qs-border">
            <p className="text-xs font-medium text-qs-text truncate max-w-[150px] hidden sm:block">
              {user?.email}
            </p>
            <button
              onClick={signOut}
              title="Sign out"
              className="flex items-center gap-1.5 rounded-lg border border-qs-border px-3 py-2 text-xs font-medium text-qs-text-sec hover:bg-qs-inset hover:text-qs-error transition-colors"
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
