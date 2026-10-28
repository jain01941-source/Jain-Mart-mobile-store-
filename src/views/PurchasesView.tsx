import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  IndianRupee,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Purchase, Supplier, Product, ProductCategory, Language } from '../types';
import { db } from '../services/db';
import { formatINR, formatDateTime, formatDateOnly } from '../utils/formatters';

interface PurchasesViewProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  products: Product[];
  onRefresh: () => void;
  language: Language;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  suppliers,
  products,
  onRefresh,
  language,
}) => {
  const isHindi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'invoices' | 'suppliers'>('invoices');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [paySupplierModal, setPaySupplierModal] = useState<Supplier | null>(null);
  const [supplierPayAmount, setSupplierPayAmount] = useState<number>(0);

  // Form State for New Purchase
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Credit'>('Bank Transfer');
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Line items for the purchase
  const [purchaseItems, setPurchaseItems] = useState<
    {
      productId?: string;
      productName: string;
      brand: string;
      category: ProductCategory;
      quantity: number;
      purchasePrice: number;
      sellingPrice: number;
      rawImeis?: string;
    }[]
  >([
    {
      productName: '',
      brand: '',
      category: 'Smartphones',
      quantity: 1,
      purchasePrice: 0,
      sellingPrice: 0,
      rawImeis: '',
    },
  ]);

  const totalPurchaseAmount = purchaseItems.reduce(
    (sum, item) => sum + (Number(item.purchasePrice) || 0) * (Number(item.quantity) || 1),
    0
  );

  const balanceDue = Math.max(0, totalPurchaseAmount - (Number(paidAmount) || 0));

  const totalOutstandingToWholesalers = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);
  const totalPurchasesOverall = suppliers.reduce((sum, s) => sum + s.totalPurchased, 0);

  const handleAddItemRow = () => {
    setPurchaseItems((prev) => [
      ...prev,
      {
        productName: '',
        brand: '',
        category: 'Chargers',
        quantity: 5,
        purchasePrice: 0,
        sellingPrice: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSelectExistingProduct = (idx: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setPurchaseItems((prev) => {
      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        productId: prod.id,
        productName: prod.name,
        brand: prod.brand,
        category: prod.category,
        purchasePrice: prod.purchasePrice,
        sellingPrice: prod.sellingPrice,
      };
      return copy;
    });
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    const formattedItems = purchaseItems.map((item) => {
      let imeis: string[] | undefined = undefined;
      if (item.category === 'Smartphones' && item.rawImeis) {
        imeis = item.rawImeis
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
      return {
        productId: item.productId,
        productName: item.productName || 'Mobile Item',
        brand: item.brand || 'Generic',
        category: item.category,
        quantity: imeis && imeis.length > 0 ? imeis.length : Number(item.quantity) || 1,
        purchasePrice: Number(item.purchasePrice) || 0,
        sellingPrice: Number(item.sellingPrice) || 0,
        imeis,
      };
    });

    db.createPurchase({
      invoiceNumber: supplierInvoiceNo || `INV-${Date.now().toString().slice(-4)}`,
      supplierId: `sup-${Date.now()}`,
      supplierName,
      supplierPhone,
      items: formattedItems,
      totalAmount: totalPurchaseAmount,
      paidAmount: Number(paidAmount) || 0,
      balanceDue,
      paymentMethod: paymentMode,
    });

    setIsAddModalOpen(false);
    onRefresh();
  };

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paySupplierModal || supplierPayAmount <= 0) return;
    db.recordSupplierPayment(paySupplierModal.id, supplierPayAmount);
    setPaySupplierModal(null);
    setSupplierPayAmount(0);
    onRefresh();
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-10">
      {/* Top Banner & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isHindi ? 'खरीदारी प्रबंधन (Purchase Management)' : 'Wholesaler Purchases'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi
              ? 'होलसेलर से खरीद दर्ज करें, स्टॉक तुरंत बढ़ेगा और सप्लायर बकाया ट्रैक होगा'
              : 'Log vendor invoices, auto-increment stock & track wholesaler dues'}
          </p>
        </div>

        <button
          onClick={() => {
            setSupplierInvoiceNo(`WH-${Date.now().toString().slice(-5)}`);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? 'नई खरीदारी दर्ज करें' : 'Add Purchase Entry'}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">{isHindi ? 'होलसेलर का कुल बकाया' : 'Total Wholesaler Balance'}</div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono tabular-nums">
            {formatINR(totalOutstandingToWholesalers)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{isHindi ? 'देय राशि' : 'Pending payment'}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">{isHindi ? 'कुल दर्ज खरीदारी मूल्य' : 'Total Lifetime Purchased'}</div>
          <div className="text-2xl font-black text-white mt-1 font-mono tabular-nums">
            {formatINR(totalPurchasesOverall)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{isHindi ? 'सभी सप्लायर्स से' : 'Across all distributors'}</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400">{isHindi ? 'सप्लायर / डिस्ट्रीब्यूटर' : 'Registered Suppliers'}</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono tabular-nums">
            {suppliers.length} <span className="text-xs font-normal text-slate-400">{isHindi ? 'फर्म्स' : 'vendors'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{isHindi ? 'जयपुर व दिल्ली हब' : 'Active Wholesalers'}</div>
        </div>
      </div>

      {/* Segmented View Toggle */}
      <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'invoices' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isHindi ? 'खरीद इनवॉइस इतिहास' : 'Purchase Invoices'}
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'suppliers' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isHindi ? 'सप्लायर बकाया खाता (Ledger)' : 'Supplier Balances'}
        </button>
      </div>

      {/* Tab 1: Invoices History */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {purchases.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                {isHindi ? 'अभी तक कोई खरीदारी दर्ज नहीं की गई है।' : 'No wholesaler purchases recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {purchases.map((pur) => (
                <div key={pur.id} className="p-4 hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{pur.invoiceNumber}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {formatDateOnly(pur.date)}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">{pur.supplierName}</div>
                    <div className="text-xs text-slate-400">
                      {pur.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-white font-mono tabular-nums">
                      {formatINR(pur.totalAmount)}
                    </div>
                    <div className="text-xs text-slate-400">
                      Paid: {formatINR(pur.paidAmount)} ·{' '}
                      <span className={pur.balanceDue > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        Due: {formatINR(pur.balanceDue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Supplier Balances */}
      {activeTab === 'suppliers' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
          {suppliers.map((sup) => (
            <div key={sup.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition-colors">
              <div>
                <div className="text-sm font-bold text-white">{sup.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Ph: {sup.phone} {sup.address && `· ${sup.address}`}
                </div>
                {sup.gstin && <div className="text-[10px] text-slate-500 font-mono">GSTIN: {sup.gstin}</div>}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400">{isHindi ? 'बकाया राशि:' : 'Balance Due:'}</div>
                  <div className={`text-base font-black font-mono tabular-nums ${sup.outstandingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatINR(sup.outstandingBalance)}
                  </div>
                </div>

                {sup.outstandingBalance > 0 && (
                  <button
                    onClick={() => {
                      setPaySupplierModal(sup);
                      setSupplierPayAmount(sup.outstandingBalance);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                  >
                    {isHindi ? 'रुपये चुकाएं' : 'Pay Vendor'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Purchase Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {isHindi ? 'होलसेलर खरीदारी दर्ज करें' : 'Log Wholesaler Purchase'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    {isHindi ? 'सप्लायर / होलसेलर नाम *' : 'Supplier Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Arihant Telecom Wholesalers"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    {isHindi ? 'सप्लायर फोन' : 'Supplier Phone'}
                  </label>
                  <input
                    type="text"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="98280..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    {isHindi ? 'होलसेलर बिल नंबर' : 'Vendor Invoice No.'}
                  </label>
                  <input
                    type="text"
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">
                    {isHindi ? 'खरीद तारीख' : 'Purchase Date'}
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Purchase Items List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">
                    {isHindi ? 'खरीदे गए सामान की सूची' : 'Purchased Items'}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'आइटम पंक्ति जोड़ें' : 'Add Item'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center gap-2">
                        {/* Pick existing product if matches */}
                        <select
                          onChange={(e) => handleSelectExistingProduct(idx, e.target.value)}
                          className="w-48 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 text-[11px]"
                        >
                          <option value="">{isHindi ? '-- मौजूदा प्रोडक्ट चुनें --' : '-- Or Pick Existing Product --'}</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>

                        {purchaseItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="col-span-2">
                          <label className="text-[10px] text-slate-400 block">आइटम नाम (Item Name)</label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPurchaseItems((prev) => {
                                const c = [...prev];
                                c[idx].productName = v;
                                return c;
                              });
                            }}
                            placeholder="e.g. Type-C Braided Cable"
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">मात्रा (Qty)</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setPurchaseItems((prev) => {
                                const c = [...prev];
                                c[idx].quantity = v;
                                return c;
                              });
                            }}
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">खरीद रेट (₹)</label>
                          <input
                            type="number"
                            value={item.purchasePrice || ''}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              setPurchaseItems((prev) => {
                                const c = [...prev];
                                c[idx].purchasePrice = v;
                                return c;
                              });
                            }}
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
                          />
                        </div>
                      </div>

                      {/* If category is Smartphone, allow entering new IMEIs */}
                      {item.category === 'Smartphones' && (
                        <div>
                          <label className="text-[10px] text-emerald-400 block">
                            {isHindi ? '15-अंकीय IMEI नंबर (यदि फोन हो):' : 'Enter 15-digit IMEIs for this smartphone:'}
                          </label>
                          <input
                            type="text"
                            value={item.rawImeis || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setPurchaseItems((prev) => {
                                const c = [...prev];
                                c[idx].rawImeis = v;
                                return c;
                              });
                            }}
                            placeholder="864201941234567, 864201941234568"
                            className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-emerald-400 text-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment info */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {isHindi ? 'भुगतान का तरीका' : 'Payment Mode'}
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                    >
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="UPI">UPI (GPay / PhonePe)</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit">Credit (पूरा उधार)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {isHindi ? 'दी गई राशि (₹)' : 'Paid Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      value={paidAmount || ''}
                      onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-mono">
                  <span className="text-slate-400">Total Purchase: ₹{totalPurchaseAmount}</span>
                  <span className="text-rose-400 font-bold">Balance Due: ₹{balanceDue}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20"
                >
                  {isHindi ? 'खरीद सेव करें व स्टॉक बढ़ाएं' : 'Save & Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {paySupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {isHindi ? 'सप्लायर को भुगतान करें' : 'Record Vendor Payment'}
              </h3>
              <button
                onClick={() => setPaySupplierModal(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              {paySupplierModal.name} · बकाया: <strong className="text-rose-400 font-mono">₹{paySupplierModal.outstandingBalance}</strong>
            </div>

            <form onSubmit={handlePaySupplierSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'चुकाई जाने वाली राशि (₹)' : 'Payment Amount (₹)'}
                </label>
                <input
                  type="number"
                  required
                  value={supplierPayAmount || ''}
                  onChange={(e) => setSupplierPayAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaySupplierModal(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  {isHindi ? 'भुगतान दर्ज करें' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
