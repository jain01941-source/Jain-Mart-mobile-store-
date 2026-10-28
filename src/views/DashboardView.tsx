import React, { useMemo } from 'react';
import {
  TrendingUp,
  Receipt,
  AlertTriangle,
  Package,
  PlusCircle,
  Truck,
  Users,
  ChevronRight,
  IndianRupee,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Language, Sale, Product } from '../types';
import { formatINR, formatDateTime } from '../utils/formatters';

interface DashboardViewProps {
  metrics: {
    todaySales: number;
    todayGrossProfit: number;
    todayNetProfit: number;
    todayExpenses: number;
    cashReceived: number;
    upiReceived: number;
    cardReceived: number;
    creditSalesToday: number;
    totalStockCount: number;
    lowStockCount: number;
    lowStockProducts: Product[];
    recentSales: Sale[];
    pendingCustomerCredit: number;
    pendingSupplierDue: number;
  };
  onNavigate: (view: string) => void;
  onSelectSale: (sale: Sale) => void;
  language: Language;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  onNavigate,
  onSelectSale,
  language,
}) => {
  const isHindi = language === 'hi';

  // Sample monthly sales comparison data for visual chart
  const monthlyData = useMemo(() => [
    { month: isHindi ? 'मई' : 'May', sales: 185000, profit: 42000 },
    { month: isHindi ? 'जून' : 'Jun', sales: 210000, profit: 48000 },
    { month: isHindi ? 'जुलाई' : 'Jul', sales: 245000, profit: 54000 },
    { month: isHindi ? 'अगस्त' : 'Aug', sales: 290000, profit: 65000 },
    { month: isHindi ? 'सितंबर' : 'Sep', sales: 320000, profit: 72000 },
    { month: isHindi ? 'अक्टूबर' : 'Oct (चालू)', sales: 385000, profit: 89000 },
  ], [isHindi]);

  const maxMonthSale = Math.max(...monthlyData.map((d) => d.sales));

  return (
    <div className="space-y-6 pb-20 lg:pb-10">
      {/* Welcome & Quick Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {isHindi ? 'लाइव बिलिंग काउंटर' : 'Live Billing Counter'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            {isHindi ? 'दैनिक व्यापार डैशबोर्ड' : "Today's Business Summary"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHindi
              ? 'बिक्री, मुनाफा, नकद, UPI व इन्वेंट्री का रीयल-टाइम हिसाब'
              : 'Real-time daily turnover, profit margins, payments and inventory status'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('billing')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHindi ? 'नया बिल बनाएं' : 'Create New Bill'}</span>
          </button>
          <button
            onClick={() => onNavigate('purchases')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Truck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHindi ? 'खरीद दर्ज करें' : 'Add Purchase'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 Top Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Today's Total Sales */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isHindi ? 'आज की कुल बिक्री' : "Today's Sales"}</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-2 font-mono tabular-nums">
            {formatINR(metrics.todaySales)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{isHindi ? 'सकल टर्नओवर' : 'Gross Turnover'}</span>
          </div>
        </div>

        {/* 2. Today's Net Profit */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-emerald-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isHindi ? 'आज का मुनाफा' : "Today's Profit"}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 font-mono tabular-nums">
            {formatINR(metrics.todayNetProfit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isHindi ? 'खर्च घटाने के बाद' : 'After Deducting Exp.'}
          </div>
        </div>

        {/* 3. Total Expenses */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isHindi ? 'दुकान खर्च' : 'Shop Expenses'}</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-2 font-mono tabular-nums">
            {formatINR(metrics.todayExpenses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isHindi ? 'आज का दर्ज खर्च' : "Today's Logged Exp."}
          </div>
        </div>

        {/* 4. Cash Received */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isHindi ? 'कुल नकद (Cash)' : 'Cash In Hand'}</span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">CASH</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-2 font-mono tabular-nums">
            {formatINR(metrics.cashReceived)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isHindi ? 'नकद भुगतान' : 'Physical Cash'}
          </div>
        </div>

        {/* 5. UPI Received */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isHindi ? 'UPI भुगतान' : 'UPI Payments'}</span>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">UPI</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-400 mt-2 font-mono tabular-nums">
            {formatINR(metrics.upiReceived)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isHindi ? 'सीधे बैंक में जमा' : 'PhonePe / GPay'}
          </div>
        </div>

        {/* 6. Credit Sales (उधार) */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{isHindi ? 'आज की उधार बिक्री' : 'Credit Sales'}</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-2 font-mono tabular-nums">
            {formatINR(metrics.creditSalesToday)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isHindi ? 'खाते में बकाया' : 'Customer Ledger'}
          </div>
        </div>
      </div>

      {/* Stock & Pending Market Outstanding Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total Stock in Shop */}
        <div
          onClick={() => onNavigate('products')}
          className="cursor-pointer bg-slate-900 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-colors">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                {isHindi ? 'स्टॉक में कुल सामान' : 'Total Products in Stock'}
              </div>
              <div className="text-lg font-bold text-white font-mono tabular-nums">
                {metrics.totalStockCount} <span className="text-xs font-normal text-slate-400">{isHindi ? 'पीस' : 'Units'}</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => onNavigate('products')}
          className="cursor-pointer bg-slate-900 hover:bg-slate-850 p-4 rounded-2xl border border-amber-900/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                {isHindi ? 'कम स्टॉक चेतावनी' : 'Low Stock Alerts'}
              </div>
              <div className="text-lg font-bold text-amber-400 font-mono tabular-nums">
                {metrics.lowStockCount} <span className="text-xs font-normal text-slate-400">{isHindi ? 'आइटम जल्द खत्म' : 'Items Low'}</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-400 underline decoration-amber-400/40">
            {isHindi ? 'देखें' : 'View'}
          </span>
        </div>

        {/* Market Outstanding Credit */}
        <div
          onClick={() => onNavigate('customers')}
          className="cursor-pointer bg-slate-900 hover:bg-slate-850 p-4 rounded-2xl border border-slate-800 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-amber-400 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                {isHindi ? 'बाजार में फंसा कुल उधार' : 'Total Customer Credit'}
              </div>
              <div className="text-lg font-bold text-white font-mono tabular-nums">
                {formatINR(metrics.pendingCustomerCredit)}
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Dual Column: Today's Transactions & Monthly Sales Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Transactions */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {isHindi ? 'आज के हालिया बिल / लेन-देन' : "Today's Transactions"}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              {isHindi ? 'सभी बिल देखें' : 'View All'}
            </button>
          </div>

          {metrics.recentSales.length === 0 ? (
            <div className="py-8 text-center text-slate-500">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                {isHindi ? 'आज अभी तक कोई बिल नहीं बना है।' : 'No bills recorded today yet.'}
              </p>
              <button
                onClick={() => onNavigate('billing')}
                className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors"
              >
                {isHindi ? 'पहला बिल बनाएं' : 'Create First Bill'}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {metrics.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  onClick={() => onSelectSale(sale)}
                  className="cursor-pointer p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800/70 flex items-center justify-between transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">
                        {sale.invoiceNumber}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                      {sale.customerName || 'Retail Customer'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {sale.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-white font-mono tabular-nums">
                      {formatINR(sale.grandTotal)}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium">
                      +{formatINR(sale.profit)} {isHindi ? 'मुनाफा' : 'profit'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Performance Trend */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {isHindi ? 'मासिक बिक्री व मुनाफा रिपोर्ट' : 'Monthly Sales Report'}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">2026</span>
          </div>

          <p className="text-xs text-slate-400">
            {isHindi
              ? 'पिछले 6 महीनों की कुल बिक्री और उसमें से हुआ शुद्ध मुनाफा:'
              : 'Last 6 months gross turnover and net earned profit:'}
          </p>

          <div className="space-y-3 pt-2">
            {monthlyData.map((d, idx) => {
              const salesPct = Math.round((d.sales / maxMonthSale) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{d.month}</span>
                    <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
                      <span className="text-white font-bold">{formatINR(d.sales)}</span>
                      <span className="text-emerald-400 text-[11px] font-semibold">
                        +{formatINR(d.profit)} {isHindi ? 'मुनाफा' : 'profit'}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${salesPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {isHindi ? 'होलसेलर बकाया कुल राशि:' : 'Total Wholesaler Dues:'}
            </span>
            <span className="font-bold text-rose-400 font-mono tabular-nums">
              {formatINR(metrics.pendingSupplierDue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
