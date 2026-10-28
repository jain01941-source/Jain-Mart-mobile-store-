import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Smartphone,
  Package,
  Calendar,
  X,
} from 'lucide-react';
import { ReturnRecord, Sale, Language } from '../types';
import { db } from '../services/db';
import { formatINR, formatDateTime, formatDateOnly } from '../utils/formatters';

interface ReturnsViewProps {
  returns: ReturnRecord[];
  sales: Sale[];
  onRefresh: () => void;
  language: Language;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  returns,
  sales,
  onRefresh,
  language,
}) => {
  const isHindi = language === 'hi';

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [searchedSale, setSearchedSale] = useState<Sale | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Return form state
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [returnQty, setReturnQty] = useState<number>(1);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [itemCondition, setItemCondition] = useState<'good' | 'defective'>('good');
  const [refundMode, setRefundMode] = useState<'Cash' | 'UPI' | 'Credit Adjustment'>('Cash');
  const [returnReason, setReturnReason] = useState('Customer changed mind');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSearchInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSuccessMessage(null);

    const q = invoiceSearch.trim().toLowerCase();
    const found = sales.find(
      (s) => s.invoiceNumber.toLowerCase() === q || s.invoiceNumber.toLowerCase().includes(q)
    );

    if (found) {
      setSearchedSale(found);
      setSelectedItemIndex(0);
      if (found.items.length > 0) {
        setReturnQty(1);
        setRefundAmount(found.items[0].sellingPrice - found.items[0].discount);
      }
    } else {
      setSearchError(
        isHindi
          ? `इनवॉइस नंबर "${invoiceSearch}" नहीं मिला। कृपया पुनः जांचें।`
          : `Invoice "${invoiceSearch}" not found.`
      );
      setSearchedSale(null);
    }
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedSale) return;

    const item = searchedSale.items[selectedItemIndex];
    if (!item) return;

    db.processReturn({
      saleId: searchedSale.id,
      invoiceNumber: searchedSale.invoiceNumber,
      customerName: searchedSale.customerName,
      customerPhone: searchedSale.customerPhone,
      items: [
        {
          productId: item.productId,
          productName: item.productName,
          quantity: Number(returnQty) || 1,
          refundAmount: Number(refundAmount) || 0,
          purchaseCost: item.purchasePrice * (Number(returnQty) || 1),
          returnImei: item.selectedImei,
          condition: itemCondition,
        },
      ],
      totalRefund: Number(refundAmount) || 0,
      refundMode,
      reason: returnReason,
    });

    setSuccessMessage(
      isHindi
        ? `वापसी सफलतापूर्वक दर्ज हो गई! ₹${refundAmount} का रिफंड हो गया और स्टॉक वापस जुड़ गया।`
        : `Return processed successfully! Refund of ₹${refundAmount} recorded and stock restored.`
    );

    setSearchedSale(null);
    setInvoiceSearch('');
    onRefresh();
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-10">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {isHindi ? 'सामान वापसी व रिफंड (Returns & Cancellations)' : 'Sales Returns & Refunds'}
        </h2>
        <p className="text-xs text-slate-400">
          {isHindi
            ? 'ग्राहक से सामान वापस लें, स्टॉक दोबारा बढ़ेगा और मुनाफे का हिसाब सही होगा'
            : 'Process customer returns, restore inventory stock, and reverse profit accurately'}
        </p>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Invoice to Return */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="text-xs font-bold text-white uppercase tracking-wider">
          {isHindi ? '1. बिल / इनवॉइस खोजें:' : '1. Search Original Invoice:'}
        </div>

        <form onSubmit={handleSearchInvoice} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              placeholder="e.g. JM-261028-0001"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            {isHindi ? 'खोजें' : 'Search Bill'}
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-400 font-medium">{searchError}</p>
        )}

        {/* Found Sale Return Form */}
        {searchedSale && (
          <div className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white font-mono">{searchedSale.invoiceNumber}</span>
                <span className="text-slate-400"> · {formatDateTime(searchedSale.timestamp)}</span>
                <div className="text-slate-300 font-medium mt-0.5">
                  {searchedSale.customerName} (📞 {searchedSale.customerPhone || 'N/A'})
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="font-bold text-white">₹{searchedSale.grandTotal}</div>
                <div className="text-[10px] text-slate-400">{searchedSale.paymentMethod}</div>
              </div>
            </div>

            <form onSubmit={handleProcessReturn} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'वापस किया जाने वाला सामान चुनें:' : 'Select Item to Return:'}
                </label>
                <select
                  value={selectedItemIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedItemIndex(idx);
                    const itm = searchedSale.items[idx];
                    if (itm) setRefundAmount(itm.sellingPrice - itm.discount);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {searchedSale.items.map((itm, i) => (
                    <option key={i} value={i}>
                      {itm.productName} (Qty: {itm.quantity}, Rate: ₹{itm.sellingPrice})
                      {itm.selectedImei ? ` [IMEI: ${itm.selectedImei}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isHindi ? 'वापसी मात्रा' : 'Return Qty'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={searchedSale.items[selectedItemIndex]?.quantity || 1}
                    value={returnQty}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      setReturnQty(q);
                      const itm = searchedSale.items[selectedItemIndex];
                      if (itm) setRefundAmount((itm.sellingPrice - itm.discount) * q);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isHindi ? 'रिफंड राशि (₹)' : 'Refund Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    value={refundAmount || ''}
                    onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isHindi ? 'सामान की स्थिति' : 'Item Condition'}
                  </label>
                  <select
                    value={itemCondition}
                    onChange={(e) => setItemCondition(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="good">{isHindi ? 'सही (पुनः बिक्री योग्य)' : 'Good (Resellable)'}</option>
                    <option value="defective">{isHindi ? 'खराब / डिफेक्टिव' : 'Defective'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isHindi ? 'रिफंड का तरीका' : 'Refund Mode'}
                  </label>
                  <select
                    value={refundMode}
                    onChange={(e) => setRefundMode(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Cash">Cash (नकद)</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Adjustment">Credit / उधार घटाएं</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isHindi ? 'वापसी का कारण' : 'Return Reason'}
                </label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Defective charging port or customer exchanged color"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSearchedSale(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20"
                >
                  {isHindi ? 'वापसी स्वीकृत करें व स्टॉक रीस्टॉक करें' : 'Process Return & Restock'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Returns History */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
        <div className="p-4 text-xs font-bold text-white uppercase tracking-wider">
          {isHindi ? 'सामान वापसी का इतिहास (Return Records):' : 'Recent Return Records:'}
        </div>

        {returns.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {isHindi ? 'अभी तक कोई वापसी दर्ज नहीं हुई है।' : 'No returns recorded yet.'}
          </div>
        ) : (
          returns.map((ret) => (
            <div key={ret.id} className="p-4 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">Bill: {ret.invoiceNumber}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                    {formatDateOnly(ret.date)}
                  </span>
                </div>
                <div className="text-slate-300 mt-0.5">
                  {ret.customerName} · {ret.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                </div>
                <div className="text-[11px] text-slate-500">
                  Reason: {ret.reason} · Mode: {ret.refundMode}
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="font-bold text-rose-400 text-sm">
                  -{formatINR(ret.totalRefund)}
                </div>
                <div className="text-[10px] text-emerald-400">Restocked</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
