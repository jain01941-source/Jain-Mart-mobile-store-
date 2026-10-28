import React, { useState } from 'react';
import { X, Printer, Share2, Check, Smartphone, FileText } from 'lucide-react';
import { Sale, StoreSettings } from '../types';
import { formatINR, formatDateTime, buildWhatsAppBillLink } from '../utils/formatters';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
  settings: StoreSettings;
  language: 'hi' | 'en';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  sale,
  onClose,
  settings,
  language,
}) => {
  const [viewFormat, setViewFormat] = useState<'thermal' | 'full'>('thermal');
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const isHindi = language === 'hi';
  const waLink = buildWhatsAppBillLink(sale, settings);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = decodeURIComponent(waLink.split('text=')[1] || '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Top Header - No print */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {isHindi ? 'बिल / इनवॉइस रसीद' : 'Invoice & Bill Receipt'}
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {sale.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Format toggle */}
            <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setViewFormat('thermal')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewFormat === 'thermal'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHindi ? 'थर्मल रसीद' : 'Thermal'}
              </button>
              <button
                onClick={() => setViewFormat('full')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewFormat === 'full'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isHindi ? 'फुल A4 / GST' : 'Full Invoice'}
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Bar - WhatsApp & Print - No Print */}
        <div className="no-print px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isHindi ? 'व्हाट्सएप पर बिल भेजें' : 'Share WhatsApp Bill'}</span>
          </a>

          <button
            onClick={handlePrint}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isHindi ? 'प्रिंट (Thermal/A4)' : 'Print'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
            title="Copy Bill Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 print:bg-white print:text-black print:p-0 print:overflow-visible">
          {viewFormat === 'thermal' ? (
            /* THERMAL RECEIPT VIEW (58mm / 80mm preview) */
            <div className="max-w-[340px] mx-auto bg-white text-black p-4 rounded-xl shadow font-mono text-[11px] leading-tight print:max-w-none print:shadow-none print:p-0">
              {/* Thermal Header */}
              <div className="text-center pb-2 border-b border-dashed border-black">
                <div className="text-sm font-bold tracking-tight uppercase">
                  {settings.storeName}
                </div>
                <div className="text-[10px] text-gray-700">{settings.tagline}</div>
                <div className="text-[10px] mt-0.5">{settings.address}</div>
                <div className="text-[10px] font-semibold">Ph: {settings.phone}</div>
                {sale.isGstInvoice && (
                  <div className="text-[9px] mt-0.5">GSTIN: {settings.gstin}</div>
                )}
              </div>

              {/* Invoice Meta */}
              <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>INVOICE:</span>
                  <span className="font-bold">{sale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{formatDateTime(sale.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="font-bold">{sale.customerName || 'Retail Customer'}</span>
                </div>
                {sale.customerPhone && (
                  <div className="flex justify-between">
                    <span>PHONE:</span>
                    <span>{sale.customerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PAY MODE:</span>
                  <span className="font-bold">{sale.paymentMethod}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-2 border-b border-dashed border-black">
                <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-gray-400">
                  <span className="w-1/2">ITEM</span>
                  <span className="w-1/6 text-center">QTY</span>
                  <span className="w-1/3 text-right">AMT (₹)</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="py-1">
                      <div className="flex justify-between">
                        <span className="w-1/2 font-medium truncate pr-1">
                          {item.productName}
                        </span>
                        <span className="w-1/6 text-center">{item.quantity}</span>
                        <span className="w-1/3 text-right font-semibold">
                          {item.total.toFixed(0)}
                        </span>
                      </div>
                      {item.selectedImei && (
                        <div className="text-[9px] text-gray-600 flex items-center gap-1 mt-0.5">
                          <Smartphone className="w-2.5 h-2.5 inline" />
                          <span>IMEI: {item.selectedImei}</span>
                        </div>
                      )}
                      {item.discount > 0 && (
                        <div className="text-[9px] text-gray-500">
                          Disc: -₹{item.discount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{sale.subtotal.toFixed(0)}</span>
                </div>
                {sale.discountTotal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount:</span>
                    <span>-₹{sale.discountTotal.toFixed(0)}</span>
                  </div>
                )}
                {sale.isGstInvoice && sale.taxTotal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>GST (CGST 9% + SGST 9%):</span>
                    <span>₹{sale.taxTotal.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-400">
                  <span>GRAND TOTAL:</span>
                  <span>₹{sale.grandTotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Amount Paid:</span>
                  <span>₹{sale.cashReceived.toFixed(0)}</span>
                </div>
                {sale.balanceDue > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>BALANCE DUE (Udhar):</span>
                    <span>₹{sale.balanceDue.toFixed(0)}</span>
                  </div>
                )}
              </div>

              {/* Thermal Footer */}
              <div className="pt-2 text-center text-[9px] text-gray-600 leading-tight space-y-0.5">
                <div>*** THANK YOU VISIT AGAIN ***</div>
                <div>{settings.termsConditions}</div>
              </div>
            </div>
          ) : (
            /* FULL A4 / GST TAX INVOICE VIEW */
            <div className="bg-white text-slate-900 p-6 rounded-xl shadow print:shadow-none print:p-0">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {settings.storeName}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">{settings.tagline}</p>
                  <p className="text-xs text-slate-600 mt-1">{settings.address}</p>
                  <p className="text-xs text-slate-600">
                    Phone: {settings.phone} {settings.secondaryPhone && `· ${settings.secondaryPhone}`}
                  </p>
                  {sale.isGstInvoice && (
                    <p className="text-xs font-semibold text-slate-800 mt-0.5">
                      GSTIN: {settings.gstin}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 text-xs font-bold rounded bg-slate-100 border border-slate-300 uppercase">
                    {sale.isGstInvoice ? 'Tax Invoice' : 'Retail Sale Invoice'}
                  </span>
                  <div className="mt-2 text-xs">
                    <span className="text-slate-500">Invoice No:</span>{' '}
                    <span className="font-bold text-slate-900 font-mono">{sale.invoiceNumber}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="text-slate-500">Date:</span> {formatDateTime(sale.timestamp)}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="py-3 border-b border-slate-200 grid grid-cols-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium uppercase text-[10px]">
                    Customer Details / ग्राहक:
                  </span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {sale.customerName || 'Walk-in Retail Customer'}
                  </div>
                  {sale.customerPhone && (
                    <div className="text-slate-600 font-mono">Mobile: {sale.customerPhone}</div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 font-medium uppercase text-[10px]">
                    Payment Mode / भुगतान:
                  </span>
                  <div className="font-semibold text-slate-900 mt-0.5">{sale.paymentMethod}</div>
                  {sale.splitDetails && (
                    <div className="text-[10px] text-slate-500">
                      Cash: ₹{sale.splitDetails.cash} · UPI: ₹{sale.splitDetails.upi} · Credit: ₹
                      {sale.splitDetails.credit}
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs my-4 border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-left text-slate-700">
                    <th className="py-1.5 font-bold">#</th>
                    <th className="py-1.5 font-bold">Item Description</th>
                    <th className="py-1.5 font-bold text-center">Qty</th>
                    <th className="py-1.5 font-bold text-right">Rate</th>
                    <th className="py-1.5 font-bold text-right">Disc</th>
                    <th className="py-1.5 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-2 text-slate-500">{idx + 1}</td>
                      <td className="py-2">
                        <div className="font-semibold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">{item.brand} · {item.category}</div>
                        {item.selectedImei && (
                          <div className="text-[10px] font-mono text-emerald-700 mt-0.5 font-medium">
                            IMEI: {item.selectedImei} (1-Year Brand Warranty)
                          </div>
                        )}
                      </td>
                      <td className="py-2 text-center font-medium">{item.quantity}</td>
                      <td className="py-2 text-right font-mono">₹{item.sellingPrice}</td>
                      <td className="py-2 text-right font-mono text-slate-500">
                        {item.discount > 0 ? `₹${item.discount}` : '-'}
                      </td>
                      <td className="py-2 text-right font-bold font-mono">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Totals */}
              <div className="border-t-2 border-slate-300 pt-3 flex justify-between items-start text-xs">
                <div className="max-w-[240px] text-[10px] text-slate-500">
                  <div className="font-semibold text-slate-700">Terms & Conditions:</div>
                  <p>{settings.termsConditions}</p>
                </div>
                <div className="w-48 space-y-1 text-right font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{sale.subtotal}</span>
                  </div>
                  {sale.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-₹{sale.discountTotal}</span>
                    </div>
                  )}
                  {sale.isGstInvoice && sale.taxTotal > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>GST:</span>
                      <span>₹{sale.taxTotal}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                    <span>Grand Total:</span>
                    <span>₹{sale.grandTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-0.5">
                    <span>Paid Amount:</span>
                    <span>₹{sale.cashReceived}</span>
                  </div>
                  {sale.balanceDue > 0 && (
                    <div className="flex justify-between text-red-600 font-bold">
                      <span>Balance Due:</span>
                      <span>₹{sale.balanceDue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
                <div>Customer Signature</div>
                <div className="text-right">
                  <div className="font-bold text-slate-800 uppercase">{settings.storeName}</div>
                  <div className="mt-6 border-t border-slate-400 inline-block px-4">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
