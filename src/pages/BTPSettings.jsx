import { useState, useEffect } from 'react';
import { FiDollarSign, FiSave, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';
import { btpSettingsApi } from '../services/api';

export default function BTPSettings() {
  const { addToast } = useToast();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({
    usd_per_btp:        '',
    min_purchase_btp:   '',
    max_purchase_btp:   '',
    min_withdrawal_btp: '',
    max_withdrawal_btp: '',
    withdrawal_fee_pct: '',
    platform_fee_pct:   '',
    bonus_on_first_deposit: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await btpSettingsApi.get();
      const s   = res.data || {};
      setForm({
        usd_per_btp:            s.usd_per_btp            ?? '',
        min_purchase_btp:       s.min_purchase_btp        ?? '',
        max_purchase_btp:       s.max_purchase_btp        ?? '',
        min_withdrawal_btp:     s.min_withdrawal_btp      ?? '',
        max_withdrawal_btp:     s.max_withdrawal_btp      ?? '',
        withdrawal_fee_pct:     s.withdrawal_fee_pct      ?? '',
        platform_fee_pct:       s.platform_fee_pct        ?? '',
        bonus_on_first_deposit: s.bonus_on_first_deposit  ?? '',
      });
    } catch {
      // settings may not exist yet — keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const d = await btpSettingsApi.update(form);
      if (d.pending) {
        addToast('Submitted for super admin approval', 'info');
      } else {
        addToast('BTP settings saved', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const btpPerUsd = form.usd_per_btp && +form.usd_per_btp > 0
    ? Math.round(1 / +form.usd_per_btp)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">BT Points Settings</h1>
          <p className="text-sm text-gray-500">Configure BTP exchange rate and purchase limits</p>
        </div>
        <button onClick={load} className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Exchange rate card */}
      <div className="bg-[#1A4D8F] rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3">
          <FiDollarSign className="w-5 h-5 text-[#F5C518]" />
          <span className="font-bold text-sm">Current Exchange Rate</span>
        </div>
        {form.usd_per_btp ? (
          <div className="space-y-1">
            <p className="text-3xl font-black">{form.usd_per_btp} USD <span className="text-[#F5C518]">= 1 BTP</span></p>
            {btpPerUsd && (
              <p className="text-blue-200 text-sm">$1 USD buys approximately {btpPerUsd.toLocaleString()} BTP</p>
            )}
          </div>
        ) : (
          <p className="text-blue-200 text-sm">Set a rate below</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {/* Rate */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            USD per 1 BTP *
            <span className="ml-1 text-gray-400 normal-case font-normal">(e.g. 0.01 means 100 BTP = $1)</span>
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="number" step="0.0001" min="0" value={form.usd_per_btp}
              onChange={e => set('usd_per_btp', e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] focus:ring-2 focus:ring-[#1A4D8F]/20"
              placeholder="0.01" />
          </div>
        </div>

        {/* Purchase limits */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Purchase Limits (BTP)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Minimum</label>
              <input type="number" min="0" value={form.min_purchase_btp}
                onChange={e => set('min_purchase_btp', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]"
                placeholder="100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Maximum</label>
              <input type="number" min="0" value={form.max_purchase_btp}
                onChange={e => set('max_purchase_btp', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]"
                placeholder="1000000" />
            </div>
          </div>
        </div>

        {/* Withdrawal limits */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Withdrawal Limits (BTP)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Minimum</label>
              <input type="number" min="0" value={form.min_withdrawal_btp}
                onChange={e => set('min_withdrawal_btp', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]"
                placeholder="500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Maximum</label>
              <input type="number" min="0" value={form.max_withdrawal_btp}
                onChange={e => set('max_withdrawal_btp', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]"
                placeholder="500000" />
            </div>
          </div>
        </div>

        {/* Fee settings */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Fee Settings (%)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Withdrawal Fee %</label>
              <input type="number" step="0.1" min="0" max="100" value={form.withdrawal_fee_pct}
                onChange={e => set('withdrawal_fee_pct', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]"
                placeholder="2.5" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Platform Fee (per draw) %</label>
              <input type="number" step="0.1" min="0" max="100" value={form.platform_fee_pct}
                onChange={e => set('platform_fee_pct', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]"
                placeholder="10" />
            </div>
          </div>
        </div>

        {/* First deposit bonus */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            First Deposit Bonus (BTP)
          </label>
          <input type="number" min="0" value={form.bonus_on_first_deposit}
            onChange={e => set('bonus_on_first_deposit', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] focus:ring-2 focus:ring-[#1A4D8F]/20"
            placeholder="0 (disabled)" />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <FiInfo className="w-3 h-3" />
            Set to 0 to disable the bonus. BTP credited to wallet on first deposit.
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#1A4D8F] text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-[#0D2B5E] transition-colors disabled:opacity-60">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> Saving…</>
              : <><FiSave className="w-4 h-4" /> Save Settings</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
