'use client';
import { useState, useEffect, useTransition } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/categories';
import { Tag, Plus, Edit, Trash2, Package, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  createdAt: Date;
  _count?: { products: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isPending, startTransition] = useTransition();

  async function load() {
    const cats = await getCategories();
    setCategories(cats as Category[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    startTransition(async () => {
      const result = await createCategory(newName.trim());
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Category created');
        setNewName('');
        load();
      }
    });
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    const result = await updateCategory(id, editName.trim());
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Category updated');
      setEditId(null);
      load();
    }
  }

  async function handleDelete(id: string, name: string, count: number) {
    if (count > 0) {
      toast.error(`Cannot delete: ${count} products use this category`);
      return;
    }
    if (!confirm(`Delete category "${name}"?`)) return;
    const result = await deleteCategory(id);
    if (result?.error) toast.error(result.error);
    else {
      toast.success('Category deleted');
      load();
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 skeleton rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} total</p>
        </div>
      </div>

      {/* Add new */}
      <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3">Add New Category</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Kraft Paper Bags"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none"
          />
          <button
            type="submit"
            disabled={isPending || !newName.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </div>
      </form>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No categories yet. Add your first one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-amber-600" />
                </div>

                {editId === cat.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-amber-300 text-sm outline-none focus:ring-2 focus:ring-amber-100"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleUpdate(cat.id);
                        if (e.key === 'Escape') setEditId(null);
                      }}
                    />
                    <button onClick={() => handleUpdate(cat.id)} className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-lg">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Package className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{cat._count?.products ?? 0} products</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name, cat._count?.products ?? 0)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
