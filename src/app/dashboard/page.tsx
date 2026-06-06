import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import { getPriceHistory } from '@/app/actions/pricing';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Package, Tag, Users, TrendingUp, Clock, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const [totalProducts, totalCategories, totalEmployees] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count({ where: { role: 'EMPLOYEE', active: true } }),
  ]);

  const recentHistory = user.role === 'ADMIN'
    ? await getPriceHistory()
    : [];

  const stats = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'amber', href: '/dashboard/products' },
    { label: 'Categories', value: totalCategories, icon: Tag, color: 'orange', href: '/dashboard/categories' },
    ...(user.role === 'ADMIN'
      ? [{ label: 'Employees', value: totalEmployees, icon: Users, color: 'green', href: '/dashboard/employees' }]
      : []),
  ];

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl lg:text-3xl text-gray-900">
          Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user.role === 'ADMIN' ? 'Manage your catalog and pricing' : 'Browse and share products'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }, i) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 shadow-sm card-hover animate-fade-in group"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-700`} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">{label}</p>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Price history (admin only) */}
      {user.role === 'ADMIN' && recentHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in" style={{ animationDelay: '240ms' }}>
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-gray-800 text-sm">Recent Price Updates</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentHistory.slice(0, 8).map((h) => (
              <div key={h.id} className="px-5 py-3 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{h.product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(h.changedAt)} · by {h.changedBy.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-amber-700">{formatCurrency(parseFloat(h.newPrice.toString()))}</p>
                  {h.oldPrice && (
                    <p className="text-xs text-gray-400 line-through">{formatCurrency(parseFloat(h.oldPrice.toString()))}</p>
                  )}
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-1 ${
                    h.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                    h.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {h.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.role === 'EMPLOYEE' && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 animate-fade-in" style={{ animationDelay: '160ms' }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Browse Products</h3>
              <p className="text-sm text-gray-600">Search and filter through our catalog. Share product details directly via WhatsApp.</p>
              <Link
                href="/dashboard/products"
                className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
              >
                View all products <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
