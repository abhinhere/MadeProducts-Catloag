'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { deleteProduct } from '@/app/actions/products';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Filter, Package, Trash2, Edit, ChevronLeft, ChevronRight, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string; name: string; categoryId: string;
  gsm?: number | null; material?: string | null; handleType?: string | null;
  moq?: number | null; updatedAt: Date;
  category: { name: string };
  images: { imageUrl: string }[];
  priceSlabs: { quantity: number; price: string }[];
}

interface Props {
  products: Product[];
  categories: { id: string; name: string }[];
  total: number; pages: number; currentPage: number;
  isAdmin: boolean;
  searchParams: { search?: string; categoryId?: string; material?: string; handleType?: string };
}

export function ProductsClient({ products, categories, total, pages, currentPage, isAdmin, searchParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function updateSearch(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { ...searchParams, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) sp.set(k, v); });
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const result = await deleteProduct(id);
    if (result?.error) toast.error(result.error);
    else toast.success('Product deleted');
    setDeleting(null);
  }

  const hasFilters = searchParams.search || searchParams.categoryId || searchParams.material || searchParams.handleType;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{total.toLocaleString()} items</p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/products/new" className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Add Product</span>
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="Search products..." defaultValue={searchParams.search}
              onChange={e => updateSearch({ search: e.target.value || undefined })}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters || hasFilters ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <Filter className="w-4 h-4" /><span className="hidden sm:inline">Filters</span>
            {hasFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-gray-50">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
              <select defaultValue={searchParams.categoryId || ''} onChange={e => updateSearch({ categoryId: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-amber-400 outline-none bg-white">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Material</label>
              <input type="text" placeholder="e.g. Kraft" defaultValue={searchParams.material || ''}
                onChange={e => updateSearch({ material: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-amber-400 outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Handle Type</label>
              <select defaultValue={searchParams.handleType || ''} onChange={e => updateSearch({ handleType: e.target.value || undefined })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-amber-400 outline-none bg-white">
                <option value="">All Types</option>
                {['Twisted Handle','Flat Handle','Ribbon Handle','No Handle'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {hasFilters && (
              <div className="flex items-end">
                <button onClick={() => { updateSearch({ search: undefined, categoryId: undefined, material: undefined, handleType: undefined }); setShowFilters(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-100 transition-colors w-full justify-center">
                  <X className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-700 mb-1">No products found</h3>
          <p className="text-sm text-gray-400">{hasFilters ? 'Try adjusting your filters' : 'Add your first product to get started'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover animate-fade-in group" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
              <Link href={`/dashboard/products/${product.id}`}>
                <div className="aspect-square bg-amber-50 relative overflow-hidden">
                  {product.images[0] ? (
                    <Image src={product.images[0].imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-amber-200" /></div>
                  )}
                </div>
              </Link>
              <div className="p-3.5">
                <Link href={`/dashboard/products/${product.id}`}>
                  <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 hover:text-amber-700 transition-colors mb-1">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{product.category.name}</span>
                </div>
                {product.gsm && <p className="text-xs text-gray-400 mb-2">{product.gsm} GSM · {product.material}</p>}
                {product.priceSlabs[0] && (
                  <div className="bg-amber-50 rounded-lg px-2.5 py-1.5 mb-3">
                    <p className="text-xs text-amber-600">From</p>
                    <p className="font-bold text-amber-800 text-sm">{formatCurrency(parseFloat(product.priceSlabs[0].price))}<span className="text-xs font-normal text-amber-600">/{product.priceSlabs[0].quantity} pcs</span></p>
                  </div>
                )}
                {isAdmin && (
                  <div className="flex gap-2 pt-2 border-t border-gray-50">
                    <Link href={`/dashboard/products/${product.id}/edit`} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button onClick={() => handleDelete(product.id, product.name)} disabled={deleting === product.id}
                      className="flex items-center justify-center p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg border border-gray-100 transition-colors disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Link href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams).filter(([,v]) => v !== undefined) as [string,string][]), page: String(currentPage - 1) })}`}
            className={`p-2 rounded-lg border ${currentPage <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-50'} border-gray-200`}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm text-gray-600 px-2">Page {currentPage} of {pages}</span>
          <Link href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams).filter(([,v]) => v !== undefined) as [string,string][]), page: String(currentPage + 1) })}`}
            className={`p-2 rounded-lg border ${currentPage >= pages ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-50'} border-gray-200`}>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
