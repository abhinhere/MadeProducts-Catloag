'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { generateWhatsAppMessage, formatCurrency, formatDate } from '@/lib/utils';
import { upsertPriceSlab, deletePriceSlab } from '@/app/actions/pricing';
import {
  ArrowLeft, Edit, Share2, Package, Tag, Calendar, MessageCircle,
  Plus, Trash2, Check, X, Ruler, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PriceSlab { id: string; quantity: number; price: string; }
interface ProductImage { id: string; imageUrl: string; sortOrder: number; }

interface Product {
  id: string; name: string; description?: string | null;
  width?: number | null; height?: number | null; gusset?: number | null;
  gsm?: number | null; material?: string | null; handleType?: string | null;
  printingType?: string | null; color?: string | null; moq?: number | null;
  updatedAt: Date; createdAt: Date;
  category: { name: string };
  images: ProductImage[];
  priceSlabs: PriceSlab[];
}

interface Settings {
  companyName: string;
  companyWhatsapp?: string | null;
  shareFooter?: string | null;
}

interface Props { product: Product; settings: Settings; isAdmin: boolean; }

export function ProductDetail({ product, settings, isAdmin }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [slabs, setSlabs] = useState(product.priceSlabs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSlab, setNewSlab] = useState(false);
  const [editQty, setEditQty] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);

  function startShare() {
    const msg = generateWhatsAppMessage({ ...product, priceSlabs: slabs }, settings);
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  async function saveSlab(slabId: string | null) {
    const qty = parseInt(editQty);
    const price = parseFloat(editPrice);
    if (!qty || !price || qty <= 0 || price <= 0) {
      toast.error('Please enter valid quantity and price');
      return;
    }
    setSaving(true);
    const result = await upsertPriceSlab(product.id, slabId, qty, price);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Price saved');
      window.location.reload();
    }
    setSaving(false);
  }

  async function handleDeleteSlab(slabId: string) {
    if (!confirm('Delete this price slab?')) return;
    const result = await deletePriceSlab(product.id, slabId);
    if (result?.error) toast.error(result.error);
    else {
      toast.success('Price slab deleted');
      setSlabs(prev => prev.filter(s => s.id !== slabId));
    }
  }

  const specs = [
    { label: 'Width', value: product.width ? `${product.width} inch` : null },
    { label: 'Height', value: product.height ? `${product.height} inch` : null },
    { label: 'Gusset', value: product.gusset ? `${product.gusset} inch` : null },
    { label: 'GSM', value: product.gsm ? `${product.gsm} GSM` : null },
    { label: 'Material', value: product.material },
    { label: 'Handle Type', value: product.handleType },
    { label: 'Printing', value: product.printingType },
    { label: 'Color', value: product.color },
    { label: 'MOQ', value: product.moq ? `${product.moq.toLocaleString('en-IN')} Pieces` : null },
  ].filter(s => s.value);

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link href={`/dashboard/products/${product.id}/edit`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Edit className="w-4 h-4" /> Edit
            </Link>
          )}
          <button onClick={startShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
            <MessageCircle className="w-4 h-4" /> Share via WhatsApp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-amber-50 rounded-2xl overflow-hidden border border-gray-100 relative">
            {product.images[activeImage] ? (
              <Image src={product.images[activeImage].imageUrl} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-amber-200" />
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImage === i ? 'border-amber-500' : 'border-transparent'}`}>
                  <Image src={img.imageUrl} alt="" width={64} height={64} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">{product.category.name}</span>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl text-gray-900 mb-2">{product.name}</h1>
            {product.description && <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>}
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">Specifications</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</span>
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated {formatDate(product.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-gray-800">Pricing Slabs</h2>
          </div>
          {isAdmin && (
            <button onClick={() => { setNewSlab(true); setEditQty(''); setEditPrice(''); setEditingId(null); }}
              className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 font-medium">
              <Plus className="w-4 h-4" /> Add Slab
            </button>
          )}
        </div>

        <div className="divide-y divide-gray-50">
          {slabs.map(slab => (
            <div key={slab.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              {editingId === slab.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} placeholder="Qty"
                    className="w-24 px-2.5 py-1.5 rounded-lg border border-amber-300 text-sm outline-none focus:ring-2 focus:ring-amber-100" />
                  <span className="text-gray-400 text-sm">pcs →</span>
                  <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="₹ Price"
                    className="w-28 px-2.5 py-1.5 rounded-lg border border-amber-300 text-sm outline-none focus:ring-2 focus:ring-amber-100" />
                  <button onClick={() => saveSlab(slab.id)} disabled={saving}
                    className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-800">{slab.quantity.toLocaleString('en-IN')} pieces</span>
                    <span className="text-xs text-gray-400 ml-2">and above</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-amber-800">{formatCurrency(parseFloat(slab.price))}</span>
                    <span className="text-xs text-gray-400">per piece</span>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingId(slab.id); setEditQty(String(slab.quantity)); setEditPrice(slab.price); setNewSlab(false); }}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteSlab(slab.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {newSlab && (
            <div className="px-5 py-3.5 flex items-center gap-2 bg-amber-50/50">
              <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} placeholder="Quantity"
                className="w-24 px-2.5 py-1.5 rounded-lg border border-amber-300 text-sm outline-none focus:ring-2 focus:ring-amber-100 bg-white" />
              <span className="text-gray-400 text-sm">pcs →</span>
              <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="₹ Price"
                className="w-28 px-2.5 py-1.5 rounded-lg border border-amber-300 text-sm outline-none focus:ring-2 focus:ring-amber-100 bg-white" />
              <button onClick={() => saveSlab(null)} disabled={saving}
                className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setNewSlab(false)} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-lg"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {slabs.length === 0 && !newSlab && (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No pricing slabs yet. {isAdmin && 'Click "Add Slab" to get started.'}
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp CTA */}
      <button onClick={startShare}
        className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 text-white rounded-2xl text-base font-semibold hover:bg-green-700 transition-colors shadow-md">
        <MessageCircle className="w-5 h-5" />
        Share Product via WhatsApp
      </button>
    </div>
  );
}
