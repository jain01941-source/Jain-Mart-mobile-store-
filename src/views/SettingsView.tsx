import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Building,
  Printer,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { StoreSettings, Language, Customer, Expense, Sale, Product } from '../types';
import { db } from '../services/db';
import { exportToCSV } from '../utils/formatters';

interface SettingsViewProps {
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  language: Language;
  onToggleLanguage: () => void;
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  language,
  onToggleLanguage,
  products,
  sales,
  expenses,
  customers,
  onRefresh,
}) => {
  const isHindi = language === 'hi';

  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeNameHi, setStoreNameHi] = useState(settings.storeNameHi);
  const [phone, setPhone] = useState(settings.phone);
  const [secondaryPhone, setSecondaryPhone] = useState(settings.secondaryPhone || '');
  const [address, setAddress] = useState(settings.address);
  const [gstin, setGstin] = useState(settings.gstin);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [enablePin, setEnablePin] = useState(settings.enablePin);
  const [securityPin, setSecurityPin] = useState(settings.securityPin);
  const [printerWidth, setPrinterWidth] = useState<'58mm' | '80mm'>(settings.thermalPrinterWidth);
  const [terms, setTerms] = useState(settings.termsConditions);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      ...settings,
      storeName,
      storeNameHi,
      phone,
      secondaryPhone,
      address,
      gstin,
      invoicePrefix,
      enablePin,
      securityPin,
      thermalPrinterWidth: printerWidth,
      termsConditions: terms,
    };
    onUpdateSettings(updated);
    db.saveSettings(updated);
    setSaveMessage(isHindi ? 'सेटिंग्स सफलतापूर्वक सुरक्षित हो गईं!' : 'Settings saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = db.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jain_Mart_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupNotice(isHindi ? 'बैकअप फाइल सफलतापूर्वक डाउनलोड हो गई!' : 'Backup downloaded successfully!');
    setTimeout(() => setBackupNotice(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = db.restoreDatabaseJSON(text);
        if (success) {
          setBackupNotice(isHindi ? 'डाटा सफलतापूर्वक रीस्टोर हो गया!' : 'Data restored successfully!');
          onRefresh();
        } else {
          alert('Invalid backup file format');
        }
      } catch {
        alert('Could not parse backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    if (
      confirm(
        isHindi
          ? 'क्या आप जैन मार्ट मोबाइल स्टोर का मूल सैंपल डेटा रीसेट करना चाहते हैं?'
          : 'Reset to original Jain Mart Mobile Store sample data?'
      )
    ) {
      db.resetToSampleData();
      onRefresh();
      setBackupNotice(isHindi ? 'सैंपल डेटा रीसेट हो गया!' : 'Sample data reset successfully!');
      setTimeout(() => setBackupNotice(null), 3000);
    }
  };

  const handleExportCustomersCSV = () => {
    const rows = customers.map((c) => ({
      CustomerName: c.name,
      Phone: c.phone,
      Address: c.address || '',
      TotalPurchases: c.totalPurchases,
      TotalPaid: c.totalPaid,
      OutstandingCredit: c.outstandingCredit,
      CreatedDate: c.createdDate,
    }));
    exportToCSV(rows, 'Jain_Mart_Customer_Ledger');
  };

  const handleExportExpensesCSV = () => {
    const rows = expenses.map((e) => ({
      Title: e.title,
      Category: e.category,
      Amount: e.amount,
      Date: e.date,
      PaymentMode: e.paymentMode,
    }));
    exportToCSV(rows, 'Jain_Mart_Expenses_Report');
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-10 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {isHindi ? 'दुकान सेटिंग्स व डेटा बैकअप' : 'Store Settings & Data Security'}
        </h2>
        <p className="text-xs text-slate-400">
          {isHindi
            ? 'दुकान का पता, फोन, 4-अंकीय PIN सुरक्षा, थर्मल प्रिंटर व पूरा बैकअप'
            : 'Configure business profile, 4-digit PIN security, thermal rolls, and cloud backup'}
        </p>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {backupNotice && (
        <div className="p-3 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Store Profile Form */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Building className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            {isHindi ? 'दुकान का विवरण (Store Profile)' : 'Business Profile & Invoicing'}
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">
                {isHindi ? 'दुकान का नाम (English) *' : 'Business Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">
                {isHindi ? 'दुकान का नाम (हिन्दी)' : 'Store Name (Hindi)'}
              </label>
              <input
                type="text"
                value={storeNameHi}
                onChange={(e) => setStoreNameHi(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">
                {isHindi ? 'प्राथमिक मोबाइल नंबर *' : 'Primary Phone *'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">
                {isHindi ? 'द्वितीयक मोबाइल / हेल्पलाइन' : 'Secondary Phone'}
              </label>
              <input
                type="text"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 block mb-1">
                {isHindi ? 'दुकान का पूरा पता *' : 'Store Address *'}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">GSTIN</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">
                {isHindi ? 'बिल नंबर प्रीफिक्स' : 'Invoice Prefix'}
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 block mb-1">
                {isHindi ? 'बिल पर नियम व शर्तें (Terms & Conditions)' : 'Terms & Conditions (On Invoice)'}
              </label>
              <textarea
                rows={2}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
            >
              {isHindi ? 'प्रोफाइल सेव करें' : 'Save Store Details'}
            </button>
          </div>
        </form>
      </div>

      {/* Hardware & Language Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Thermal Printer Settings */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isHindi ? 'ब्लूटूथ थर्मल प्रिंटर' : 'Bluetooth Thermal Printer'}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {isHindi ? 'रसीद पेपर का रोल आकार चुनें:' : 'Select receipt paper roll width:'}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPrinterWidth('58mm')}
              className={`p-3 rounded-xl border text-center font-semibold transition-colors ${
                printerWidth === '58mm'
                  ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-sm font-bold">58mm Roll</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Pocket Handheld</div>
            </button>

            <button
              type="button"
              onClick={() => setPrinterWidth('80mm')}
              className={`p-3 rounded-xl border text-center font-semibold transition-colors ${
                printerWidth === '80mm'
                  ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="text-sm font-bold">80mm Roll</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Counter Desktop POS</div>
            </button>
          </div>
        </div>

        {/* Security PIN Lock */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {isHindi ? 'सुरक्षा PIN लॉक' : 'Security PIN Protection'}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {isHindi
              ? 'दुकान का डेटा सुरक्षित रखने के लिए 4-अंकीय PIN अनिवार्य करें'
              : 'Require 4-digit PIN lock when opening the mobile shop app'}
          </p>

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={enablePin}
                onChange={(e) => setEnablePin(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span className="text-slate-200 font-medium">
                {isHindi ? 'ऐप खोलने पर PIN अनिवार्य करें' : 'Enable PIN Lock on Startup'}
              </span>
            </label>

            {enablePin && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">4-Digit PIN:</span>
                <input
                  type="password"
                  maxLength={4}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value.replace(/\D/g, ''))}
                  className="w-24 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-center font-mono text-white tracking-widest text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Backup, Cloud & Restore Section */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            {isHindi ? 'डाटा बैकअप व सुरक्षा (Backup & Restore)' : 'Database Backup & Restore'}
          </h3>
        </div>

        <p className="text-xs text-slate-400">
          {isHindi
            ? 'अपना पूरा व्यापारिक डेटा (स्टॉक, बिल, ग्राहक, खर्चे) सुरक्षित रखें ताकि फोन बदलने या खोने पर भी डेटा सुरक्षित रहे।'
            : 'Export and download complete database JSON backup or restore data on any device without loss.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Download JSON Backup */}
          <button
            onClick={handleDownloadBackup}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-colors flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isHindi ? 'पूरा JSON बैकअप' : 'Download Backup'}
              </div>
              <div className="text-[10px] text-slate-500">Save full data to device</div>
            </div>
          </button>

          {/* Upload Restore */}
          <label className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-colors flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isHindi ? 'डाटा रीस्टोर करें' : 'Restore from File'}
              </div>
              <div className="text-[10px] text-slate-500">Upload saved backup JSON</div>
            </div>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Reset to Sample */}
          <button
            onClick={handleResetSampleData}
            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-colors flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {isHindi ? 'सैंपल डेटा रीसेट' : 'Reset Sample Data'}
              </div>
              <div className="text-[10px] text-slate-500">Load fresh store demo data</div>
            </div>
          </button>
        </div>

        {/* CSV Export Strip */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isHindi ? 'एक्सेल / CSV रिपोर्ट्स डाउनलोड करें:' : 'Direct Excel / CSV Exports:'}
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={handleExportCustomersCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHindi ? 'ग्राहक खाता CSV' : 'Customers Ledger CSV'}</span>
            </button>
            <button
              onClick={handleExportExpensesCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-400" />
              <span>{isHindi ? 'दुकान खर्च CSV' : 'Expenses CSV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
