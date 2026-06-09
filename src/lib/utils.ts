import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function generateWhatsAppMessage(
  product: {
    name: string;
    width?: number | null;
    height?: number | null;
    gusset?: number | null;
    gsm?: number | null;
    material?: string | null;
    handleType?: string | null;
    moq?: number | null;
    priceSlabs: { quantity: number; price: string | number; printingType?: string | null }[];
  },
  settings: {
    companyName: string;
    companyWhatsapp?: string | null;
    shareFooter?: string | null;
  }
): string {
  const lines: string[] = [];
  lines.push(`*${settings.companyName.toUpperCase()}*`);
  lines.push('');
  lines.push(`*${product.name.toUpperCase()}*`);
  lines.push('');
  if (product.width && product.height) {
    const size = product.gusset
      ? `${product.width} x ${product.height} x ${product.gusset} Inch`
      : `${product.width} x ${product.height} Inch`;
    lines.push(`📐 *Size:* ${size}`);
  }
  if (product.gsm && product.material) {
    lines.push(`📦 *Material:* ${product.gsm} GSM ${product.material}`);
  }
  if (product.handleType) lines.push(`🖐 *Handle:* ${product.handleType}`);
  if (product.moq) lines.push(`📊 *MOQ:* ${product.moq.toLocaleString('en-IN')} Pieces`);
  if (product.priceSlabs.length > 0) {
    lines.push('');
    lines.push('*💰 Pricing:*');
    product.priceSlabs.forEach(slab => {
      const price = typeof slab.price === 'string' ? parseFloat(slab.price) : slab.price;
      const printStr = slab.printingType && slab.printingType !== 'No print' ? ` (${slab.printingType})` : '';
      lines.push(`• ${slab.quantity.toLocaleString('en-IN')} Nos${printStr} — ₹${price.toFixed(2)}`);
    });
  }
  if (settings.companyWhatsapp) {
    lines.push('');
    lines.push('*📞 For Enquiry:*');
    lines.push(`wa.me/${settings.companyWhatsapp.replace(/\D/g, '')}`);
  }
  if (settings.shareFooter) {
    lines.push('');
    lines.push(settings.shareFooter);
  }
  return lines.join('\n');
}
