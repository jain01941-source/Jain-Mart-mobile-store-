/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { db, defaultSettings } from './services/db';
import {
  Product,
  Sale,
  Purchase,
  Customer,
  Supplier,
  Expense,
  ReturnRecord,
  CustomerPaymentRecord,
  StoreSettings,
  Language,
} from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PinLockModal } from './components/PinLockModal';
import { InvoiceModal } from './components/InvoiceModal';

// Views
import { DashboardView } from './views/DashboardView';
import { BillingView } from './views/BillingView';
import { ProductsView } from './views/ProductsView';
import { PurchasesView } from './views/PurchasesView';
import { CustomersView } from './views/CustomersView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { ReturnsView } from './views/ReturnsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [settings, setSettings] = useState<StoreSettings>(() => db.getSettings());
  const [language, setLanguage] = useState<Language>(() => settings.defaultLanguage || 'hi');
  const [isLocked, setIsLocked] = useState<boolean>(() => settings.enablePin);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPaymentRecord[]>([]);

  // Selected Sale for Invoice Modal popup
  const [activeInvoiceSale, setActiveInvoiceSale] = useState<Sale | null>(null);

  const refreshAllData = useCallback(() => {
    setProducts(db.getProducts());
    setSales(db.getSales());
    setPurchases(db.getPurchases());
    setCustomers(db.getCustomers());
    setSuppliers(db.getSuppliers());
    setExpenses(db.getExpenses());
    setReturns(db.getReturns());
    setCustomerPayments(db.getCustomerPayments());
    const curSettings = db.getSettings();
    setSettings(curSettings);
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const handleSaleCompleted = (newSale: Sale) => {
    refreshAllData();
    setActiveInvoiceSale(newSale);
  };

  const dashboardMetrics = db.getDashboardMetrics();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Security PIN Lock */}
      <PinLockModal
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        correctPin={settings.securityPin || '1234'}
        storeName={language === 'hi' ? settings.storeNameHi : settings.storeName}
        language={language}
      />

      {/* Top Header Bar */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        settings={settings}
        onLockApp={() => setIsLocked(true)}
        lowStockCount={dashboardMetrics.lowStockCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {currentView === 'dashboard' && (
          <DashboardView
            metrics={dashboardMetrics}
            onNavigate={setCurrentView}
            onSelectSale={(s) => setActiveInvoiceSale(s)}
            language={language}
          />
        )}

        {currentView === 'billing' && (
          <BillingView
            products={products}
            customers={customers}
            settings={settings}
            language={language}
            onSaleCompleted={handleSaleCompleted}
          />
        )}

        {currentView === 'products' && (
          <ProductsView
            products={products}
            onRefresh={refreshAllData}
            language={language}
          />
        )}

        {currentView === 'purchases' && (
          <PurchasesView
            purchases={purchases}
            suppliers={suppliers}
            products={products}
            onRefresh={refreshAllData}
            language={language}
          />
        )}

        {currentView === 'customers' && (
          <CustomersView
            customers={customers}
            sales={sales}
            payments={customerPayments}
            settings={settings}
            onRefresh={refreshAllData}
            language={language}
          />
        )}

        {currentView === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            onRefresh={refreshAllData}
            language={language}
          />
        )}

        {currentView === 'reports' && (
          <ReportsView
            sales={sales}
            expenses={expenses}
            products={products}
            customers={customers}
            suppliers={suppliers}
            language={language}
          />
        )}

        {currentView === 'returns' && (
          <ReturnsView
            returns={returns}
            sales={sales}
            onRefresh={refreshAllData}
            language={language}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              db.saveSettings(newSettings);
            }}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            products={products}
            sales={sales}
            expenses={expenses}
            customers={customers}
            onRefresh={refreshAllData}
          />
        )}
      </main>

      {/* Mobile Thumb-Zone Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        language={language}
      />

      {/* Invoice & Receipt Modal */}
      <InvoiceModal
        sale={activeInvoiceSale}
        onClose={() => setActiveInvoiceSale(null)}
        settings={settings}
        language={language}
      />
    </div>
  );
}
