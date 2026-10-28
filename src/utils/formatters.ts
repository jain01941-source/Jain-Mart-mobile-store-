import { Sale, Customer, StoreSettings } from '../types';

export const formatINR = (amount: number): string => {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (timestampOrDate: number | string): string => {
  const d = new Date(timestampOrDate);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateOnly = (timestampOrDate: number | string): string => {
  const d = new Date(timestampOrDate);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const generateInvoiceNumber = (prefix: string, nextIndex: number): string => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const pad = String(nextIndex).padStart(4, '0');
  return `${prefix}${dateStr}-${pad}`;
};

export const generateBarcode = (): string => {
  // 12-digit standard mobile accessory barcode
  const randomPart = Math.floor(1000000000 + Math.random() * 9000000000);
  return `890${randomPart}`;
};

export const buildWhatsAppBillLink = (sale: Sale, settings: StoreSettings): string => {
  let phone = sale.customerPhone.replace(/[^0-9]/g, '');
  if (phone.length === 10) {
    phone = '91' + phone;
  }

  const itemsList = sale.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*${item.selectedImei ? ` (IMEI: ${item.selectedImei})` : ''} x ${item.quantity} = ₹${item.total}`
    )
    .join('\n');

  const text = `*${settings.storeName}*\n${settings.tagline}\n📍 ${settings.address}\n📞 ${settings.phone}\n------------------------------\n*BILL / INVOICE: ${sale.invoiceNumber}*\nDate: ${formatDateTime(sale.timestamp)}\nCustomer: ${sale.customerName || 'Valued Customer'}\n------------------------------\n${itemsList}\n------------------------------\nSubtotal: ₹${sale.subtotal}\nDiscount: ₹${sale.discountTotal}\n*Grand Total: ₹${sale.grandTotal}*\nPayment Mode: ${sale.paymentMethod}${sale.balanceDue > 0 ? `\n*Remaining Balance (Udhar): ₹${sale.balanceDue}*` : '\n*Status: Fully Paid*'}\n------------------------------\nThank you for shopping with Jain Mart! Visit again.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const buildWhatsAppReminderLink = (
  customer: Customer,
  settings: StoreSettings
): string => {
  let phone = customer.phone.replace(/[^0-9]/g, '');
  if (phone.length === 10) {
    phone = '91' + phone;
  }

  const text = `*नमस्ते ${customer.name} जी,*\n\nयह संदेश *${settings.storeName}* की तरफ से है।\nआपके खाते में पिछला बकाया राशि: *₹${customer.outstandingCredit}* है।\n\nकृपया सुविधा अनुसार UPI या दुकान पर आकर नकद भुगतान करने की कृपा करें।\n\nGoogle Pay / PhonePe: ${settings.phone}\n\nधन्यवाद,\n${settings.storeName}\n📞 ${settings.phone}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const exportToCSV = (data: Record<string, unknown>[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  // Add UTF-8 BOM so Excel on Windows/Android correctly displays Hindi Devnagari script
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
