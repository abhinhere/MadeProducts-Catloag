'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createProduct, updateProduct } from '@/app/actions/products';
import { ArrowLeft, Upload, X, ImageIcon, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Category { id: string; name: string; }
interface ProductImage { id: string; imageUrl: string; sortOrder: number; }
interface Product {
  id: string; name: string; categoryId: string;
  description?: string | null; width?: number | null; height?: number | null;
  gusset?: number | null; gsm?: number | null; material?: string | null;
  handleType?: string | null; moq?: number | null;
  images: ProductImage[];
}

interface Props {
  categories: Category[];
  product?: Product;
}

const HANDLE_TYPES = ['Paper Handle', 'Rope Handle', 'Ribbon Handle', 'No Handle'];
const MATERIALS = ['White Kraft Paper', 'Brown Kraft Paper', 'Duplex', 'White Pack', 'Cyber XL'];

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    
    const result = isEdit
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result?.error) {
      toast.error(result.error);
      setSaving(false);
    } else {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      router.push(isEdit ? `/dashboard/products/${product.id}` : '/dashboard/products');
    }
  }

  async function handleImageUpload(files: FileList) {
    if (!product?.id) {
      toast.error('Save the product first before adding images');
      return;
    }
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', product.id);
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const { image } = await res.json();
        setImages(prev => [...prev, image]);
      } else {
        toast.error('Failed to upload image');
      }
    }
    setUploading(false);
  }

  async function handleDeleteImage(imageId: string) {
    const res = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    });
    if (res.ok) setImages(prev => prev.filter(i => i.id !== imageId));
    else toast.error('Failed to delete image');
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={isEdit ? `/dashboard/products/${product.id}` : '/dashboard/products'}
          className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <h1 className="font-display text-2xl text-gray-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide text-amber-700">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
            <input name="name" required defaultValue={product?.name}
              placeholder="e.g. Classic Kraft Shopping Bag"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select name="categoryId" required defaultValue={product?.categoryId || ''}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 outline-none bg-white">
              <option value="">Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea name="description" rows={3} defaultValue={product?.description || ''}
              placeholder="Product description..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none resize-none" />
          </div>
        </div>

        {/* Specs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-amber-700">Specifications</h2>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'width', label: 'Width (inch)', val: product?.width },
              { name: 'height', label: 'Height (inch)', val: product?.height },
              { name: 'gusset', label: 'Gusset (inch)', val: product?.gusset },
            ].map(({ name, label, val }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type="number" step="0.1" name={name} defaultValue={val || ''}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-amber-400 outline-none" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">GSM</label>
              <input type="number" name="gsm" defaultValue={product?.gsm || ''}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-amber-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">MOQ (pieces)</label>
              <input type="number" name="moq" defaultValue={product?.moq || ''}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-amber-400 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
              <select name="material" defaultValue={product?.material || ''}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-amber-400 outline-none bg-white">
                <option value="">Select material</option>
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Handle Type</label>
              <select name="handleType" defaultValue={product?.handleType || ''}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-amber-400 outline-none bg-white">
                <option value="">Select handle type</option>
                {HANDLE_TYPES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-amber-700">Product Images</h2>
          
          {!isEdit && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-2.5 border border-amber-100">
              💡 Save the product first, then add images from the edit page.
            </p>
          )}

          {isEdit && (
            <>
              <div className="flex flex-wrap gap-3">
                {images.map(img => (
                  <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                    <Image src={img.imageUrl} alt="" fill className="object-cover" />
                    <button type="button" onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-amber-400 hover:bg-amber-50 transition-all group">
                  {uploading ? <Loader2 className="w-5 h-5 text-amber-500 animate-spin" /> : (
                    <><Upload className="w-5 h-5 text-gray-400 group-hover:text-amber-500" /><span className="text-[10px] text-gray-400">Add</span></>
                  )}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => e.target.files && handleImageUpload(e.target.files)} />
            </>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 disabled:opacity-60 transition-colors shadow-md">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
        </button>
      </form>
    </div>
  );
}
