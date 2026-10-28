import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  IndianRupee,
  PieChart,
  BarChart2,
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Users,
} from 'lucide-react';
import { Sale, Expense, Product, Customer, Supplier, Language } from '../types';
import { formatINR, exportToCSV } from '../utils/formatters';

interface ReportsViewProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  language: Language;
}

type Period = 'today' | 'week' | 'month' | 'year' | 'all';

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  expenses,
  products,
  customers,
  suppliers,
  language,
}) => {
  const isHindi = language === 'hi';

  const [period, setPeriod] = useState<Period>('month');

  // Filter sales and expenses by period
  const { filteredSales, filteredExpenses } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${currentYear}-${currentMonth}`;

    // Calculate week start
    const dayOfWeek = now.getDay() || 7; // Sunday = 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    const mondayStr = monday.toISOString().slice(0, 10);

    let sList = sales.filter((s) => s.status !== 'cancelled');
    let eList = expenses;

    if (period === 'today') {
      sList = sList.filter((s) => s.date === todayStr);
      eList = eList.filter((e) => e.date === todayStr);
    } else if (period === 'week') {
      sList = sList.filter((s) => s.date >= mondayStr);
      eList = eList.filter((e) => e.date >= mondayStr);
    } else if (period === 'month') {
      sList = sList.filter((s) => s.date.startsWith(monthPrefix));
      eList = eList.filter((e) => e.date.startsWith(monthPrefix));
    } else if (period === 'year') {
      sList = sList.filter((s) => s.date.startsWith(String(currentYear)));
      eList = eList.filter((e) => e.date.startsWith(String(currentYear)));
    }

    return { filteredSales: sList, filteredExpenses: eList };
  }, [sales, expenses, period]);

  // Financial Calculations
  const grossTurnover = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);
  }, [filteredSales]);

  const totalCOGS = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
  }, [filteredSales]);

  const totalDiscounts = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.discountTotal, 0);
  }, [filteredSales]);

  const grossProfit = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + s.profit, 0);
  }, [filteredSales]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const netProfit = grossProfit - totalExpenses;

  // Cashflow distribution (Separates credit from realized cash/bank collections)
  const cashflow = useMemo(() => {
    let cash = 0;
    let upi = 0;
    let card = 0;
    let uncollectedCredit = 0;

    filteredSales.forEach((s) => {
      if (s.paymentMethod === 'Cash') cash += s.cashReceived;
      else if (s.paymentMethod === 'UPI') upi += s.cashReceived;
      else if (s.paymentMethod === 'Card') card += s.cashReceived;
      else if (s.paymentMethod === 'Credit') uncollectedCredit += s.balanceDue;
      else if (s.paymentMethod === 'Split' && s.splitDetails) {
        cash += s.splitDetails.cash || 0;
        upi += s.splitDetails.upi || 0;
        card += s.splitDetails.card || 0;
        uncollectedCredit += s.splitDetails.credit || 0;
      }
    });

    return { cash, upi, card, uncollectedCredit };
  }, [filteredSales]);

  // Best Selling Products calculation
  const bestSellers = useMemo(() => {
    const map: Record<string, { name: string; brand: string; qty: number; revenue: number; profit: number }> = {};

    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = {
            name: item.productName,
            brand: item.brand,
            qty: 0,
            revenue: 0,
            profit: 0,
          };
        }
        map[item.productId].qty += item.quantity;
        map[item.productId].revenue += item.total;
        map[item.productId].profit += item.total - item.purchasePrice * item.quantity;
      });
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [filteredSales]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { qty: number; revenue: number }> = {};
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!map[item.category]) {
          map[item.category] = { qty: 0, revenue: 0 };
        }
        map[item.category].qty += item.quantity;
        map[item.category].revenue += item.total;
      });
    });
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [filteredSales]);

  // Export handlers
  const handleExportSalesCSV = () => {
    const rows = filteredSales.map((s) => ({
      InvoiceNumber: s.invoiceNumber,
      Date: s.date,
      Customer: s.customerName,
      Phone: s.customerPhone,
      GrandTotal: s.grandTotal,
      PurchaseCost: s.totalCost,
      Profit: s.profit,
      PaymentMethod: s.paymentMethod,
      CashReceived: s.cashReceived,
      BalanceDue: s.balanceDue,
      Status: s.status,
    }));
    exportToCSV(rows, 'Jain_Mart_Sales_Report');
  };

  const handleExportStockCSV = () => {
    const rows = products.map((p) => ({
      ProductName: p.name,
      Brand: p.brand,
      Category: p.category,
      PurchasePrice: p.purchasePrice,
      SellingPrice: p.sellingPrice,
      StockQuantity: p.stockQuantity,
      Barcode: p.barcode,
      SKU: p.sku,
      Supplier: p.supplierName,
      IsSmartphone: p.isSmartphone ? 'Yes' : 'No',
      AvailableIMEIs: p.smartphoneDetails?.imeiList.join(' | ') || '',
    }));
    exportToCSV(rows, 'Jain_Mart_Stock_Inventory');
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-10">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isHindi ? 'मुनाफे व बिक्री का विस्तृत हिसाब (P&L Reports)' : 'Profit & Loss Statement (P&L)'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi
              ? 'बिके सामान की खरीद लागत (COGS) व खर्चे घटाकर शुद्ध मुनाफे की रीयल-टाइम गणना'
              : 'Real-time profit accounting deducting actual purchase costs, discounts, and shop overhead'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSalesCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isHindi ? 'बिक्री CSV' : 'Export Sales'}</span>
          </button>
          <button
            onClick={handleExportStockCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{isHindi ? 'स्टॉक CSV' : 'Export Stock'}</span>
          </button>
        </div>
      </div>

      {/* Period Filter Selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
        {[
          { id: 'today', label: isHindi ? 'आज (Today)' : 'Today' },
          { id: 'week', label: isHindi ? 'इस हफ्ते (This Week)' : 'This Week' },
          { id: 'month', label: isHindi ? 'इस महीने (This Month)' : 'This Month' },
          { id: 'year', label: isHindi ? 'इस साल (This Year)' : 'This Year' },
          { id: 'all', label: isHindi ? 'शुरू से अब तक (All Time)' : 'All Time' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id as Period)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              period === item.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Profit & Loss Breakdown Master Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isHindi ? 'व्यापार का शुद्ध आय विवरण (Income Statement)' : 'Income & Profit Statement'}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 uppercase">
            {period} Period
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Line-by-line accounting calculation */}
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-300">
                1. {isHindi ? 'कुल बिक्री टर्नओवर (Gross Sales)' : 'Gross Sales Turnover'}
              </span>
              <span className="font-bold text-white tabular-nums">+{formatINR(grossTurnover)}</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">
                2. {isHindi ? 'बिके सामान की खरीद लागत (COGS)' : 'Cost of Goods Sold (COGS)'}
              </span>
              <span className="font-bold text-rose-400 tabular-nums">-{formatINR(totalCOGS)}</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">
                3. {isHindi ? 'ग्राहकों को दी गई छूट (Discounts)' : 'Discounts Given'}
              </span>
              <span className="font-bold text-slate-400 tabular-nums">-{formatINR(totalDiscounts)}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
              <span className="text-emerald-300 font-bold">
                = {isHindi ? 'सकल मुनाफा (Gross Profit)' : 'Gross Profit'}
              </span>
              <span className="font-bold text-emerald-400 text-sm tabular-nums">
                +{formatINR(grossProfit)}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="text-rose-400">
                4. {isHindi ? 'दुकान के दर्ज खर्च (Rent, Salary, etc.)' : 'Shop Expenses'}
              </span>
              <span className="font-bold text-rose-400 tabular-nums">-{formatINR(totalExpenses)}</span>
            </div>

            {/* Final Net Profit */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/40 text-sm">
              <span className="text-emerald-400 font-bold uppercase tracking-tight">
                ★ {isHindi ? 'शुद्ध मुनाफा (Net Profit)' : 'Net Profit (In Pocket)'}
              </span>
              <span className="font-black text-emerald-400 text-lg tabular-nums">
                {formatINR(netProfit)}
              </span>
            </div>
          </div>

          {/* Right: Cashflow Reconciliation (Physical vs Bank vs Uncollected Credit) */}
          <div className="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {isHindi ? 'रोकड़ व वसूली विवरण (Cashflow Reconciliation)' : 'Realized Cashflow Breakdown'}
            </div>
            <p className="text-[11px] text-slate-400">
              {isHindi
                ? 'नियम: उधार बिक्री को तब तक नकद प्राप्ति में नहीं जोड़ा जाता जब तक ग्राहक भुगतान न कर दे।'
                : 'Accounting Rule: Credit sales are never counted as cash received until collected.'}
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{isHindi ? 'हाथ में नकद (Physical Cash):' : 'Physical Cash in Hand:'}</span>
                <span className="text-white font-bold">{formatINR(cashflow.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">{isHindi ? 'सीधे बैंक खाता (UPI / PhonePe):' : 'Bank Transfer (UPI / GPay):'}</span>
                <span className="text-blue-400 font-bold">{formatINR(cashflow.upi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">{isHindi ? 'कार्ड मशीन (Card Swipe):' : 'Card Machine (POS):'}</span>
                <span className="text-purple-400 font-bold">{formatINR(cashflow.card)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-amber-400 font-semibold">{isHindi ? 'बाकी उधार (Uncollected Credit):' : 'Uncollected Market Credit:'}</span>
                <span className="text-amber-400 font-bold">{formatINR(cashflow.uncollectedCredit)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
              <span className="text-slate-400">{isHindi ? 'होलसेलर का बकाया:' : 'Supplier Dues:'}</span>
              <span className="text-rose-400 font-mono font-bold">
                {formatINR(suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Best-Selling Products & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Best Sellers */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isHindi ? 'सबसे ज्यादा बिकने वाले सामान (Best Sellers)' : 'Top Selling Products'}
            </h3>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>

          {bestSellers.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No sales in selected period.</p>
          ) : (
            <div className="divide-y divide-slate-800 text-xs">
              {bestSellers.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.brand}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-white">
                      {item.qty} {isHindi ? 'बिके' : 'sold'} · {formatINR(item.revenue)}
                    </div>
                    <div className="text-[10px] text-emerald-400">+{formatINR(item.profit)} profit</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isHindi ? 'श्रेणीवार बिक्री शेयर (Categories)' : 'Category Sales Distribution'}
            </h3>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No category data in selected period.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {categoryBreakdown.map(([cat, val], idx) => {
                const pct = grossTurnover > 0 ? Math.round((val.revenue / grossTurnover) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-300">{cat}</span>
                      <span className="font-mono text-white font-bold">
                        {formatINR(val.revenue)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
