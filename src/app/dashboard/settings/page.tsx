'use client';
import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '@/app/actions/settings';
import { Settings as SettingsIcon, Save, Loader2, Building2, Phone, MessageCircle, MapPin, MessageSquare, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Settings {
  id: string;
  companyName: string;
  companyLogo?: string | null;
  companyPhone?: string | null;
  companyWhatsapp?: string | null;
  companyAddress?: string | null;
  shareFooter?: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then(s => setSettings(s));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);
    if (result?.error) toast.error(result.error);
    else {
      toast.success('Settings saved successfully');
      getSettings().then(s => setSettings(s));
    }
    setSaving(false);
  }

  if (!settings) {
    return (
      <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="font-display text-2xl text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage company information and sharing preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-sm text-amber-700 uppercase tracking-wide">Company Information</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
            <input
              name="companyName"
              defaultValue={settings.companyName}
              required
              placeholder="Your Company Name"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Company Address</span>
            </label>
            <textarea
              name="companyAddress"
              defaultValue={settings.companyAddress || ''}
              rows={3}
              placeholder="Full company address..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none resize-none"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-sm text-amber-700 uppercase tracking-wide">Contact Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
              </label>
              <input
                name="companyPhone"
                defaultValue={settings.companyPhone || ''}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp Number</span>
              </label>
              <input
                name="companyWhatsapp"
                defaultValue={settings.companyWhatsapp || ''}
                placeholder="+919876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Include country code, no spaces (e.g. +919876543210)</p>
            </div>
          </div>
        </div>

        {/* Share Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-sm text-amber-700 uppercase tracking-wide">WhatsApp Share Settings</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Share Message Footer</label>
            <textarea
              name="shareFooter"
              defaultValue={settings.shareFooter || ''}
              rows={3}
              placeholder="e.g. For bulk orders & custom printing, contact us! Minimum order quantities apply."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-400 focus:ring-2 focus:ring-amber-50 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">This text appears at the bottom of every shared product message</p>
          </div>

          {/* Preview */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-xs font-medium text-green-800 mb-2 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> Message Preview
            </p>
            <div className="text-xs text-green-700 font-mono leading-relaxed whitespace-pre-line">
              {`*${settings.companyName.toUpperCase()}*\n\n*PRODUCT NAME*\n\n📐 *Size:* 10 x 12 x 4 Inch\n📦 *Material:* 120 GSM White Kraft\n🖐 *Handle:* Twisted Handle\n📊 *MOQ:* 500 Pieces\n\n*💰 Pricing:*\n• 500 Nos — ₹8.50\n• 1000 Nos — ₹7.90`}
              {settings.companyWhatsapp ? `\n\n*📞 For Enquiry:*\nwa.me/${settings.companyWhatsapp.replace(/\D/g, '')}` : ''}
              {settings.shareFooter ? `\n\n${settings.shareFooter}` : ''}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 disabled:opacity-60 transition-colors shadow-md"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
