'use client';
import { useState, useEffect } from 'react';
import { getEmployees, createEmployee, toggleEmployeeStatus, resetEmployeePassword } from '@/app/actions/employees';
import { Users, Plus, UserCheck, UserX, KeyRound, Loader2, X, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: Date;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // New employee form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Reset password form
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  async function load() {
    const emps = await getEmployees();
    setEmployees(emps as Employee[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    setSaving(true);
    const result = await createEmployee(name, email, password);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Employee created successfully');
      setShowAdd(false);
      setName(''); setEmail(''); setPassword('');
      load();
    }
    setSaving(false);
  }

  async function handleToggle(id: string, active: boolean, name: string) {
    const result = await toggleEmployeeStatus(id, !active);
    if (result?.error) toast.error(result.error);
    else {
      toast.success(`${name} ${!active ? 'enabled' : 'disabled'}`);
      load();
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetId || !newPassword) return;
    setSaving(true);
    const result = await resetEmployeePassword(resetId, newPassword);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Password reset successfully');
      setResetId(null);
      setNewPassword('');
    }
    setSaving(false);
  }

  const activeCount = employees.filter(e => e.active).length;

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">{activeCount} active · {employees.length} total</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Employee</span>
        </button>
      </div>

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-gray-900">Add Employee</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-gray-900">Reset Password</h2>
              <button onClick={() => setResetId(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none pr-10"
                  />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-amber-700 text-white rounded-xl text-sm font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {employees.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No employees yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {employees.map((emp, i) => (
              <div
                key={emp.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-amber-800">{emp.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${emp.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {emp.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                  <p className="text-xs text-gray-300">Joined {formatDate(emp.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setResetId(emp.id)}
                    title="Reset password"
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(emp.id, emp.active, emp.name)}
                    title={emp.active ? 'Disable' : 'Enable'}
                    className={`p-2 rounded-lg transition-colors ${emp.active ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                  >
                    {emp.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
