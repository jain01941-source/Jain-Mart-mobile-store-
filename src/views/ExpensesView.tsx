import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  IndianRupee,
  PieChart,
  Filter,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import { Expense, ExpenseCategory, Language } from '../types';
import { db } from '../services/db';
import { formatINR, formatDateTime, formatDateOnly } from '../utils/formatters';
import { expenseCategoryLabels } from '../utils/translations';

interface ExpensesViewProps {
  expenses: Expense[];
  onRefresh: () => void;
  language: Language;
}

const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Shop Rent',
  'Electricity Bill',
  'Employee Salary',
  'Transport',
  'Packaging',
  'Repairs',
  'Tea & Refreshment',
  'Other Expenses',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  onRefresh,
  language,
}) => {
  const isHindi = language === 'hi';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('All');

  // Form Fields
  const [category, setCategory] = useState<ExpenseCategory>('Tea & Refreshment');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI'>('Cash');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM

  const todayTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  const monthTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(currentMonthStr))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonthStr]);

  const lifetimeTotal = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedFilterCategory === 'All') return expenses;
    return expenses.filter((e) => e.category === selectedFilterCategory);
  }, [expenses, selectedFilterCategory]);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    db.addExpense({
      category,
      title: title.trim(),
      amount: Number(amount) || 0,
      paymentMode,
    });

    setIsModalOpen(false);
    setTitle('');
    setAmount(0);
    onRefresh();
  };

  const handleDeleteExpense = (id: string, expTitle: string) => {
    if (confirm(isHindi ? `क्या आप "${expTitle}" खर्च को हटाना चाहते हैं?` : `Delete expense "${expTitle}"?`)) {
      db.deleteExpense(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-10">
      {/* Top Banner & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isHindi ? 'दुकान खर्च प्रबंधन (Expense Management)' : 'Daily Shop Expenses'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi
              ? 'दुकान किराया, बिजली बिल, कर्मचारी वेतन, चाय-पानी व लॉजिस्टिक्स खर्च का रीयल-टाइम हिसाब'
              : 'Log store rent, electricity, salaries, tea & transit to compute real net profit'}
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setAmount(0);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? 'नया खर्च लिखें' : 'Add New Expense'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">{isHindi ? 'आज का कुल खर्च' : "Today's Expenses"}</div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono tabular-nums">
            {formatINR(todayTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{isHindi ? 'आज की तारीख में' : 'Recorded today'}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">{isHindi ? 'इस महीने का कुल खर्च' : "This Month's Total Expenses"}</div>
          <div className="text-2xl font-black text-white mt-1 font-mono tabular-nums">
            {formatINR(monthTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{isHindi ? 'चालू माह में' : 'Current calendar month'}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">{isHindi ? 'शुरू से अब तक कुल खर्च' : 'All-Time Logged Expenses'}</div>
          <div className="text-2xl font-black text-slate-300 mt-1 font-mono tabular-nums">
            {formatINR(lifetimeTotal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{isHindi ? 'समस्त व्यापारिक खर्च' : 'Overall store overhead'}</div>
        </div>
      </div>

      {/* Category breakdown strip */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isHindi ? 'खर्चों का श्रेणीवार विवरण:' : 'Category-wise Breakdown:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {categoryBreakdown.map(([cat, amt]) => (
              <div key={cat} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                <div className="text-slate-400 truncate">
                  {isHindi ? expenseCategoryLabels[cat as ExpenseCategory]?.hi || cat : cat}
                </div>
                <div className="font-bold text-white font-mono mt-0.5">{formatINR(amt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedFilterCategory('All')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
            selectedFilterCategory === 'All'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          {isHindi ? 'सभी खर्चे' : 'All Expenses'}
        </button>
        {ALL_EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              selectedFilterCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {isHindi ? expenseCategoryLabels[cat]?.hi : cat}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              {isHindi ? 'कोई खर्च दर्ज नहीं मिला।' : 'No expenses recorded in this category.'}
            </p>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-4 hover:bg-slate-850/50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate">
                    {exp.title}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {exp.paymentMode}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="text-emerald-400">
                    {isHindi ? expenseCategoryLabels[exp.category]?.hi : exp.category}
                  </span>
                  <span> · </span>
                  <span>{formatDateOnly(exp.date)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right font-mono font-black text-rose-400 text-sm tabular-nums">
                  -{formatINR(exp.amount)}
                </div>

                <button
                  onClick={() => handleDeleteExpense(exp.id, exp.title)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete Expense"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {isHindi ? 'दुकान का नया खर्च दर्ज करें' : 'Record Shop Expense'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'खर्च की श्रेणी *' : 'Expense Category *'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {ALL_EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {isHindi ? expenseCategoryLabels[cat]?.hi : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'खर्च का विवरण (विवरण) *' : 'Description / Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. October Shop Rent or Staff Tea"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'खर्च राशि (₹) *' : 'Amount (₹) *'}
                </label>
                <input
                  type="number"
                  required
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isHindi ? 'तारीख' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isHindi ? 'भुगतान मोड' : 'Payment Mode'}
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {isHindi ? 'खर्च सेव करें' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
