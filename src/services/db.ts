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
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'jain_mart_products_v1',
  SALES: 'jain_mart_sales_v1',
  PURCHASES: 'jain_mart_purchases_v1',
  CUSTOMERS: 'jain_mart_customers_v1',
  SUPPLIERS: 'jain_mart_suppliers_v1',
  EXPENSES: 'jain_mart_expenses_v1',
  RETURNS: 'jain_mart_returns_v1',
  CUSTOMER_PAYMENTS: 'jain_mart_cust_payments_v1',
  SETTINGS: 'jain_mart_settings_v1',
};

export const defaultSettings: StoreSettings = {
  storeName: 'Jain Mart Mobile Store',
  storeNameHi: 'जैन मार्ट मोबाइल स्टोर',
  tagline: 'Latest Smartphones & All Mobile Accessories',
  taglineHi: 'स्मार्टफोन, सभी मोबाइल एक्सेसरीज़ व फास्ट बिलिंग',
  phone: '9829012345',
  secondaryPhone: '9414056789',
  address: 'Shop No. 12-14, City Mobile Complex, Station Road',
  city: 'Jaipur, Rajasthan',
  gstin: '08AAACJ1234M1Z8',
  invoicePrefix: 'JM-',
  enablePin: false,
  securityPin: '1234',
  thermalPrinterWidth: '58mm',
  termsConditions: '1. No cash refund on opened goods. 2. 1-Year brand warranty for smartphones. 3. Please bring invoice for warranty claim.',
  defaultLanguage: 'hi',
};

// Seed initial authentic Indian mobile shop products
const getInitialProducts = (): Product[] => [
  {
    id: 'prod-sp-1',
    name: 'Redmi Note 13 5G (8GB/256GB)',
    brand: 'Xiaomi / Redmi',
    category: 'Smartphones',
    purchasePrice: 15400,
    sellingPrice: 17999,
    stockQuantity: 4,
    minStockAlert: 2,
    barcode: '890123450001',
    sku: 'RN13-5G-8-256',
    supplierName: 'Arihant Telecom Wholesalers',
    purchaseDate: '2026-10-20',
    isSmartphone: true,
    smartphoneDetails: {
      model: 'Redmi Note 13 5G',
      color: 'Prism Black',
      storage: '8GB RAM + 256GB ROM',
      warranty: '1 Year Brand Warranty',
      imeiList: [
        '864201941234561',
        '864201941234562',
        '864201941234563',
        '864201941234564',
      ],
      soldImeis: [
        {
          imei: '864201941234560',
          saleId: 'sale-001',
          invoiceNumber: 'JM-261027-0001',
          date: '2026-10-27',
          customerName: 'Rahul Sharma',
        },
      ],
    },
  },
  {
    id: 'prod-sp-2',
    name: 'Realme 12+ 5G (8GB/128GB)',
    brand: 'Realme',
    category: 'Smartphones',
    purchasePrice: 16800,
    sellingPrice: 19499,
    stockQuantity: 3,
    minStockAlert: 2,
    barcode: '890123450002',
    sku: 'RME12P-8-128',
    supplierName: 'Arihant Telecom Wholesalers',
    purchaseDate: '2026-10-22',
    isSmartphone: true,
    smartphoneDetails: {
      model: 'Realme 12 Plus 5G',
      color: 'Pioneer Green',
      storage: '8GB RAM + 128GB ROM',
      warranty: '1 Year Brand Warranty',
      imeiList: [
        '867492019582101',
        '867492019582102',
        '867492019582103',
      ],
      soldImeis: [],
    },
  },
  {
    id: 'prod-sp-3',
    name: 'Samsung Galaxy A15 5G (6GB/128GB)',
    brand: 'Samsung',
    category: 'Smartphones',
    purchasePrice: 13900,
    sellingPrice: 15999,
    stockQuantity: 5,
    minStockAlert: 2,
    barcode: '890123450003',
    sku: 'SAM-A15-6-128',
    supplierName: 'Mahaveer Mobile Distributors',
    purchaseDate: '2026-10-24',
    isSmartphone: true,
    smartphoneDetails: {
      model: 'Galaxy A15 5G',
      color: 'Blue Black',
      storage: '6GB RAM + 128GB ROM',
      warranty: '1 Year Brand Warranty',
      imeiList: [
        '359281048592111',
        '359281048592112',
        '359281048592113',
        '359281048592114',
        '359281048592115',
      ],
      soldImeis: [],
    },
  },
  {
    id: 'prod-acc-1',
    name: '65W SuperDart / Warp Fast Charger with Cable',
    brand: 'Realme / OnePlus OEM',
    category: 'Chargers',
    purchasePrice: 380,
    sellingPrice: 799,
    stockQuantity: 18,
    minStockAlert: 5,
    barcode: '890200000011',
    sku: 'CHG-65W-DART',
    supplierName: 'Shree Balaji Accessories',
    purchaseDate: '2026-10-18',
  },
  {
    id: 'prod-acc-2',
    name: '20W PD Type-C Fast Adapter (iPhone & Android)',
    brand: 'Portronics',
    category: 'Chargers',
    purchasePrice: 240,
    sellingPrice: 549,
    stockQuantity: 24,
    minStockAlert: 6,
    barcode: '890200000012',
    sku: 'CHG-20W-PD',
    supplierName: 'Shree Balaji Accessories',
    purchaseDate: '2026-10-18',
  },
  {
    id: 'prod-acc-3',
    name: 'Type-C to Type-C 60W Braided Cable (1.2m)',
    brand: 'Boat',
    category: 'USB Cables',
    purchasePrice: 85,
    sellingPrice: 249,
    stockQuantity: 35,
    minStockAlert: 10,
    barcode: '890200000013',
    sku: 'CBL-C2C-60W',
    supplierName: 'Shree Balaji Accessories',
    purchaseDate: '2026-10-25',
  },
  {
    id: 'prod-acc-4',
    name: 'Boat Airdopes 141 ANC TWS Earbuds',
    brand: 'Boat',
    category: 'Bluetooth Headphones',
    purchasePrice: 820,
    sellingPrice: 1399,
    stockQuantity: 12,
    minStockAlert: 3,
    barcode: '890200000014',
    sku: 'TWS-BOAT-141',
    supplierName: 'Mahaveer Mobile Distributors',
    purchaseDate: '2026-10-22',
  },
  {
    id: 'prod-acc-5',
    name: '10,000mAh 22.5W Fast Charging Power Bank',
    brand: 'Mi / Xiaomi',
    category: 'Power Banks',
    purchasePrice: 780,
    sellingPrice: 1299,
    stockQuantity: 8,
    minStockAlert: 3,
    barcode: '890200000015',
    sku: 'PB-MI-10K',
    supplierName: 'Arihant Telecom Wholesalers',
    purchaseDate: '2026-10-15',
  },
  {
    id: 'prod-acc-6',
    name: '11D Super Strong Tempered Glass (All Models)',
    brand: 'Generic Premium',
    category: 'Tempered Glass',
    purchasePrice: 22,
    sellingPrice: 120,
    stockQuantity: 140,
    minStockAlert: 25,
    barcode: '890200000016',
    sku: 'GLS-11D-ALL',
    supplierName: 'Goyal Glass & Cover Delhi',
    purchaseDate: '2026-10-10',
  },
  {
    id: 'prod-acc-7',
    name: 'Silicone Matte Anti-Slip Back Cover (Assorted)',
    brand: 'CasePro',
    category: 'Mobile Covers',
    purchasePrice: 38,
    sellingPrice: 150,
    stockQuantity: 85,
    minStockAlert: 15,
    barcode: '890200000017',
    sku: 'CVR-MATTE-ASST',
    supplierName: 'Goyal Glass & Cover Delhi',
    purchaseDate: '2026-10-12',
  },
  {
    id: 'prod-acc-8',
    name: 'SanDisk Ultra 64GB MicroSD Class 10 Card',
    brand: 'SanDisk',
    category: 'Memory Cards',
    purchasePrice: 320,
    sellingPrice: 599,
    stockQuantity: 2, // Low stock on purpose to test alert
    minStockAlert: 5,
    barcode: '890200000018',
    sku: 'MEM-SD-64GB',
    supplierName: 'Arihant Telecom Wholesalers',
    purchaseDate: '2026-10-05',
  },
  {
    id: 'prod-acc-9',
    name: 'Mini Bluetooth Wireless Speaker with Bass',
    brand: 'Zebronics',
    category: 'Speakers',
    purchasePrice: 420,
    sellingPrice: 799,
    stockQuantity: 1, // Low stock on purpose to test alert
    minStockAlert: 4,
    barcode: '890200000019',
    sku: 'SPK-ZEB-BT',
    supplierName: 'Mahaveer Mobile Distributors',
    purchaseDate: '2026-10-08',
  },
];

const getInitialSuppliers = (): Supplier[] => [
  {
    id: 'sup-1',
    name: 'Arihant Telecom Wholesalers',
    phone: '9828099881',
    gstin: '08AAZFA1234Q1Z1',
    address: 'Indira Market, Jaipur',
    totalPurchased: 245000,
    totalPaid: 215000,
    outstandingBalance: 30000,
  },
  {
    id: 'sup-2',
    name: 'Mahaveer Mobile Distributors',
    phone: '9414011223',
    gstin: '08BBMMA5678R1Z2',
    address: 'Nehru Bazar, Jaipur',
    totalPurchased: 180000,
    totalPaid: 165000,
    outstandingBalance: 15000,
  },
  {
    id: 'sup-3',
    name: 'Shree Balaji Accessories',
    phone: '9829033445',
    gstin: '08CCSBJ9012S1Z3',
    address: 'Gaffar Market Partner Hub, Delhi',
    totalPurchased: 78000,
    totalPaid: 78000,
    outstandingBalance: 0,
  },
  {
    id: 'sup-4',
    name: 'Goyal Glass & Cover Delhi',
    phone: '9312055667',
    address: 'Karol Bagh, Delhi',
    totalPurchased: 45000,
    totalPaid: 40000,
    outstandingBalance: 5000,
  },
];

const getInitialCustomers = (): Customer[] => [
  {
    id: 'cust-1',
    name: 'Rahul Sharma',
    phone: '9829123456',
    address: 'Civil Lines, Jaipur',
    totalPurchases: 22400,
    totalPaid: 18400,
    outstandingCredit: 4000,
    createdDate: '2026-09-15',
  },
  {
    id: 'cust-2',
    name: 'Amit Jain',
    phone: '9414167890',
    address: 'Malviya Nagar, Jaipur',
    totalPurchases: 12500,
    totalPaid: 12500,
    outstandingCredit: 0,
    createdDate: '2026-09-28',
  },
  {
    id: 'cust-3',
    name: 'Vikram Choudhary',
    phone: '9783456712',
    address: 'Mansarovar, Jaipur',
    totalPurchases: 3200,
    totalPaid: 1700,
    outstandingCredit: 1500,
    createdDate: '2026-10-10',
  },
  {
    id: 'cust-4',
    name: 'Pooja Verma',
    phone: '9660234589',
    address: 'Tonk Phatak, Jaipur',
    totalPurchases: 4500,
    totalPaid: 4500,
    outstandingCredit: 0,
    createdDate: '2026-10-18',
  },
];

const getInitialSales = (): Sale[] => {
  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  return [
    {
      id: 'sale-001',
      invoiceNumber: 'JM-261028-0001',
      date: today,
      timestamp: now - 3600000 * 3,
      customerId: 'cust-1',
      customerName: 'Rahul Sharma',
      customerPhone: '9829123456',
      items: [
        {
          productId: 'prod-acc-1',
          productName: '65W SuperDart / Warp Fast Charger with Cable',
          brand: 'Realme / OnePlus OEM',
          category: 'Chargers',
          quantity: 1,
          sellingPrice: 799,
          purchasePrice: 380,
          discount: 50,
          gstRate: 0,
          total: 749,
        },
        {
          productId: 'prod-acc-6',
          productName: '11D Super Strong Tempered Glass (All Models)',
          brand: 'Generic Premium',
          category: 'Tempered Glass',
          quantity: 1,
          sellingPrice: 120,
          purchasePrice: 22,
          discount: 0,
          gstRate: 0,
          total: 120,
        },
      ],
      subtotal: 919,
      discountTotal: 50,
      taxTotal: 0,
      grandTotal: 869,
      totalCost: 402, // 380 + 22
      profit: 467, // 869 - 402
      paymentMethod: 'UPI',
      cashReceived: 869,
      balanceDue: 0,
      status: 'completed',
      isGstInvoice: false,
    },
    {
      id: 'sale-002',
      invoiceNumber: 'JM-261028-0002',
      date: today,
      timestamp: now - 3600000 * 1.5,
      customerId: 'cust-2',
      customerName: 'Amit Jain',
      customerPhone: '9414167890',
      items: [
        {
          productId: 'prod-acc-4',
          productName: 'Boat Airdopes 141 ANC TWS Earbuds',
          brand: 'Boat',
          category: 'Bluetooth Headphones',
          quantity: 1,
          sellingPrice: 1399,
          purchasePrice: 820,
          discount: 100,
          gstRate: 0,
          total: 1299,
        },
      ],
      subtotal: 1399,
      discountTotal: 100,
      taxTotal: 0,
      grandTotal: 1299,
      totalCost: 820,
      profit: 479,
      paymentMethod: 'Cash',
      cashReceived: 1299,
      balanceDue: 0,
      status: 'completed',
      isGstInvoice: false,
    },
    {
      id: 'sale-003',
      invoiceNumber: 'JM-261028-0003',
      date: today,
      timestamp: now - 3600000 * 0.5,
      customerId: 'cust-3',
      customerName: 'Vikram Choudhary',
      customerPhone: '9783456712',
      items: [
        {
          productId: 'prod-acc-5',
          productName: '10,000mAh 22.5W Fast Charging Power Bank',
          brand: 'Mi / Xiaomi',
          category: 'Power Banks',
          quantity: 1,
          sellingPrice: 1299,
          purchasePrice: 780,
          discount: 50,
          gstRate: 0,
          total: 1249,
        },
        {
          productId: 'prod-acc-7',
          productName: 'Silicone Matte Anti-Slip Back Cover (Assorted)',
          brand: 'CasePro',
          category: 'Mobile Covers',
          quantity: 1,
          sellingPrice: 150,
          purchasePrice: 38,
          discount: 0,
          gstRate: 0,
          total: 150,
        },
      ],
      subtotal: 1449,
      discountTotal: 50,
      taxTotal: 0,
      grandTotal: 1399,
      totalCost: 818,
      profit: 581,
      paymentMethod: 'Split',
      splitDetails: {
        cash: 500,
        upi: 0,
        card: 0,
        credit: 899,
      },
      cashReceived: 500,
      balanceDue: 899,
      status: 'completed',
      isGstInvoice: false,
      notes: 'Customer paid 500 cash, balance 899 added to credit khata.',
    },
  ];
};

const getInitialExpenses = (): Expense[] => {
  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  return [
    {
      id: 'exp-1',
      category: 'Tea & Refreshment',
      title: 'Morning Tea and Biscuits for staff and customers',
      amount: 140,
      date: today,
      timestamp: now - 3600000 * 4,
      paymentMode: 'Cash',
    },
    {
      id: 'exp-2',
      category: 'Transport',
      title: 'Auto freight for accessory parcel from transport nagar',
      amount: 250,
      date: today,
      timestamp: now - 3600000 * 2,
      paymentMode: 'UPI',
    },
    {
      id: 'exp-3',
      category: 'Packaging',
      title: 'Jain Mart Printed Carry Bags 250 pcs',
      amount: 450,
      date: today,
      timestamp: now - 3600000 * 1,
      paymentMode: 'Cash',
    },
  ];
};

class DatabaseService {
  private getItem<T>(key: string, fallback: () => T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        const initial = fallback();
        this.setItem(key, initial);
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return fallback();
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to write to localStorage key ${key}`, e);
    }
  }

  // Settings
  getSettings(): StoreSettings {
    return this.getItem(STORAGE_KEYS.SETTINGS, () => defaultSettings);
  }

  saveSettings(settings: StoreSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // Products
  getProducts(): Product[] {
    return this.getItem(STORAGE_KEYS.PRODUCTS, getInitialProducts);
  }

  saveProducts(products: Product[]): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = { ...product, id: newId };
    
    // Auto sync stockQuantity if smartphone with IMEI list
    if (newProduct.isSmartphone && newProduct.smartphoneDetails) {
      newProduct.stockQuantity = newProduct.smartphoneDetails.imeiList.length;
    }

    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  updateProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      if (product.isSmartphone && product.smartphoneDetails) {
        product.stockQuantity = product.smartphoneDetails.imeiList.length;
      }
      products[index] = product;
      this.saveProducts(products);
    }
  }

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter((p) => p.id !== productId);
    this.saveProducts(products);
  }

  // Sales
  getSales(): Sale[] {
    return this.getItem(STORAGE_KEYS.SALES, getInitialSales);
  }

  saveSales(sales: Sale[]): void {
    this.setItem(STORAGE_KEYS.SALES, sales);
  }

  createSale(saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'timestamp' | 'date'>): Sale {
    const sales = this.getSales();
    const settings = this.getSettings();
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    const invoiceNumber = `${settings.invoicePrefix}${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(sales.length + 1).padStart(4, '0')}`;

    const newSale: Sale = {
      ...saleData,
      id: `sale-${now}`,
      invoiceNumber,
      date: today,
      timestamp: now,
    };

    // 1. Deduct Inventory Stock & Track Smartphone IMEIs
    const products = this.getProducts();
    newSale.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
        if (prod.isSmartphone && prod.smartphoneDetails && item.selectedImei) {
          // Move from active imeiList to soldImeis
          prod.smartphoneDetails.imeiList = prod.smartphoneDetails.imeiList.filter(
            (imei) => imei !== item.selectedImei
          );
          prod.smartphoneDetails.soldImeis.unshift({
            imei: item.selectedImei,
            saleId: newSale.id,
            invoiceNumber: newSale.invoiceNumber,
            date: today,
            customerName: newSale.customerName,
          });
          prod.stockQuantity = prod.smartphoneDetails.imeiList.length;
        }
      }
    });
    this.saveProducts(products);

    // 2. Customer Khata / Credit updates
    if (newSale.customerPhone && newSale.customerPhone.trim().length > 0) {
      const customers = this.getCustomers();
      let customer = customers.find((c) => c.phone === newSale.customerPhone.trim());
      if (!customer) {
        customer = {
          id: `cust-${Date.now()}`,
          name: newSale.customerName || 'Valued Customer',
          phone: newSale.customerPhone.trim(),
          totalPurchases: newSale.grandTotal,
          totalPaid: newSale.cashReceived,
          outstandingCredit: newSale.balanceDue,
          createdDate: today,
        };
        customers.unshift(customer);
      } else {
        customer.totalPurchases += newSale.grandTotal;
        customer.totalPaid += newSale.cashReceived;
        customer.outstandingCredit += newSale.balanceDue;
        if (newSale.customerName && (!customer.name || customer.name === 'Valued Customer')) {
          customer.name = newSale.customerName;
        }
      }
      this.saveCustomers(customers);
    }

    // 3. Save Sale
    sales.unshift(newSale);
    this.saveSales(sales);
    return newSale;
  }

  // Returns & Cancellations
  getReturns(): ReturnRecord[] {
    return this.getItem(STORAGE_KEYS.RETURNS, () => []);
  }

  saveReturns(returns: ReturnRecord[]): void {
    this.setItem(STORAGE_KEYS.RETURNS, returns);
  }

  processReturn(returnRecord: Omit<ReturnRecord, 'id' | 'timestamp' | 'date'>): ReturnRecord {
    const returns = this.getReturns();
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    const newReturn: ReturnRecord = {
      ...returnRecord,
      id: `ret-${now}`,
      timestamp: now,
      date: today,
    };

    // 1. Restock items into product inventory
    const products = this.getProducts();
    newReturn.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stockQuantity += item.quantity;
        if (prod.isSmartphone && prod.smartphoneDetails && item.returnImei) {
          // Re-add IMEI to active list and remove from sold list
          if (!prod.smartphoneDetails.imeiList.includes(item.returnImei)) {
            prod.smartphoneDetails.imeiList.push(item.returnImei);
          }
          prod.smartphoneDetails.soldImeis = prod.smartphoneDetails.soldImeis.filter(
            (s) => s.imei !== item.returnImei
          );
          prod.stockQuantity = prod.smartphoneDetails.imeiList.length;
        }
      }
    });
    this.saveProducts(products);

    // 2. Mark original sale status or reduce profit
    const sales = this.getSales();
    const sale = sales.find((s) => s.id === newReturn.saleId || s.invoiceNumber === newReturn.invoiceNumber);
    if (sale) {
      sale.status = 'returned';
      sale.profit = Math.max(0, sale.profit - (newReturn.totalRefund - newReturn.items.reduce((acc, i) => acc + i.purchaseCost, 0)));
      this.saveSales(sales);
    }

    // 3. Adjust customer credit if customer phone is present
    if (newReturn.customerPhone) {
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.phone === newReturn.customerPhone);
      if (customer) {
        if (newReturn.refundMode === 'Credit Adjustment') {
          customer.outstandingCredit = Math.max(0, customer.outstandingCredit - newReturn.totalRefund);
        }
        this.saveCustomers(customers);
      }
    }

    returns.unshift(newReturn);
    this.saveReturns(returns);
    return newReturn;
  }

  // Purchases
  getPurchases(): Purchase[] {
    return this.getItem(STORAGE_KEYS.PURCHASES, () => []);
  }

  savePurchases(purchases: Purchase[]): void {
    this.setItem(STORAGE_KEYS.PURCHASES, purchases);
  }

  createPurchase(purchaseData: Omit<Purchase, 'id' | 'timestamp' | 'date'>): Purchase {
    const purchases = this.getPurchases();
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    const newPurchase: Purchase = {
      ...purchaseData,
      id: `pur-${now}`,
      timestamp: now,
      date: today,
    };

    // 1. Auto-increase stock & add IMEIs to inventory
    const products = this.getProducts();
    newPurchase.items.forEach((item) => {
      let prod = products.find((p) => p.id === item.productId || p.name.toLowerCase() === item.productName.toLowerCase());
      if (prod) {
        prod.stockQuantity += item.quantity;
        prod.purchasePrice = item.purchasePrice; // Update latest cost
        if (item.sellingPrice > 0) prod.sellingPrice = item.sellingPrice;
        if (prod.isSmartphone && prod.smartphoneDetails && item.imeis) {
          item.imeis.forEach((imei) => {
            if (!prod!.smartphoneDetails!.imeiList.includes(imei)) {
              prod!.smartphoneDetails!.imeiList.push(imei);
            }
          });
          prod.stockQuantity = prod.smartphoneDetails.imeiList.length;
        }
      } else {
        // Create as new product
        const isSmart = item.category === 'Smartphones';
        const newProd: Product = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: item.productName,
          brand: item.brand,
          category: item.category,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          stockQuantity: item.quantity,
          minStockAlert: 2,
          barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
          sku: `${item.brand.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
          supplierName: newPurchase.supplierName,
          purchaseDate: today,
          isSmartphone: isSmart,
          smartphoneDetails: isSmart
            ? {
                model: item.productName,
                color: 'Default',
                storage: 'Standard',
                warranty: '1 Year Brand Warranty',
                imeiList: item.imeis || [],
                soldImeis: [],
              }
            : undefined,
        };
        products.unshift(newProd);
      }
    });
    this.saveProducts(products);

    // 2. Update Supplier ledger
    const suppliers = this.getSuppliers();
    let supplier = suppliers.find((s) => s.id === newPurchase.supplierId || s.name.toLowerCase() === newPurchase.supplierName.toLowerCase());
    if (supplier) {
      supplier.totalPurchased += newPurchase.totalAmount;
      supplier.totalPaid += newPurchase.paidAmount;
      supplier.outstandingBalance += newPurchase.balanceDue;
    } else {
      supplier = {
        id: `sup-${Date.now()}`,
        name: newPurchase.supplierName,
        phone: newPurchase.supplierPhone || '',
        totalPurchased: newPurchase.totalAmount,
        totalPaid: newPurchase.paidAmount,
        outstandingBalance: newPurchase.balanceDue,
      };
      suppliers.unshift(supplier);
    }
    this.saveSuppliers(suppliers);

    // 3. Save purchase
    purchases.unshift(newPurchase);
    this.savePurchases(purchases);
    return newPurchase;
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.getItem(STORAGE_KEYS.SUPPLIERS, getInitialSuppliers);
  }

  saveSuppliers(suppliers: Supplier[]): void {
    this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  recordSupplierPayment(supplierId: string, amount: number): void {
    const suppliers = this.getSuppliers();
    const sup = suppliers.find((s) => s.id === supplierId);
    if (sup) {
      sup.totalPaid += amount;
      sup.outstandingBalance = Math.max(0, sup.outstandingBalance - amount);
      this.saveSuppliers(suppliers);
    }
  }

  // Customers & Khata
  getCustomers(): Customer[] {
    return this.getItem(STORAGE_KEYS.CUSTOMERS, getInitialCustomers);
  }

  saveCustomers(customers: Customer[]): void {
    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
  }

  getCustomerPayments(): CustomerPaymentRecord[] {
    return this.getItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, () => []);
  }

  saveCustomerPayments(payments: CustomerPaymentRecord[]): void {
    this.setItem(STORAGE_KEYS.CUSTOMER_PAYMENTS, payments);
  }

  recordCustomerPayment(
    customerId: string,
    amount: number,
    paymentMethod: 'Cash' | 'UPI' | 'Card',
    notes?: string
  ): void {
    const customers = this.getCustomers();
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      cust.totalPaid += amount;
      cust.outstandingCredit = Math.max(0, cust.outstandingCredit - amount);
      this.saveCustomers(customers);

      const payments = this.getCustomerPayments();
      payments.unshift({
        id: `cpay-${Date.now()}`,
        customerId,
        customerName: cust.name,
        amount,
        paymentMethod,
        date: new Date().toISOString().slice(0, 10),
        timestamp: Date.now(),
        notes,
      });
      this.saveCustomerPayments(payments);
    }
  }

  // Expenses
  getExpenses(): Expense[] {
    return this.getItem(STORAGE_KEYS.EXPENSES, getInitialExpenses);
  }

  saveExpenses(expenses: Expense[]): void {
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);
  }

  addExpense(expense: Omit<Expense, 'id' | 'timestamp' | 'date'>): Expense {
    const expenses = this.getExpenses();
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    const newExpense: Expense = {
      ...expense,
      id: `exp-${now}`,
      timestamp: now,
      date: today,
    };
    expenses.unshift(newExpense);
    this.saveExpenses(expenses);
    return newExpense;
  }

  deleteExpense(expenseId: string): void {
    const expenses = this.getExpenses().filter((e) => e.id !== expenseId);
    this.saveExpenses(expenses);
  }

  // Analytics & Summary Calculations
  getDashboardMetrics() {
    const today = new Date().toISOString().slice(0, 10);
    const sales = this.getSales().filter((s) => s.status !== 'cancelled');
    const expenses = this.getExpenses();
    const products = this.getProducts();
    const customers = this.getCustomers();
    const suppliers = this.getSuppliers();

    const todaySalesList = sales.filter((s) => s.date === today);
    const todayExpensesList = expenses.filter((e) => e.date === today);

    const todaySales = todaySalesList.reduce((sum, s) => sum + s.grandTotal, 0);
    const todayGrossProfit = todaySalesList.reduce((sum, s) => sum + s.profit, 0);
    const todayExpenses = todayExpensesList.reduce((sum, e) => sum + e.amount, 0);
    const todayNetProfit = todayGrossProfit - todayExpenses;

    // Cash received breakdown for today
    let cashReceived = 0;
    let upiReceived = 0;
    let cardReceived = 0;
    let creditSalesToday = 0;

    todaySalesList.forEach((s) => {
      if (s.paymentMethod === 'Cash') cashReceived += s.cashReceived;
      else if (s.paymentMethod === 'UPI') upiReceived += s.cashReceived;
      else if (s.paymentMethod === 'Card') cardReceived += s.cashReceived;
      else if (s.paymentMethod === 'Credit') creditSalesToday += s.balanceDue;
      else if (s.paymentMethod === 'Split' && s.splitDetails) {
        cashReceived += s.splitDetails.cash || 0;
        upiReceived += s.splitDetails.upi || 0;
        cardReceived += s.splitDetails.card || 0;
        creditSalesToday += s.splitDetails.credit || 0;
      }
    });

    const totalStockCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert);

    const pendingCustomerCredit = customers.reduce((sum, c) => sum + c.outstandingCredit, 0);
    const pendingSupplierDue = suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);

    return {
      todaySales,
      todayGrossProfit,
      todayNetProfit,
      todayExpenses,
      cashReceived,
      upiReceived,
      cardReceived,
      creditSalesToday,
      totalStockCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentSales: todaySalesList.slice(0, 8),
      pendingCustomerCredit,
      pendingSupplierDue,
    };
  }

  // Backup and Restore
  exportDatabaseJSON(): string {
    const data = {
      products: this.getProducts(),
      sales: this.getSales(),
      purchases: this.getPurchases(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      expenses: this.getExpenses(),
      returns: this.getReturns(),
      customerPayments: this.getCustomerPayments(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
      storeName: 'Jain Mart Mobile Store',
    };
    return JSON.stringify(data, null, 2);
  }

  restoreDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.products)) this.saveProducts(data.products);
      if (Array.isArray(data.sales)) this.saveSales(data.sales);
      if (Array.isArray(data.purchases)) this.savePurchases(data.purchases);
      if (Array.isArray(data.customers)) this.saveCustomers(data.customers);
      if (Array.isArray(data.suppliers)) this.saveSuppliers(data.suppliers);
      if (Array.isArray(data.expenses)) this.saveExpenses(data.expenses);
      if (Array.isArray(data.returns)) this.saveReturns(data.returns);
      if (Array.isArray(data.customerPayments)) this.saveCustomerPayments(data.customerPayments);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  }

  resetToSampleData(): void {
    this.saveProducts(getInitialProducts());
    this.saveSales(getInitialSales());
    this.savePurchases([]);
    this.saveCustomers(getInitialCustomers());
    this.saveSuppliers(getInitialSuppliers());
    this.saveExpenses(getInitialExpenses());
    this.saveReturns([]);
    this.saveCustomerPayments([]);
    this.saveSettings(defaultSettings);
  }
}

export const db = new DatabaseService();
