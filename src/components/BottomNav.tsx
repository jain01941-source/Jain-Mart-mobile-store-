import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Users,
  Receipt,
  Truck,
  TrendingUp,
  Settings,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';
import { Language } from '../types';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  language,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const isHindi = language === 'hi';

  const handleSelect = (view: string) => {
    onNavigate(view);
    setShowMoreMenu(false);
  };

  const moreItems = [
    { id: 'purchases', label: isHindi ? 'खरीदारी (Purchases)' : 'Purchases', icon: Truck },
    { id: 'expenses', label: isHindi ? 'दुकान खर्च (Expenses)' : 'Daily Expenses', icon: Receipt },
    { id: 'reports', label: isHindi ? 'मुनाफा रिपोर्ट (P&L)' : 'Profit & Loss Reports', icon: TrendingUp },
    { id: 'returns', label: isHindi ? 'वापसी (Returns)' : 'Returns & Refunds', icon: RotateCcw },
    { id: 'settings', label: isHindi ? 'सेटिंग्स व बैकअप' : 'Settings & Backup', icon: Settings },
  ];

  return (
    <>
      {/* "More" Slide-up Sheet for Android phone one-hand thumb operations */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm lg:hidden">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isHindi ? 'अतिरिक्त विकल्प व सेटिंग्स' : 'All Shop Operations'}
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                      isActive
                        ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-semibold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Thumb Bar (under 15% mobile viewport height constraint) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 lg:hidden px-2 py-1">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
          {/* 1. Dashboard */}
          <button
            onClick={() => handleSelect('dashboard')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentView === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
              {isHindi ? 'डैशबोर्ड' : 'Dashboard'}
            </span>
          </button>

          {/* 2. Products */}
          <button
            onClick={() => handleSelect('products')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentView === 'products' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
              {isHindi ? 'स्टॉक' : 'Stock'}
            </span>
          </button>

          {/* 3. CENTER HIGHLIGHT: New Sale / Bill */}
          <button
            onClick={() => handleSelect('billing')}
            className="min-h-[48px] flex flex-col items-center justify-center -mt-3.5 group focus:outline-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-1">
              {isHindi ? 'नया बिल' : 'New Bill'}
            </span>
          </button>

          {/* 4. Customers / Khata */}
          <button
            onClick={() => handleSelect('customers')}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              currentView === 'customers' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
              {isHindi ? 'ग्राहक खाता' : 'Khata'}
            </span>
          </button>

          {/* 5. More menu */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
              moreItems.some((i) => i.id === currentView) ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
              {isHindi ? 'और' : 'More'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
