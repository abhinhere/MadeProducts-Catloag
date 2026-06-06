import { getCurrentUser } from '@/app/actions/auth';
import { getPriceHistory } from '@/app/actions/pricing';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { TrendingUp, Clock, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function PriceHistoryPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') redirect('/dashboard');

  const history = await getPriceHistory();

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl text-gray-900">Price History</h1>
        <p className="text-sm text-gray-500">{history.length} records</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No price changes recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {history.map((h, i) => {
              const newP = parseFloat(h.newPrice.toString());
              const oldP = h.oldPrice ? parseFloat(h.oldPrice.toString()) : null;
              const isIncrease = oldP !== null && newP > oldP;
              const isDecrease = oldP !== null && newP < oldP;

              return (
                <div
                  key={h.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    h.action === 'CREATE' ? 'bg-green-100' :
                    h.action === 'DELETE' ? 'bg-red-100' :
                    isIncrease ? 'bg-red-100' :
                    isDecrease ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    {h.action === 'CREATE' ? <ArrowUpRight className="w-4 h-4 text-green-700" /> :
                     h.action === 'DELETE' ? <Minus className="w-4 h-4 text-red-600" /> :
                     isIncrease ? <ArrowUpRight className="w-4 h-4 text-red-600" /> :
                     isDecrease ? <ArrowDownRight className="w-4 h-4 text-green-700" /> :
                     <Minus className="w-4 h-4 text-gray-500" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{h.product.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <p className="text-xs text-gray-500">
                        {h.quantity.toLocaleString('en-IN')} pieces
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        h.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                        h.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {h.action}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(h.changedAt)} · by {h.changedBy.name}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(newP)}</p>
                    {oldP !== null && (
                      <p className={`text-xs mt-0.5 ${isIncrease ? 'text-red-400' : isDecrease ? 'text-green-500' : 'text-gray-400'}`}>
                        {isIncrease && '↑ '}
                        {isDecrease && '↓ '}
                        <span className="line-through">{formatCurrency(oldP)}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
