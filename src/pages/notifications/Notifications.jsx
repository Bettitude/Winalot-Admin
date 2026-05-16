import { useState, useEffect, useCallback } from 'react';
import { FiTrash2, FiSearch, FiEdit2, FiPlus, FiSend, FiRefreshCw } from 'react-icons/fi';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import PushNotificationFlow from '../../components/notifications/PushNotificationModals';
import { useToast } from '../../context/ToastContext';
import { notificationsApi } from '../../services/api';

const PER_PAGE = 10;

export default function Notifications() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');

  // Templates
  const [templates, setTemplates]         = useState([]);
  const [tmplLoading, setTmplLoading]     = useState(true);
  const [tmplSelected, setTmplSelected]   = useState([]);
  const [tmplConfirm, setTmplConfirm]     = useState(false);
  const [tmplIdSearch, setTmplIdSearch]   = useState('');
  const [tmplTitleSearch, setTmplTitleSearch] = useState('');
  const [pushTemplate, setPushTemplate]   = useState(null);
  const [tmplPage, setTmplPage]           = useState(1);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTmpl, setNewTmpl]             = useState({ title: '', message: '' });
  const [savingTmpl, setSavingTmpl]       = useState(false);

  // History
  const [history, setHistory]             = useState([]);
  const [histLoading, setHistLoading]     = useState(true);
  const [histPage, setHistPage]           = useState(1);
  const [userSearch, setUserSearch]       = useState('');

  const fetchTemplates = useCallback(async () => {
    setTmplLoading(true);
    try {
      const res = await notificationsApi.templates();
      setTemplates(res.data?.templates || []);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load templates', 'error');
    } finally {
      setTmplLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const res = await notificationsApi.history();
      setHistory(res.data?.history || []);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to load history', 'error');
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  useEffect(() => { if (activeTab === 'history') fetchHistory(); }, [activeTab, fetchHistory]);

  const handleSaveTemplate = async () => {
    if (!newTmpl.title.trim() || !newTmpl.message.trim()) { addToast('Title and message required', 'error'); return; }
    setSavingTmpl(true);
    try {
      await notificationsApi.createTemplate(newTmpl);
      addToast('Template created', 'success');
      setNewTmpl({ title: '', message: '' });
      setShowNewTemplate(false);
      fetchTemplates();
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create template', 'error');
    } finally {
      setSavingTmpl(false);
    }
  };

  // Client-side filter of templates
  const filteredTmpls = templates.filter(t => {
    const id    = !tmplIdSearch    || (t.id || '').includes(tmplIdSearch);
    const title = !tmplTitleSearch || t.title.toLowerCase().includes(tmplTitleSearch.toLowerCase());
    return id && title;
  });
  const paginatedTmpls = filteredTmpls.slice((tmplPage - 1) * PER_PAGE, tmplPage * PER_PAGE);
  const tmplTotalPages = Math.ceil(filteredTmpls.length / PER_PAGE);

  const toggleTmpl = (id) => setTmplSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAllTmpls = () => setTmplSelected(s => s.length === paginatedTmpls.length ? [] : paginatedTmpls.map(t => t.id));

  // History filter
  const filteredHist = history.filter(h => !userSearch || (h.sent_by_username || '').toLowerCase().includes(userSearch.toLowerCase()));
  const paginatedHist = filteredHist.slice((histPage - 1) * PER_PAGE, histPage * PER_PAGE);
  const histTotalPages = Math.ceil(filteredHist.length / PER_PAGE);

  const highlightPlaceholders = (text) =>
    (text || '').replace(/\[([^\]]+)\]/g, '<strong class="text-[#1A4D8F]">[$1]</strong>');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Notifications</h1>
          <p className="text-sm text-gray-500">Manage templates and notification history</p>
        </div>
        <div className="flex items-center gap-2">
          <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by sender…"
            className="border border-gray-200 rounded px-3 py-2 text-sm w-44 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
          <button className="bg-[#F5C518] text-gray-900 p-2 rounded"><FiSearch className="w-4 h-4" /></button>
          <button onClick={() => activeTab === 'templates' ? fetchTemplates() : fetchHistory()}
            className="p-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50">
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <span className="text-gray-400 text-sm">{(templates.length + history.length)} items</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-0 border-b border-gray-100 px-5">
          {['templates', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab ? 'border-[#1A4D8F] text-[#1A4D8F]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab === 'templates' ? 'Message Templates' : 'Notifications History'}
              <span className="bg-blue-100 text-[#1A4D8F] text-xs font-bold px-1.5 py-0.5 rounded-full">
                {tab === 'templates' ? String(templates.length).padStart(2, '0') : String(history.length).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>

        {/* ── Templates ─────────────────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <>
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <input value={tmplIdSearch} onChange={e => setTmplIdSearch(e.target.value)}
                placeholder="ID…" className="border border-gray-200 rounded px-3 py-2 text-sm w-24 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
              <input value={tmplTitleSearch} onChange={e => setTmplTitleSearch(e.target.value)}
                placeholder="Title…" className="border border-gray-200 rounded px-3 py-2 text-sm w-36 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
              {tmplSelected.length > 0 && (
                <button onClick={() => setTmplConfirm(true)}
                  className="flex items-center gap-1.5 border border-red-400 text-red-500 rounded px-3 py-2 text-sm hover:bg-red-50">
                  <FiTrash2 className="w-4 h-4" /> Delete ({tmplSelected.length})
                </button>
              )}
              <button onClick={() => setShowNewTemplate(v => !v)}
                className="flex items-center gap-1.5 border border-[#1A4D8F] text-[#1A4D8F] rounded px-3 py-2 text-sm hover:bg-blue-50 ml-auto">
                <FiPlus className="w-4 h-4" /> New Template
              </button>
            </div>

            {/* New template form */}
            {showNewTemplate && (
              <div className="px-5 py-4 border-b border-gray-100 bg-blue-50 space-y-3">
                <h3 className="text-sm font-bold text-[#1A1A2E]">New Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={newTmpl.title} onChange={e => setNewTmpl(p => ({ ...p, title: e.target.value }))}
                    placeholder="Title *"
                    className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A4D8F]" />
                  <input value={newTmpl.message} onChange={e => setNewTmpl(p => ({ ...p, message: e.target.value }))}
                    placeholder="Message *"
                    className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A4D8F]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveTemplate} disabled={savingTmpl}
                    className="bg-[#1A4D8F] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#0D2B5E] disabled:opacity-60">
                    {savingTmpl ? 'Saving…' : 'Save Template'}
                  </button>
                  <button onClick={() => setShowNewTemplate(false)}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {tmplLoading ? (
              <div className="py-12 text-center"><div className="w-7 h-7 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full spinner mx-auto" /></div>
            ) : paginatedTmpls.length === 0 ? <EmptyState message="No templates found" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                      <th className="w-10 px-5 py-3">
                        <input type="checkbox" checked={tmplSelected.length === paginatedTmpls.length && paginatedTmpls.length > 0}
                          onChange={toggleAllTmpls} className="rounded border-gray-300 cursor-pointer" />
                      </th>
                      <th className="text-left py-3 w-28">ID</th>
                      <th className="text-left py-3">Title</th>
                      <th className="text-left py-3">Message</th>
                      <th className="text-left py-3 w-40">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTmpls.map(t => (
                      <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <input type="checkbox" checked={tmplSelected.includes(t.id)} onChange={() => toggleTmpl(t.id)}
                            className="rounded border-gray-300 cursor-pointer" />
                        </td>
                        <td className="py-4 pr-4">
                          <p className="text-[#1A4D8F] font-medium text-xs truncate max-w-[100px]">{t.id}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                            <button className="text-blue-600 hover:underline flex items-center gap-0.5"><FiEdit2 className="w-3 h-3" /> Edit</button>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-gray-700 font-medium">{t.title}</span>
                        </td>
                        <td className="py-4 pr-4 max-w-xs">
                          <p className="text-xs text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: highlightPlaceholders(t.message) }} />
                        </td>
                        <td className="py-4 pr-5">
                          <button onClick={() => setPushTemplate(t)}
                            className="flex items-center gap-1.5 border border-green-500 text-green-600 rounded px-3 py-1.5 text-xs font-semibold hover:bg-green-50 whitespace-nowrap">
                            <FiSend className="w-3.5 h-3.5" /> Push
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={tmplPage} totalPages={tmplTotalPages} onChange={setTmplPage} />
          </>
        )}

        {/* ── History ────────────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <>
            {histLoading ? (
              <div className="py-12 text-center"><div className="w-7 h-7 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full spinner mx-auto" /></div>
            ) : paginatedHist.length === 0 ? <EmptyState message="No notification history" /> : (
              <div className="divide-y divide-gray-100">
                {paginatedHist.map(h => (
                  <div key={h.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">{h.title}</span>
                          <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                            <span className="text-[#1A4D8F] font-medium">{h.sent_by_username || 'Admin'}</span>
                            <span>·</span>
                            <span>{h.recipient_count} recipients</span>
                            <span>·</span>
                            <span>{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightPlaceholders(h.message) }} />
                        <p className="text-xs text-gray-400 mt-1">Channels: {h.channels ? JSON.parse(h.channels).join(', ') : 'in_app'} · Target: {h.target}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Pagination page={histPage} totalPages={histTotalPages} onChange={setHistPage} />
          </>
        )}
      </div>

      <ConfirmDialog open={tmplConfirm} onClose={() => setTmplConfirm(false)}
        onConfirm={() => { addToast('Templates cannot be deleted via API yet', 'info'); setTmplConfirm(false); }} />

      {pushTemplate && (
        <PushNotificationFlow template={pushTemplate} onClose={() => { setPushTemplate(null); fetchHistory(); }} />
      )}
    </div>
  );
}
