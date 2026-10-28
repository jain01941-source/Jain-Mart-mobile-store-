export type Language = 'hi' | 'en';

export type ProductCategory =
  | 'Smartphones'
  | 'Chargers'
  | 'USB Cables'
  | 'Earphones'
  | 'Bluetooth Headphones'
  | 'Speakers'
  | 'Power Banks'
  | 'Mobile Covers'
  | 'Tempered Glass'
  | 'Memory Cards'
  | 'SIM Accessories'
  | 'Other Accessories';

export interface SmartphoneDetails {
  model: string;
  color: string;
  storage: string;
  warranty: string;
  imeiList: string[]; // Unsold active IMEIs
  soldImeis: {
    imei: string;
    saleId: string;
    invoiceNumber: string;
    date: string;
    customerName: string;
  }[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  barcode: string;
  sku: string;
  supplierName: string;
  purchaseDate: string;
  imageUrl?: string;
  isSmartphone?: boolean;
  smartphoneDetails?: SmartphoneDetails;
}

export interface SaleItem {
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  quantity: number;
  sellingPrice: number;
  purchasePrice: number; // For accurate profit calculation
  discount: number; // Flat discount per item in Rs
  gstRate: number; // Percentage e.g. 18 or 0
  selectedImei?: string;
  total: number; // (sellingPrice - discount) * quantity
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Credit' | 'Split';

export interface SplitPaymentDetails {
  cash: number;
  upi: number;
  card: number;
  credit: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  timestamp: number;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  totalCost: number; // Total purchase cost of goods sold
  profit: number; // grandTotal - totalCost
  paymentMethod: PaymentMethod;
  splitDetails?: SplitPaymentDetails;
  cashReceived: number; // Actual cash/UPI collected now (excludes credit balance)
  balanceDue: number; // If sold on credit
  status: 'completed' | 'returned' | 'cancelled';
  isGstInvoice: boolean;
  notes?: string;
}

export interface PurchaseItem {
  productId?: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  imeis?: string[];
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  date: string;
  timestamp: number;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit';
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  gstin?: string;
  address?: string;
  totalPurchased: number;
  totalPaid: number;
  outstandingBalance: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingCredit: number; // Udhar
  createdDate: string;
}

export interface CustomerPaymentRecord {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card';
  date: string;
  timestamp: number;
  notes?: string;
}

export type ExpenseCategory =
  | 'Shop Rent'
  | 'Electricity Bill'
  | 'Employee Salary'
  | 'Transport'
  | 'Packaging'
  | 'Repairs'
  | 'Tea & Refreshment'
  | 'Other Expenses';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
  timestamp: number;
  paymentMode: 'Cash' | 'UPI';
  notes?: string;
}

export interface ReturnRecord {
  id: string;
  saleId: string;
  invoiceNumber: string;
  date: string;
  timestamp: number;
  customerName: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    refundAmount: number;
    purchaseCost: number;
    returnImei?: string;
    condition: 'good' | 'defective';
  }[];
  totalRefund: number;
  refundMode: 'Cash' | 'UPI' | 'Credit Adjustment';
  reason: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameHi: string;
  tagline: string;
  taglineHi: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  city: string;
  gstin: string;
  invoicePrefix: string;
  enablePin: boolean;
  securityPin: string;
  thermalPrinterWidth: '58mm' | '80mm';
  termsConditions: string;
  defaultLanguage: Language;
}
