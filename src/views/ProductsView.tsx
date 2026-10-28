import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Smartphone,
  Edit2,
  Trash2,
  Barcode,
  Package,
  Layers,
  CheckCircle2,
  Printer,
  X,
  PlusCircle,
  Tag,
} from 'lucide-react';
import { Product, ProductCategory, Language } from '../types';
import { db } from '../services/db';
import { formatINR, generateBarcode } from '../utils/formatters';
import { categoryLabels } from '../utils/translations';

interface ProductsViewProps {
  products: Product[];
  onRefresh: () => void;
  language: Language;
}

const ALL_CATEGORIES: ProductCategory[] = [
  'Smartphones',
  'Chargers',
  'USB Cables',
  'Earphones',
  'Bluetooth Headphones',
  'Speakers',
  'Power Banks',
  'Mobile Covers',
  'Tempered Glass',
  'Memory Cards',
  'SIM Accessories',
  'Other Accessories',
];

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onRefresh,
  language,
}) => {
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Smartphones');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formStockQty, setFormStockQty] = useState<number>(1);
  const [formMinStockAlert, setFormMinStockAlert] = useState<number>(2);
  const [formBarcode, setFormBarcode] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formSupplier, setFormSupplier] = useState('');

  // Smartphone specifics
  const [isSmartphone, setIsSmartphone] = useState(false);
  const [smartphoneModel, setSmartphoneModel] = useState('');
  const [smartphoneColor, setSmartphoneColor] = useState('');
  const [smartphoneStorage, setSmartphoneStorage] = useState('8GB RAM + 128GB ROM');
  const [smartphoneWarranty, setSmartphoneWarranty] = useState('1 Year Brand Warranty');
  const [rawImeis, setRawImeis] = useState('');

  // Barcode Label Print Modal State
  const [printLabelProduct, setPrintLabelProduct] = useState<Product | null>(null);

  // IMEI details inspection modal
  const [inspectImeiProduct, setInspectImeiProduct] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesLowStock = !lowStockOnly || p.stockQuantity <= p.minStockAlert;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory && matchesLowStock;

      const matchesQuery =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.smartphoneDetails?.imeiList.some((imei) => imei.includes(q)));

      return matchesCategory && matchesLowStock && matchesQuery;
    });
  }, [products, searchQuery, selectedCategory, lowStockOnly]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormBrand('');
    setFormCategory('Smartphones');
    setFormPurchasePrice(12000);
    setFormSellingPrice(14999);
    setFormStockQty(1);
    setFormMinStockAlert(2);
    setFormBarcode(generateBarcode());
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormSupplier('Arihant Telecom Wholesalers');
    setIsSmartphone(true);
    setSmartphoneModel('');
    setSmartphoneColor('Midnight Black');
    setSmartphoneStorage('8GB / 128GB');
    setSmartphoneWarranty('1 Year Brand Warranty');
    setRawImeis(`86420194${Math.floor(1000000 + Math.random() * 9000000)}`);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormCategory(p.category);
    setFormPurchasePrice(p.purchasePrice);
    setFormSellingPrice(p.sellingPrice);
    setFormStockQty(p.stockQuantity);
    setFormMinStockAlert(p.minStockAlert);
    setFormBarcode(p.barcode);
    setFormSku(p.sku);
    setFormSupplier(p.supplierName);
    setIsSmartphone(!!p.isSmartphone);
    if (p.smartphoneDetails) {
      setSmartphoneModel(p.smartphoneDetails.model);
      setSmartphoneColor(p.smartphoneDetails.color);
      setSmartphoneStorage(p.smartphoneDetails.storage);
      setSmartphoneWarranty(p.smartphoneDetails.warranty);
      setRawImeis(p.smartphoneDetails.imeiList.join('\n'));
    } else {
      setSmartphoneModel('');
      setSmartphoneColor('');
      setSmartphoneStorage('');
      setSmartphoneWarranty('1 Year Brand Warranty');
      setRawImeis('');
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    let parsedImeis: string[] = [];
    if (isSmartphone) {
      parsedImeis = rawImeis
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    const today = new Date().toISOString().slice(0, 10);

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formName,
        brand: formBrand,
        category: formCategory,
        purchasePrice: Number(formPurchasePrice) || 0,
        sellingPrice: Number(formSellingPrice) || 0,
        stockQuantity: isSmartphone ? parsedImeis.length : Number(formStockQty) || 0,
        minStockAlert: Number(formMinStockAlert) || 2,
        barcode: formBarcode || editingProduct.barcode,
        sku: formSku || editingProduct.sku,
        supplierName: formSupplier,
        isSmartphone,
        smartphoneDetails: isSmartphone
          ? {
              model: smartphoneModel || formName,
              color: smartphoneColor,
              storage: smartphoneStorage,
              warranty: smartphoneWarranty,
              imeiList: parsedImeis,
              soldImeis: editingProduct.smartphoneDetails?.soldImeis || [],
            }
          : undefined,
      };
      db.updateProduct(updated);
    } else {
      db.addProduct({
        name: formName,
        brand: formBrand,
        category: formCategory,
        purchasePrice: Number(formPurchasePrice) || 0,
        sellingPrice: Number(formSellingPrice) || 0,
        stockQuantity: isSmartphone ? parsedImeis.length : Number(formStockQty) || 0,
        minStockAlert: Number(formMinStockAlert) || 2,
        barcode: formBarcode || generateBarcode(),
        sku: formSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        supplierName: formSupplier,
        purchaseDate: today,
        isSmartphone,
        smartphoneDetails: isSmartphone
          ? {
              model: smartphoneModel || formName,
              color: smartphoneColor,
              storage: smartphoneStorage,
              warranty: smartphoneWarranty,
              imeiList: parsedImeis,
              soldImeis: [],
            }
          : undefined,
      });
    }

    setIsModalOpen(false);
    onRefresh();
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(isHindi ? `क्या आप निश्चित हैं कि "${name}" को हटाना चाहते हैं?` : `Delete product "${name}"?`)) {
      db.deleteProduct(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-10">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isHindi ? 'स्टॉक व इन्वेंट्री मैनेजमेंट' : 'Inventory & Stock Management'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi
              ? 'स्मार्टफोन IMEI ट्रैकिंग, चार्जर, केबल व सभी मोबाइल एक्सेसरीज़'
              : 'Real-time stock quantities, individual phone IMEIs, cost and retail rates'}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? 'नया प्रोडक्ट जोड़ें' : 'Add New Product'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHindi ? 'प्रोडक्ट नाम, ब्रांड, बारकोड या IMEI से खोजें...' : 'Search by name, brand, barcode or IMEI...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="All">{isHindi ? 'सभी श्रेणियां (All Categories)' : 'All Categories'}</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {isHindi ? categoryLabels[cat]?.hi : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center">
          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
              lowStockOnly
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isHindi ? 'कम स्टॉक' : 'Low Stock'}</span>
          </button>
        </div>
      </div>

      {/* Product Items Table / Cards */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>
            {isHindi ? 'कुल दिखाए गए प्रोडक्ट्स:' : 'Showing Products:'}{' '}
            <strong className="text-white font-mono">{filteredProducts.length}</strong>
          </span>
          <span className="text-[11px] font-mono">
            {isHindi ? 'जैन मार्ट इन्वेंट्री' : 'Jain Mart Inventory'}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredProducts.map((p) => {
            const isLow = p.stockQuantity <= p.minStockAlert;
            const margin = p.sellingPrice - p.purchasePrice;
            const marginPct = Math.round((margin / p.sellingPrice) * 100);

            return (
              <div
                key={p.id}
                className="p-4 hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Product Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {p.name}
                    </span>
                    {p.isSmartphone && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-semibold flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>IMEI Tracked</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">{p.brand}</span>
                    <span>·</span>
                    <span className="text-slate-400">
                      {isHindi ? categoryLabels[p.category]?.hi : p.category}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-slate-500">BC: {p.barcode}</span>
                    <span>·</span>
                    <span className="text-slate-500">{p.supplierName}</span>
                  </div>

                  {/* Smartphone details pill preview */}
                  {p.isSmartphone && p.smartphoneDetails && (
                    <div className="pt-1 flex items-center gap-2 text-xs">
                      <button
                        onClick={() => setInspectImeiProduct(p)}
                        className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>
                          {p.smartphoneDetails.imeiList.length} {isHindi ? 'सक्रिय IMEI मौजूद (देखें)' : 'Active IMEIs (View)'}
                        </span>
                      </button>
                      {p.smartphoneDetails.soldImeis.length > 0 && (
                        <span className="text-slate-500 text-[11px]">
                          ({p.smartphoneDetails.soldImeis.length} {isHindi ? 'बिक चुके हैं' : 'sold'})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Pricing, Stock & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {/* Financials */}
                  <div className="text-right">
                    <div className="text-sm font-black text-white font-mono tabular-nums">
                      ₹{p.sellingPrice}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isHindi ? 'लागत:' : 'Cost:'} ₹{p.purchasePrice} ·{' '}
                      <span className="text-emerald-400 font-medium">+{marginPct}%</span>
                    </div>
                  </div>

                  {/* Stock count */}
                  <div className="text-center min-w-[70px]">
                    <div
                      className={`text-sm font-bold font-mono px-2 py-0.5 rounded-lg inline-block ${
                        p.stockQuantity === 0
                          ? 'bg-rose-500/10 text-rose-400'
                          : isLow
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {p.stockQuantity} {isHindi ? 'पीस' : 'pcs'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Min: {p.minStockAlert}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPrintLabelProduct(p)}
                      title="Print Barcode Label"
                      className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Barcode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      title="Edit Product"
                      className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      title="Delete Product"
                      className="p-2 rounded-lg bg-slate-850 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingProduct
                  ? isHindi
                    ? 'प्रोडक्ट विवरण बदलें'
                    : 'Edit Product Details'
                  : isHindi
                  ? 'नया प्रोडक्ट जोड़ें'
                  : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {isHindi ? 'प्रोडक्ट का नाम *' : 'Product Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Redmi Note 13 5G or 65W Fast Charger"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {isHindi ? 'ब्रांड (Brand)' : 'Brand'}
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. Samsung, Apple, Realme, Boat"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {isHindi ? 'श्रेणी (Category)' : 'Category'}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      setFormCategory(cat);
                      if (cat === 'Smartphones') setIsSmartphone(true);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {isHindi ? 'खरीद मूल्य / लागत (₹) *' : 'Purchase Price / Cost (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={formPurchasePrice || ''}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {isHindi ? 'बिक्री मूल्य (₹) *' : 'Selling Price (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={formSellingPrice || ''}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {!isSmartphone && (
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      {isHindi ? 'उपलब्ध स्टॉक मात्रा' : 'Available Stock Qty'}
                    </label>
                    <input
                      type="number"
                      value={formStockQty}
                      onChange={(e) => setFormStockQty(Number(e.target.value))}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {isHindi ? 'न्यूनतम स्टॉक चेतावनी' : 'Min Stock Alert'}
                  </label>
                  <input
                    type="number"
                    value={formMinStockAlert}
                    onChange={(e) => setFormMinStockAlert(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {isHindi ? 'बारकोड / SKU' : 'Barcode / SKU'}
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                      placeholder="e.g. 890123450001"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setFormBarcode(generateBarcode())}
                      className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 shrink-0"
                      title="Generate new barcode"
                    >
                      Gen
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    {isHindi ? 'सप्लायर / होलसेलर' : 'Supplier Name'}
                  </label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="e.g. Arihant Wholesalers"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Smartphone Toggle & IMEI Section */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={isSmartphone}
                    onChange={(e) => setIsSmartphone(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isHindi
                        ? 'यह एक स्मार्टफोन है (यूनिक 15-अंकीय IMEI नंबर ट्रैक करें)'
                        : 'This is a Smartphone (Track unique 15-digit IMEIs)'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isHindi
                        ? 'प्रत्येक फोन का अलग IMEI बिल पर प्रिंट होगा और वारंटी ट्रैक होगी।'
                        : 'Each phone device will be tracked individually with warranty on bill.'}
                    </span>
                  </div>
                </label>

                {isSmartphone && (
                  <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">रंग (Color)</label>
                        <input
                          type="text"
                          value={smartphoneColor}
                          onChange={(e) => setSmartphoneColor(e.target.value)}
                          placeholder="e.g. Black, Blue"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">स्टोरेज (RAM/ROM)</label>
                        <input
                          type="text"
                          value={smartphoneStorage}
                          onChange={(e) => setSmartphoneStorage(e.target.value)}
                          placeholder="e.g. 8GB/128GB"
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        {isHindi
                          ? '15-अंकीय IMEI नंबर दर्ज करें (प्रत्येक लाइन या कॉमा से अलग):'
                          : 'Enter 15-digit IMEIs (one per line or comma-separated):'}
                      </label>
                      <textarea
                        rows={3}
                        value={rawImeis}
                        onChange={(e) => setRawImeis(e.target.value)}
                        placeholder="864201941234561&#10;864201941234562"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500">
                        {isHindi
                          ? 'स्टॉक मात्रा सीधे दर्ज किए गए IMEI की संख्या से निर्धारित होगी।'
                          : 'Stock quantity is automatically calculated from IMEI count.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20"
                >
                  {isHindi ? 'सेव करें' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Label Print Modal */}
      {printLabelProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-center">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white">
                {isHindi ? 'बारकोड स्टिकर लेबल' : 'Barcode Shelf Label'}
              </span>
              <button
                onClick={() => setPrintLabelProduct(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sticker Preview */}
            <div className="bg-white text-black p-4 rounded-xl border border-dashed border-gray-400 font-mono text-xs space-y-1">
              <div className="font-bold text-sm tracking-tight">JAIN MART MOBILE</div>
              <div className="text-[11px] font-semibold">{printLabelProduct.name}</div>
              <div className="py-2 flex flex-col items-center justify-center">
                {/* Visual Barcode bars */}
                <div className="h-10 flex items-center gap-[2px] justify-center px-4">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 3, 4, 2, 1, 3].map(
                    (w, i) => (
                      <div
                        key={i}
                        className="bg-black h-full"
                        style={{ width: `${w}px` }}
                      />
                    )
                  )}
                </div>
                <div className="text-xs tracking-widest font-bold mt-1">
                  {printLabelProduct.barcode}
                </div>
              </div>
              <div className="text-base font-black text-black">
                MRP: ₹{printLabelProduct.sellingPrice}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{isHindi ? 'लेबल प्रिंट करें' : 'Print Label'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect IMEI list modal */}
      {inspectImeiProduct && inspectImeiProduct.smartphoneDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {inspectImeiProduct.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {isHindi ? 'IMEI ट्रैकिंग रिकॉर्ड' : 'IMEI Tracking Record'}
                </p>
              </div>
              <button
                onClick={() => setInspectImeiProduct(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {isHindi ? 'स्टॉक में मौजूद (Unsold):' : 'Available in Stock (Unsold):'}
                  </span>
                </div>
                {inspectImeiProduct.smartphoneDetails.imeiList.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    {isHindi ? 'कोई एक्टिव IMEI नहीं है (स्टॉक खत्म)' : 'No unsold IMEIs.'}
                  </p>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {inspectImeiProduct.smartphoneDetails.imeiList.map((imei) => (
                      <div
                        key={imei}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-white"
                      >
                        {imei}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {inspectImeiProduct.smartphoneDetails.soldImeis.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">
                    {isHindi ? 'बिके हुए डिवाइस (Sold History):' : 'Sold Device History:'}
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {inspectImeiProduct.smartphoneDetails.soldImeis.map((sold, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono space-y-0.5"
                      >
                        <div className="text-white font-bold">{sold.imei}</div>
                        <div className="text-slate-400">
                          {sold.customerName} · Bill: {sold.invoiceNumber} ({sold.date})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
