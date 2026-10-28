import React from 'react';
import { Smartphone, Lock, Globe, PlusCircle } from 'lucide-react';
import { Language, StoreSettings } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  language: Language;
  onToggleLanguage: () => void;
  settings: StoreSettings;
  onLockApp: () => void;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  language,
  onToggleLanguage,
  settings,
  onLockApp,
  lowStockCount,
}) => {
  const isHindi = language === 'hi';

  const navItems = [
    { id: 'dashboard', label: isHindi ? 'डैशबोर्ड' : 'Dashboard' },
    { id: 'billing', label: isHindi ? 'नई बिक्री' : 'New Sale' },
    { id: 'products', label: isHindi ? 'स्टॉक' : 'Products' },
    { id: 'purchases', label: isHindi ? 'खरीदारी' : 'Purchases' },
    { id: 'customers', label: isHindi ? 'खाता (उधार)' : 'Customers' },
    { id: 'expenses', label: isHindi ? 'खर्चे' : 'Expenses' },
    { id: 'reports', label: isHindi ? 'मुनाफा रिपोर्ट' : 'P&L Reports' },
    { id: 'settings', label: isHindi ? 'सेटिंग्स' : 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left shrink-0 focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold tracking-tight text-white whitespace-nowrap">
              {isHindi ? settings.storeNameHi : settings.storeName}
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[200px]">
              {isHindi ? 'मोबाइल शॉप मैनेजमेंट' : 'Mobile Store Management'}
            </div>
          </div>
        </button>

        {/* Zone 2: Desktop Nav Links (hidden on mobile, mobile uses thumb bottom bar) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick new sale button on tablet/desktop */}
          <button
            onClick={() => onNavigate('billing')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isHindi ? 'नया बिल' : 'New Bill'}</span>
          </button>

          {/* Bilingual Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">{isHindi ? 'English' : 'हिन्दी'}</span>
          </button>

          {/* Lock App PIN button */}
          {settings.enablePin && (
            <button
              onClick={onLockApp}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Lock Application"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
