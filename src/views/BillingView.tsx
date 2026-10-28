import React, { useState, useMemo } from 'react';
import {
  Search,
  Camera,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  IndianRupee,
  Share2,
  Printer,
  Smartphone,
  Tag,
  CreditCard,
  User,
  Phone,
  AlertCircle,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Product,
  SaleItem,
  PaymentMethod,
  SplitPaymentDetails,
  Customer,
  StoreSettings,
  Language,
  Sale,
} from '../types';
import { db } from '../services/db';
import { formatINR } from '../utils/formatters';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';

interface BillingViewProps {
  products: Product[];
  customers: Customer[];
  settings: StoreSettings;
  language: Language;
  onSaleCompleted: (sale: Sale) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  products,
  customers,
  settings,
  language,
  onSaleCompleted,
}) => {
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();

  // Billing calculation controls
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [isGstInvoice, setIsGstInvoice] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [splitDetails, setSplitDetails] = useState<SplitPaymentDetails>({
    cash: 0,
    upi: 0,
    card: 0,
    credit: 0,
  });
  const [billNotes, setBillNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // IMEI selection modal state
  const [pendingImeiProduct, setPendingImeiProduct] = useState<Product | null>(null);
  const [selectedImei, setSelectedImei] = useState<string>('');

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.smartphoneDetails?.imeiList.some((imei) => imei.includes(q)));

      return matchesCategory && matchesQuery;
    });
  }, [products, searchQuery, selectedCategory]);

  // Customer suggestions
  const customerSuggestions = useMemo(() => {
    if (customerPhone.trim().length >= 3) {
      return customers.filter(
        (c) => c.phone.includes(customerPhone.trim()) || c.name.toLowerCase().includes(customerPhone.toLowerCase())
      );
    }
    return [];
  }, [customers, customerPhone]);

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  }, [cart]);

  const itemDiscounts = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.discount * item.quantity, 0);
  }, [cart]);

  const totalDiscount = itemDiscounts + (overallDiscount || 0);

  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxTotal = isGstInvoice ? Math.round(taxableAmount * 0.18) : 0;
  const grandTotal = taxableAmount + taxTotal;

  // Total cost price for calculating profit
  const totalCost = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0);
  }, [cart]);

  const estimatedProfit = Math.max(0, grandTotal - totalCost);

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      setErrorMessage(
        isHindi
          ? `माफ़ करें, ${product.name} स्टॉक में उपलब्ध नहीं है!`
          : `Sorry, ${product.name} is currently out of stock!`
      );
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    // If it's a smartphone, prompt for IMEI selection
    if (product.isSmartphone && product.smartphoneDetails && product.smartphoneDetails.imeiList.length > 0) {
      setPendingImeiProduct(product);
      setSelectedImei(product.smartphoneDetails.imeiList[0]);
      return;
    }

    // Normal accessory product
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setErrorMessage(isHindi ? 'स्टॉक सीमा पार हो गई है!' : 'Cannot add more than available stock!');
          setTimeout(() => setErrorMessage(null), 3000);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.sellingPrice - item.discount) * (item.quantity + 1),
              }
            : item
        );
      } else {
        const newItem: SaleItem = {
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          quantity: 1,
          sellingPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          discount: 0,
          gstRate: isGstInvoice ? 18 : 0,
          total: product.sellingPrice,
        };
        return [...prev, newItem];
      }
    });
  };

  const handleConfirmImei = () => {
    if (!pendingImeiProduct || !selectedImei) return;

    const newItem: SaleItem = {
      productId: pendingImeiProduct.id,
      productName: pendingImeiProduct.name,
      brand: pendingImeiProduct.brand,
      category: pendingImeiProduct.category,
      quantity: 1,
      sellingPrice: pendingImeiProduct.sellingPrice,
      purchasePrice: pendingImeiProduct.purchasePrice,
      discount: 0,
      gstRate: isGstInvoice ? 18 : 0,
      selectedImei,
      total: pendingImeiProduct.sellingPrice,
    };

    setCart((prev) => [...prev, newItem]);
    setPendingImeiProduct(null);
    setSelectedImei('');
  };

  // Update item quantity
  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const item = cart[index];
    const product = products.find((p) => p.id === item.productId);
    if (product && newQty > product.stockQuantity) {
      setErrorMessage(isHindi ? 'स्टॉक में पर्याप्त मात्रा नहीं है!' : 'Insufficient stock in shop!');
      setTimeout(() => setErrorMessage(null), 2500);
      return;
    }

    setCart((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        quantity: newQty,
        total: (copy[index].sellingPrice - copy[index].discount) * newQty,
      };
      return copy;
    });
  };

  // Update custom selling price (bargain / negotiated rate)
  const handleUpdatePrice = (index: number, newPrice: number) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        sellingPrice: newPrice,
        total: (newPrice - copy[index].discount) * copy[index].quantity,
      };
      return copy;
    });
  };

  // Update line item discount
  const handleUpdateDiscount = (index: number, discountAmount: number) => {
    setCart((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        discount: discountAmount,
        total: (copy[index].sellingPrice - discountAmount) * copy[index].quantity,
      };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Barcode detection handler
  const handleBarcodeScanned = (code: string) => {
    const trimmed = code.trim();
    // 1. Match by exact barcode or SKU
    let product = products.find(
      (p) => p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase()
    );

    // 2. If not found, match by smartphone IMEI
    if (!product) {
      product = products.find((p) =>
        p.smartphoneDetails?.imeiList.includes(trimmed)
      );
      if (product) {
        // Direct IMEI match!
        const newItem: SaleItem = {
          productId: product.id,
          productName: product.name,
          brand: product.brand,
          category: product.category,
          quantity: 1,
          sellingPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          discount: 0,
          gstRate: isGstInvoice ? 18 : 0,
          selectedImei: trimmed,
          total: product.sellingPrice,
        };
        setCart((prev) => [...prev, newItem]);
        return;
      }
    }

    if (product) {
      handleAddToCart(product);
    } else {
      setErrorMessage(
        isHindi
          ? `कोड "${trimmed}" से कोई प्रोडक्ट नहीं मिला!`
          : `No product found matching code "${trimmed}"`
      );
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  // Finalize Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      setErrorMessage(isHindi ? 'कृपया बिल में कम से कम एक सामान जोड़ें!' : 'Cart is empty! Add items first.');
      return;
    }

    // Split validation
    let cashReceived = grandTotal;
    let balanceDue = 0;

    if (paymentMethod === 'Credit') {
      if (!customerPhone.trim()) {
        setErrorMessage(
          isHindi
            ? 'उधार (Credit) बिक्री के लिए ग्राहक का मोबाइल नंबर अनिवार्य है!'
            : 'Customer mobile number is required for Credit / Udhar sales!'
        );
        return;
      }
      cashReceived = 0;
      balanceDue = grandTotal;
    } else if (paymentMethod === 'Split') {
      const splitTotal =
        (Number(splitDetails.cash) || 0) +
        (Number(splitDetails.upi) || 0) +
        (Number(splitDetails.card) || 0) +
        (Number(splitDetails.credit) || 0);

      if (splitTotal !== grandTotal) {
        setErrorMessage(
          isHindi
            ? `विभाजित राशि (₹${splitTotal}) कुल बिल राशि (₹${grandTotal}) के बराबर होनी चाहिए!`
            : `Split total (₹${splitTotal}) must match Grand Total (₹${grandTotal})!`
        );
        return;
      }
      cashReceived = (Number(splitDetails.cash) || 0) + (Number(splitDetails.upi) || 0) + (Number(splitDetails.card) || 0);
      balanceDue = Number(splitDetails.credit) || 0;

      if (balanceDue > 0 && !customerPhone.trim()) {
        setErrorMessage(
          isHindi
            ? 'उधार हिस्से के लिए ग्राहक का फोन नंबर दर्ज करना अनिवार्य है!'
            : 'Customer phone number is required when credit is included in split!'
        );
        return;
      }
    }

    // Create the sale
    const createdSale = db.createSale({
      customerId: selectedCustomerId,
      customerName: customerName.trim() || (isHindi ? 'ग्राहक (Retail)' : 'Retail Customer'),
      customerPhone: customerPhone.trim(),
      items: cart,
      subtotal,
      discountTotal: totalDiscount,
      taxTotal,
      grandTotal,
      totalCost,
      profit: estimatedProfit,
      paymentMethod,
      splitDetails: paymentMethod === 'Split' ? splitDetails : undefined,
      cashReceived,
      balanceDue,
      status: 'completed',
      isGstInvoice,
      notes: billNotes,
    });

    // Confetti celebration
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch {
      // ignore
    }

    // Reset Billing state
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCustomerId(undefined);
    setOverallDiscount(0);
    setBillNotes('');
    setPaymentMethod('Cash');

    // Callback to open invoice modal
    onSaleCompleted(createdSale);
  };

  const categories = [
    'All',
    'Smartphones',
    'Chargers',
    'USB Cables',
    'Bluetooth Headphones',
    'Power Banks',
    'Tempered Glass',
    'Mobile Covers',
    'Earphones',
    'Speakers',
    'Memory Cards',
  ];

  return (
    <div className="space-y-4 pb-24 lg:pb-10">
      {/* Top Title & Scanner Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isHindi ? 'फास्ट बिलिंग काउंटर' : 'Quick POS & Billing'}
          </h2>
          <p className="text-xs text-slate-400">
            {isHindi
              ? 'बारकोड स्कैन करें या कैटलॉग से चुनें, त्वरित इनवॉइस व रसीद बनाएं'
              : 'Scan barcode, select items, apply discount, and generate instant invoice'}
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>{isHindi ? 'कैमरा स्कैनर खोलें' : 'Open Camera Barcode Scanner'}</span>
        </button>
      </div>

      {/* Error alert banner */}
      {errorMessage && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Billing Grid: Left (Catalog) + Right (Current Bill Cart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Product Catalog (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? 'प्रोडक्ट नाम, बारकोड, SKU या IMEI से खोजें...' : 'Search product, barcode or IMEI...'}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Products List / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const inStock = p.stockQuantity > 0;
              const isLow = p.stockQuantity <= p.minStockAlert;
              return (
                <button
                  key={p.id}
                  onClick={() => handleAddToCart(p)}
                  disabled={!inStock}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between group ${
                    !inStock
                      ? 'opacity-40 bg-slate-900/50 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-emerald-500/40 active:scale-[0.99]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {p.name}
                      </span>
                      {p.isSmartphone && (
                        <span className="shrink-0 p-1 rounded bg-blue-500/10 text-blue-400">
                          <Smartphone className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>{p.brand}</span>
                      <span>·</span>
                      <span className="font-mono text-[10px] text-slate-500">{p.sku}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-white font-mono tabular-nums">
                        ₹{p.sellingPrice}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {isHindi ? 'लागत:' : 'Cost:'} ₹{p.purchasePrice}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          !inStock
                            ? 'bg-rose-500/10 text-rose-400'
                            : isLow
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        {inStock ? `${p.stockQuantity} ${isHindi ? 'स्टॉक' : 'in stock'}` : isHindi ? 'खत्म' : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Cart, Customer Info & Checkout (5 cols on lg) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header: Items count & Clear */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {isHindi ? 'वर्तमान बिल' : 'Current Bill Items'}
                </span>
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                  {cart.length}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  {isHindi ? 'बिल खाली करें' : 'Clear All'}
                </button>
              )}
            </div>

            {/* Customer Details Input Strip */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHindi ? 'ग्राहक विवरण (व्हाट्सएप बिल हेतु)' : 'Customer Details (for WhatsApp bill)'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={isHindi ? 'मोबाइल नंबर (10 अंक)' : 'Phone No.'}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  {customerSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-36 overflow-y-auto">
                      {customerSuggestions.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCustomerName(c.name);
                            setCustomerPhone(c.phone);
                            setSelectedCustomerId(c.id);
                          }}
                          className="w-full text-left p-2 hover:bg-slate-700 border-b border-slate-700/50 text-xs flex justify-between"
                        >
                          <span className="font-semibold text-white">{c.name}</span>
                          <span className="text-emerald-400 font-mono">{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isHindi ? 'ग्राहक का नाम' : 'Customer Name'}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">
                  {isHindi
                    ? 'बिल में अभी कोई सामान नहीं है। बाईं ओर से चुनें या बारकोड स्कैन करें।'
                    : 'Cart is empty. Select products or scan barcode to add.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white truncate">{item.productName}</div>
                        {item.selectedImei && (
                          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                            IMEI: {item.selectedImei}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/40">
                      {/* Qty changer */}
                      <div className="flex items-center gap-1.5">
                        {!item.selectedImei ? (
                          <>
                            <button
                              onClick={() => handleUpdateQty(idx, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQty(idx, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">1 Unit</span>
                        )}
                      </div>

                      {/* Negotiated Selling Price Input */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">₹</span>
                        <input
                          type="number"
                          value={item.sellingPrice}
                          onChange={(e) => handleUpdatePrice(idx, Number(e.target.value) || 0)}
                          className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-right text-xs font-mono text-white"
                          title="Selling Rate"
                        />
                      </div>

                      {/* Item Total */}
                      <div className="text-right font-black font-mono text-white tabular-nums">
                        ₹{item.total}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Financials & Payment Options */}
          {cart.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              {/* Discount & GST Toggles */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">
                    {isHindi ? 'अतिरिक्त छूट (₹)' : 'Extra Discount (₹)'}
                  </label>
                  <input
                    type="number"
                    value={overallDiscount || ''}
                    onChange={(e) => setOverallDiscount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-950 rounded-lg border border-slate-800 w-full">
                    <input
                      type="checkbox"
                      checked={isGstInvoice}
                      onChange={(e) => setIsGstInvoice(e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span className="text-[11px] font-medium text-slate-300">
                      {isHindi ? 'GST 18% बिल' : 'GST 18% Invoice'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {isHindi ? 'भुगतान का प्रकार (Payment Method)' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-5 gap-1 text-[11px]">
                  {(['Cash', 'UPI', 'Card', 'Credit', 'Split'] as PaymentMethod[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-1.5 rounded-lg font-semibold transition-colors ${
                        paymentMethod === mode
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {mode === 'Credit' ? (isHindi ? 'उधार' : 'Credit') : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Details Input Fields if Split selected */}
              {paymentMethod === 'Split' && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-300">
                    {isHindi ? 'विभाजित भुगतान राशि दर्ज करें:' : 'Enter Split Amounts:'}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Cash (₹):</span>
                      <input
                        type="number"
                        value={splitDetails.cash || ''}
                        onChange={(e) =>
                          setSplitDetails((prev) => ({ ...prev, cash: Number(e.target.value) || 0 }))
                        }
                        placeholder="0"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">UPI (₹):</span>
                      <input
                        type="number"
                        value={splitDetails.upi || ''}
                        onChange={(e) =>
                          setSplitDetails((prev) => ({ ...prev, upi: Number(e.target.value) || 0 }))
                        }
                        placeholder="0"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Card (₹):</span>
                      <input
                        type="number"
                        value={splitDetails.card || ''}
                        onChange={(e) =>
                          setSplitDetails((prev) => ({ ...prev, card: Number(e.target.value) || 0 }))
                        }
                        placeholder="0"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Credit / उधार (₹):</span>
                      <input
                        type="number"
                        value={splitDetails.credit || ''}
                        onChange={(e) =>
                          setSplitDetails((prev) => ({ ...prev, credit: Number(e.target.value) || 0 }))
                        }
                        placeholder="0"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded font-mono text-amber-400 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{isHindi ? 'उप-कुल (Subtotal):' : 'Subtotal:'}</span>
                  <span>₹{subtotal}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{isHindi ? 'कुल छूट (Discount):' : 'Discount:'}</span>
                    <span>-₹{totalDiscount}</span>
                  </div>
                )}
                {isGstInvoice && (
                  <div className="flex justify-between text-slate-400">
                    <span>GST (18%):</span>
                    <span>₹{taxTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-1 border-t border-slate-800">
                  <span className="text-emerald-400">{isHindi ? 'अंतिम देय राशि:' : 'Grand Total:'}</span>
                  <span>₹{grandTotal}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>{isHindi ? 'अनुमानित मुनाफा:' : 'Est. Profit:'}</span>
                  <span className="text-emerald-500 font-semibold">+{formatINR(estimatedProfit)}</span>
                </div>
              </div>

              {/* Complete & Generate Bill Button */}
              <button
                onClick={handleCompleteSale}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-xl text-sm shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {isHindi
                    ? `बिल बनाएं (₹${grandTotal})`
                    : `Generate Bill (₹${grandTotal})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Smartphone IMEI Selection Modal */}
      {pendingImeiProduct && pendingImeiProduct.smartphoneDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isHindi ? 'स्मार्टफोन IMEI नंबर चुनें' : 'Select Smartphone IMEI'}
                </h3>
                <p className="text-xs text-slate-400">{pendingImeiProduct.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">
                {isHindi ? 'स्टॉक में मौजूद IMEI सूची:' : 'Available Stock IMEIs:'}
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {pendingImeiProduct.smartphoneDetails.imeiList.map((imei) => (
                  <label
                    key={imei}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                      selectedImei === imei
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <input
                        type="radio"
                        name="imeiRadio"
                        checked={selectedImei === imei}
                        onChange={() => setSelectedImei(imei)}
                        className="accent-emerald-500"
                      />
                      <span>{imei}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">In Stock</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPendingImeiProduct(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmImei}
                disabled={!selectedImei}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-xs font-semibold disabled:opacity-50"
              >
                {isHindi ? 'बिल में जोड़ें' : 'Add to Bill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        products={products}
        language={language}
      />
    </div>
  );
};
