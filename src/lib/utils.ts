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
    
    const groups: Record<string, typeof product.priceSlabs> = {};
    product.priceSlabs.forEach(slab => {
      const pt = slab.printingType || 'No print';
      if (!groups[pt]) groups[pt] = [];
      groups[pt].push(slab);
    });

    const PRINTING_TYPES = ['No print', 'Single colour', 'Two colour', 'Multi colour', 'Full Tint'];
    const sortedGroups = Object.entries(groups).sort((a, b) => {
      const idxA = PRINTING_TYPES.indexOf(a[0]);
      const idxB = PRINTING_TYPES.indexOf(b[0]);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    sortedGroups.forEach(([pt, slabs]) => {
      if (pt !== 'No print' || sortedGroups.length > 1) {
        lines.push(`*${pt}:*`);
      }
      slabs.forEach(slab => {
        const price = typeof slab.price === 'string' ? parseFloat(slab.price) : slab.price;
        lines.push(`• ${slab.quantity.toLocaleString('en-IN')} Nos — ₹${price.toFixed(2)}`);
      });
    });
  }
  if (settings.companyWhatsapp) {
    lines.push('');
    lines.push('*📞 For Enquiry:*');
    lines.push(`wa.me/${settings.companyWhatsapp.replace(/\D/g, '')}`);
  }
  lines.push('');
  lines.push('for more : www.madeproducts.in');
  return lines.join('\n');
}
