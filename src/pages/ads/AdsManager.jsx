import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiToggleLeft, FiToggleRight,
  FiLink, FiImage, FiLayout, FiRefreshCw, FiEye, FiEyeOff,
} from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { adsApi } from '../../services/api';

const SLOTS = [
  { key: 'leaderboard',   label: 'Leaderboard',    size: '728 × 90',  desc: 'Wide banner between match tabs and content (Match Details page)' },
  { key: 'sidebar_right', label: 'Sidebar Right',  size: '300 × 250', desc: 'Below staking panel on Match Details (right column)' },
  { key: 'sidebar_left',  label: 'Sidebar Left',   size: '240 × 400', desc: 'Below "Other Games" on Match Details (left column)' },
  { key: 'wc_sidebar',    label: 'WC Sidebar',     size: '300 × 200', desc: 'Top of World Cup match detail game list' },
  { key: 'lobby_top',     label: 'Lobby Top',      size: '728 × 90',  desc: 'Top of the main lobby page' },
];

const SLOT_MAP = Object.fromEntries(SLOTS.map(s => [s.key, s]));

// ── Modal ─────────────────────────────────────────────────────────────────────
function AdModal({ ad, onClose, onSaved }) {
  const { addToast } = useToast();
  const isEdit = !!ad?.id;

  const [form, setForm] = useState({
    slot:      ad?.slot      || 'leaderboard',
    title:     ad?.title     || '',
    image_url: ad?.image_url || '',
    link_url:  ad?.link_url  || '',
    bg_color:  ad?.bg_color  || '',
    is_active: ad?.is_active ?? true,
  });
  const [saving,    setSaving]    = useState(false);
  const [preview,   setPreview]   = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim())     { addToast('Title is required', 'error'); return; }
    if (!form.image_url.trim()) { addToast('Image URL is required', 'error'); return; }
    setSaving(true);
    try {
      const data = isEdit
        ? await adsApi.update(ad.id, form)
        : await adsApi.create(form);
      addToast(isEdit ? 'Ad updated' : 'Ad created', 'success');
      onSaved(data.data || { ...form, id: ad?.id });
    } catch (err) {
      addToast(err.response?.data?.error || err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const slotInfo = SLOT_MAP[form.slot];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-800 text-base">{isEdit ? 'Edit Ad' : 'New Ad'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><FiX className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          {/* Slot */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Ad Slot</label>
            <div className="grid grid-cols-1 gap-1.5">
              {SLOTS.map(s => (
                <button key={s.key} type="button" onClick={() => set('slot', s.key)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-left transition-all ${form.slot === s.key ? 'border-[#1A4D8F] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div>
                    <p className={`text-xs font-bold ${form.slot === s.key ? 'text-[#1A4D8F]' : 'text-gray-700'}`}>{s.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ml-3 ${form.slot === s.key ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {s.size}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Internal Title</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Bet365 June Campaign"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <FiImage className="w-3 h-3" /> Image URL
            </label>
            <input type="url" value={form.image_url} onChange={e => set('image_url', e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" required />
            <p className="text-[10px] text-gray-400 mt-1">Host your image on Cloudinary, Imgur, or any CDN. Recommended size: {slotInfo?.size}.</p>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <FiLink className="w-3 h-3" /> Destination URL (optional)
            </label>
            <input type="url" value={form.link_url} onChange={e => set('link_url', e.target.value)}
              placeholder="https://advertiser.com/landing"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" />
          </div>

          {/* BG Color (optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <FiLayout className="w-3 h-3" /> Background Colour (optional)
            </label>
            <div className="flex gap-2 items-center">
              <input type="color" value={form.bg_color || '#ffffff'} onChange={e => set('bg_color', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input type="text" value={form.bg_color} onChange={e => set('bg_color', e.target.value)}
                placeholder="#ffffff or leave blank"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20" />
              {form.bg_color && (
                <button type="button" onClick={() => set('bg_color', '')} className="text-gray-400 hover:text-red-500"><FiX className="w-4 h-4" /></button>
              )}
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Active</p>
              <p className="text-[10px] text-gray-400">Inactive ads are hidden from the site</p>
            </div>
            <button type="button" onClick={() => set('is_active', !form.is_active)}
              className={`transition-colors ${form.is_active ? 'text-green-500' : 'text-gray-300'}`}>
              {form.is_active
                ? <FiToggleRight className="w-8 h-8" />
                : <FiToggleLeft className="w-8 h-8" />}
            </button>
          </div>

          {/* Preview */}
          {form.image_url && (
            <div>
              <button type="button" onClick={() => setPreview(p => !p)}
                className="text-xs font-semibold text-[#1A4D8F] flex items-center gap-1 hover:underline mb-2">
                {preview ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                {preview ? 'Hide preview' : 'Preview ad'}
              </button>
              {preview && (
                <div className="rounded-xl overflow-hidden border border-gray-200"
                  style={form.bg_color ? { backgroundColor: form.bg_color } : {}}>
                  <img src={form.image_url} alt="Preview" className="w-full object-contain max-h-48"
                    onError={e => { e.target.src = 'https://placehold.co/600x200/e5e7eb/9ca3af?text=Image+not+found'; }} />
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1A4D8F] text-white font-bold py-2.5 rounded-xl hover:bg-[#0D2B5E] disabled:opacity-60 text-sm">
              {saving
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><FiSave className="w-4 h-4" /> {isEdit ? 'Save Changes' : 'Create Ad'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdsManager() {
  const { addToast } = useToast();
  const [ads,     setAds]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | 'new' | {ad object}
  const [deleting, setDeleting] = useState(null);
  const [filterSlot, setFilterSlot] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await adsApi.list();
      setAds(d.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load ads', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (updated) => {
    setAds(prev => {
      const idx = prev.findIndex(a => a.id === updated.id);
      if (idx >= 0) {
        const next = [...prev]; next[idx] = updated; return next;
      }
      return [updated, ...prev];
    });
    setModal(null);
  };

  const handleToggle = async (ad) => {
    try {
      const d = await adsApi.update(ad.id, { is_active: !ad.is_active });
      handleSaved(d.data || { ...ad, is_active: !ad.is_active });
      addToast(d.data?.is_active ? 'Ad activated' : 'Ad deactivated', 'success');
    } catch (err) {
      addToast(err.message || 'Toggle failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ad? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await adsApi.remove(id);
      setAds(prev => prev.filter(a => a.id !== id));
      addToast('Ad deleted', 'success');
    } catch (err) {
      addToast(err.message || 'Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = filterSlot === 'all' ? ads : ads.filter(a => a.slot === filterSlot);

  const stats = {
    total:  ads.length,
    active: ads.filter(a => a.is_active).length,
    slots:  new Set(ads.map(a => a.slot)).size,
  };

  return (
    <>
      {modal && (
        <AdModal
          ad={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-gray-800">Ad Manager</h1>
            <p className="text-sm text-gray-500 mt-0.5">Upload and manage banner ads shown across the platform.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Reload">
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setModal('new')}
              className="flex items-center gap-2 bg-[#1A4D8F] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0D2B5E] transition-colors">
              <FiPlus className="w-4 h-4" /> New Ad
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Ads',    value: stats.total,  color: 'text-[#1A4D8F]' },
            { label: 'Active',       value: stats.active, color: 'text-green-600' },
            { label: 'Slots Used',   value: `${stats.slots} / ${SLOTS.length}`, color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Slot reference */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-xs font-black text-blue-600 uppercase tracking-wider mb-2">Available Ad Slots</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SLOTS.map(s => (
              <div key={s.key} className="text-[11px]">
                <span className="font-bold text-gray-700">{s.label}</span>
                <span className="text-gray-400 ml-1">({s.size})</span>
                <p className="text-gray-400 text-[10px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {[{ key: 'all', label: 'All' }, ...SLOTS.map(s => ({ key: s.key, label: s.label }))].map(({ key, label }) => (
            <button key={key} onClick={() => setFilterSlot(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterSlot === key ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {label}
              {key !== 'all' && <span className="ml-1 opacity-60">{ads.filter(a => a.slot === key).length}</span>}
            </button>
          ))}
        </div>

        {/* Ads table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm py-20 text-center">
            <FiImage className="w-10 h-10 mx-auto text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">No ads yet</p>
            <button onClick={() => setModal('new')} className="mt-3 text-sm font-semibold text-[#1A4D8F] hover:underline">
              Create your first ad
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / Slot</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Link</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ad => {
                  const slotInfo = SLOT_MAP[ad.slot];
                  return (
                    <tr key={ad.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Preview thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0"
                          style={ad.bg_color ? { backgroundColor: ad.bg_color } : {}}>
                          <img src={ad.image_url} alt={ad.title}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.src = 'https://placehold.co/80x48/e5e7eb/9ca3af?text=Img'; }} />
                        </div>
                      </td>

                      {/* Title + slot */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-xs">{ad.title}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1A4D8F] border border-blue-100">
                          {slotInfo?.label || ad.slot} · {slotInfo?.size}
                        </span>
                      </td>

                      {/* Link */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {ad.link_url ? (
                          <a href={ad.link_url} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-[#1A4D8F] hover:underline flex items-center gap-1 max-w-[160px] truncate">
                            <FiLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{ad.link_url.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-gray-300 italic">No link</span>
                        )}
                      </td>

                      {/* Status toggle */}
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(ad)}
                          className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${ad.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          {ad.is_active
                            ? <FiEye className="w-3.5 h-3.5" />
                            : <FiEyeOff className="w-3.5 h-3.5" />}
                          {ad.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setModal(ad)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#1A4D8F] hover:bg-blue-50 transition-colors" title="Edit">
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(ad.id)} disabled={deleting === ad.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40" title="Delete">
                            {deleting === ad.id
                              ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              : <FiTrash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
