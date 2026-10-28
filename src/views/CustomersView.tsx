import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Share2,
  Phone,
  IndianRupee,
  ChevronRight,
  ArrowDownLeft,
  X,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Customer, Sale, CustomerPaymentRecord, StoreSettings, Language } from '../types';
import { db } from '../services/db';
import { formatINR, formatDateTime, buildWhatsAppReminderLink } from '../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  sales: Sale[];
  payments: CustomerPaymentRecord[];
  settings: StoreSettings;
  onRefresh: () => void;
  language: Language;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  sales,
  payments,
  settings,
  onRefresh,
  language,
}) => {
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [receivePaymentModal, setReceivePaymentModal] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Add new customer modal
  const [isAddCustModalOpen, setIsAddCustModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  const totalMarketCredit = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.outstandingCredit, 0);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.address && c.address.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Selected customer sales and payments
  const customerSales = useMemo(() => {
    if (!selectedCustomer) return [];
    return sales.filter(
      (s) => s.customerId === selectedCustomer.id || s.customerPhone === selectedCustomer.phone
    );
  }, [selectedCustomer, sales]);

  const customerPayments = useMemo(() => {
    if (!selectedCustomer) return [];
    return payments.filter((p) => p.customerId === selectedCustomer.id);
  }, [selectedCustomer, payments]);

  const handleReceivePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivePaymentModal || paymentAmount <= 0) return;

    db.recordCustomerPayment(
      receivePaymentModal.id,
      paymentAmount,
      paymentMode,
      paymentNotes
    );

    setReceivePaymentModal(null);
    setPaymentAmount(0);
    setPaymentNotes('');
    onRefresh();
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustPhone.trim()) return;

    const existing = customers.find((c) => c.phone === newCustPhone.trim());
    if (existing) {
      alert(isHindi ? 'यह फोन नंबर पहले से पंजीकृत है।' : 'Customer with this phone already exists.');
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim() || 'Valued Customer',
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      totalPurchases: 0,
      totalPaid: 0,
      outstandingCredit: 0,
      createdDate: new Date().toISOString().slice(0, 10),
    };

    const currentCustomers = db.getCustomers();
    currentCustomers.unshift(newCustomer);
    db.saveCustomers(currentCustomers);

    setIsAddCustModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    onRefresh();
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-10">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isHindi ? 'ग्राहक खाता बही (उधार हिसाब)' : 'Customer Credit Ledger (Khata)'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi
              ? 'उधार बिक्री ट्रैक करें, किस्तों में वसूली दर्ज करें और व्हाट्सएप तकाजा भेजें'
              : 'Track market credit, collect dues, view ledgers & send WhatsApp reminders'}
          </p>
        </div>

        <button
          onClick={() => setIsAddCustModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? 'नया ग्राहक जोड़ें' : 'Add New Customer'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-amber-900/40">
          <div className="text-xs text-slate-400">{isHindi ? 'बाजार में कुल फंसा उधार' : 'Total Outstanding Credit'}</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono tabular-nums">
            {formatINR(totalMarketCredit)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {isHindi ? 'ग्राहकों से वसूली योग्य' : 'Receivable from customers'}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">{isHindi ? 'कुल पंजीकृत ग्राहक' : 'Total Customers'}</div>
          <div className="text-2xl font-black text-white mt-1 font-mono tabular-nums">
            {customers.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {isHindi ? 'दुकान से जुड़े ग्राहक' : 'Active accounts'}
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">{isHindi ? 'उधार वाले सक्रिय ग्राहक' : 'Customers with Dues'}</div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono tabular-nums">
            {customers.filter((c) => c.outstandingCredit > 0).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {isHindi ? 'जिनका पेमेंट बाकी है' : 'Pending balances'}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isHindi ? 'ग्राहक का नाम या मोबाइल नंबर खोजें...' : 'Search customer by name or phone...'}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Customers List */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800/80">
        {filteredCustomers.map((c) => {
          const reminderLink = buildWhatsAppReminderLink(c, settings);
          const hasBalance = c.outstandingCredit > 0;

          return (
            <div
              key={c.id}
              className="p-4 hover:bg-slate-850/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Info */}
              <div
                onClick={() => setSelectedCustomer(c)}
                className="cursor-pointer space-y-1 min-w-0 flex-1 group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {c.name}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    📞 {c.phone}
                  </span>
                </div>
                {c.address && (
                  <div className="text-xs text-slate-500 truncate">
                    📍 {c.address}
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  {isHindi ? 'कुल खरीद:' : 'Total Bought:'} ₹{c.totalPurchases} ·{' '}
                  {isHindi ? 'जमा:' : 'Paid:'} ₹{c.totalPaid}
                </div>
              </div>

              {/* Actions & Balance */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">
                    {isHindi ? 'बाकी उधार:' : 'Balance Due:'}
                  </div>
                  <div
                    className={`text-base font-black font-mono tabular-nums ${
                      hasBalance ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {formatINR(c.outstandingCredit)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {hasBalance && (
                    <>
                      <a
                        href={reminderLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title={isHindi ? 'व्हाट्सएप तकाजा भेजें' : 'Send WhatsApp Reminder'}
                      >
                        <Share2 className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          setReceivePaymentModal(c);
                          setPaymentAmount(c.outstandingCredit);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        {isHindi ? 'रुपये जमा' : 'Receive'}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedCustomer(c)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="View Khata Ledger"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Ledger Detailed Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedCustomer.name} - {isHindi ? 'खाता बही' : 'Ledger Statement'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">Ph: {selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary strip */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs shrink-0">
              <div>
                <div className="text-slate-400 text-[10px]">Total Purchases</div>
                <div className="font-bold text-white font-mono mt-0.5">₹{selectedCustomer.totalPurchases}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Total Paid</div>
                <div className="font-bold text-emerald-400 font-mono mt-0.5">₹{selectedCustomer.totalPaid}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">Current Balance</div>
                <div className="font-bold text-amber-400 font-mono mt-0.5">₹{selectedCustomer.outstandingCredit}</div>
              </div>
            </div>

            {/* Ledger Transactions Stream */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="font-bold text-slate-300 text-xs">
                {isHindi ? 'सभी इनवॉइस व भुगतान रसीदें:' : 'Transaction History:'}
              </div>

              {customerSales.length === 0 && customerPayments.length === 0 ? (
                <p className="text-slate-500 py-4 text-center">No transactions recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {/* Sales */}
                  {customerSales.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-white font-mono">{s.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">{formatDateTime(s.timestamp)}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="font-bold text-white">₹{s.grandTotal}</div>
                        {s.balanceDue > 0 && (
                          <div className="text-[10px] text-amber-400">Udhar: ₹{s.balanceDue}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Payments received */}
                  {customerPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-emerald-300">
                            {isHindi ? 'रुपये प्राप्त हुए (Khata Payment)' : 'Payment Received'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {formatDateTime(p.timestamp)} · Mode: {p.paymentMethod}
                          </div>
                          {p.notes && <div className="text-[10px] text-slate-400">{p.notes}</div>}
                        </div>
                      </div>
                      <div className="font-bold text-emerald-400 font-mono text-sm">
                        +₹{p.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Khata Payment Modal */}
      {receivePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {isHindi ? 'उधार वसूली दर्ज करें' : 'Record Credit Collection'}
              </h3>
              <button
                onClick={() => setReceivePaymentModal(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              {receivePaymentModal.name} · {isHindi ? 'कुल बकाया:' : 'Outstanding:'}{' '}
              <strong className="text-amber-400 font-mono">₹{receivePaymentModal.outstandingCredit}</strong>
            </div>

            <form onSubmit={handleReceivePaymentSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'प्राप्त राशि (₹)' : 'Received Amount (₹)'}
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'भुगतान का प्रकार' : 'Payment Mode'}
                </label>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {(['Cash', 'UPI', 'Card'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMode(m)}
                      className={`py-1.5 rounded-lg font-semibold transition-colors ${
                        paymentMode === m
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'नोट (वैकल्पिक)' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid via GPay ref 12345"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReceivePaymentModal(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {isHindi ? 'जमा करें' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {isHindi ? 'नया ग्राहक जोड़ें' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => setIsAddCustModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  {isHindi ? 'ग्राहक का नाम *' : 'Customer Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  {isHindi ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="98290..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  {isHindi ? 'पता / शहर (वैकल्पिक)' : 'Address / Locality'}
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Station Road, Jaipur"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {isHindi ? 'सेव करें' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
