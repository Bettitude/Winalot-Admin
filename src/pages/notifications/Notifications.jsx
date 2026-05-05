import { useState } from 'react';
import { FiTrash2, FiSearch, FiEdit2, FiPlus, FiSend } from 'react-icons/fi';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import PushNotificationFlow from '../../components/notifications/PushNotificationModals';
import { useToast } from '../../context/ToastContext';
import { mockTemplates, mockNotifHistory } from '../../data/adminMockData';

const PER_PAGE = 10;

export default function Notifications() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('templates');

  // Templates state
  const [templates, setTemplates] = useState(mockTemplates);
  const [tmplSelected, setTmplSelected] = useState([]);
  const [tmplConfirm, setTmplConfirm]   = useState(false);
  const [tmplIdSearch, setTmplIdSearch] = useState('');
  const [tmplTitleSearch, setTmplTitleSearch] = useState('');
  const [tmplMsgSearch, setTmplMsgSearch] = useState('');
  const [pushTemplate, setPushTemplate] = useState(null);
  const [tmplPage, setTmplPage] = useState(1);

  // History state
  const [history, setHistory] = useState(mockNotifHistory);
  const [histSelected, setHistSelected] = useState([]);
  const [histConfirm, setHistConfirm]   = useState(false);
  const [histPage, setHistPage] = useState(1);

  // User search
  const [userSearch, setUserSearch] = useState('');

  // ── Templates ──────────────────────────────────────────────────────────────
  const filteredTmpls = templates.filter(t => {
    const id    = !tmplIdSearch    || t.id.includes(tmplIdSearch);
    const title = !tmplTitleSearch || t.title.toLowerCase().includes(tmplTitleSearch.toLowerCase());
    const msg   = !tmplMsgSearch   || t.message.toLowerCase().includes(tmplMsgSearch.toLowerCase());
    return id && title && msg;
  });
  const paginatedTmpls  = filteredTmpls.slice((tmplPage - 1) * PER_PAGE, tmplPage * PER_PAGE);
  const tmplTotalPages  = Math.ceil(filteredTmpls.length / PER_PAGE);

  const toggleTmpl = (id) => setTmplSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAllTmpls = () => setTmplSelected(s => s.length === paginatedTmpls.length ? [] : paginatedTmpls.map(t => t.id));
  const deleteTmpls = (ids = tmplSelected) => {
    setTemplates(prev => prev.filter(t => !ids.includes(t.id)));
    setTmplSelected([]);
    addToast(`${ids.length} template${ids.length > 1 ? 's' : ''} deleted`, 'success');
  };

  // ── History ────────────────────────────────────────────────────────────────
  const filteredHist = history.filter(h => !userSearch || h.recipient.toLowerCase().includes(userSearch.toLowerCase()));
  const paginatedHist = filteredHist.slice((histPage - 1) * PER_PAGE, histPage * PER_PAGE);
  const histTotalPages = Math.ceil(filteredHist.length / PER_PAGE);

  const toggleHist = (id) => setHistSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const deleteHist = (ids = histSelected) => {
    setHistory(prev => prev.filter(h => !ids.includes(h.id)));
    setHistSelected([]);
    addToast(`${ids.length} record${ids.length > 1 ? 's' : ''} deleted`, 'success');
  };

  const highlightPlaceholders = (text) => {
    return text.replace(/\[([^\]]+)\]/g, '<strong class="text-[#1A4D8F]">[$1]</strong>');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black text-[#1A1A2E]">Notifications</h1>
          <p className="text-sm text-gray-500">Manage templates and notification history</p>
        </div>

        {/* User search + item count */}
        <div className="flex items-center gap-2">
          <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
            placeholder="Search users…"
            className="border border-gray-200 rounded px-3 py-2 text-sm w-44 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
          <button className="bg-[#F5C518] text-gray-900 p-2 rounded">
            <FiSearch className="w-4 h-4" />
          </button>
          <span className="text-gray-400 text-sm">{templates.length + history.length} items</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-0 border-b border-gray-100 px-5">
          <button onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'templates' ? 'border-[#1A4D8F] text-[#1A4D8F]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            Message Templates
            <span className="bg-blue-100 text-[#1A4D8F] text-xs font-bold px-1.5 py-0.5 rounded-full">{templates.length.toString().padStart(2,'0')}</span>
          </button>
          <button onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-[#1A4D8F] text-[#1A4D8F]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            Notifications History
            <span className="bg-blue-100 text-[#1A4D8F] text-xs font-bold px-1.5 py-0.5 rounded-full">{history.length.toString().padStart(2,'0')}</span>
          </button>
        </div>

        {/* ── Templates tab ─────────────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <>
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
              <input value={tmplIdSearch} onChange={e => setTmplIdSearch(e.target.value)}
                placeholder="ID…" className="border border-gray-200 rounded px-3 py-2 text-sm w-24 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
              <input value={tmplTitleSearch} onChange={e => setTmplTitleSearch(e.target.value)}
                placeholder="Title…" className="border border-gray-200 rounded px-3 py-2 text-sm w-36 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
              <input value={tmplMsgSearch} onChange={e => setTmplMsgSearch(e.target.value)}
                placeholder="Message…" className="border border-gray-200 rounded px-3 py-2 text-sm w-44 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />
              {tmplSelected.length > 0 && (
                <button onClick={() => setTmplConfirm(true)}
                  className="flex items-center gap-1.5 border border-red-400 text-red-500 rounded px-3 py-2 text-sm hover:bg-red-50">
                  <FiTrash2 className="w-4 h-4" /> Delete ({tmplSelected.length})
                </button>
              )}
            </div>

            {paginatedTmpls.length === 0 ? <EmptyState message="No templates found" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                      <th className="w-10 px-5 py-3">
                        <input type="checkbox" checked={tmplSelected.length === paginatedTmpls.length && paginatedTmpls.length > 0}
                          onChange={toggleAllTmpls} className="rounded border-gray-300 cursor-pointer" />
                      </th>
                      <th className="text-left py-3 w-24">ID</th>
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
                          <p className="text-[#1A4D8F] font-medium hover:underline cursor-pointer text-sm">{t.id}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                            <button className="text-blue-600 hover:underline flex items-center gap-0.5"><FiEdit2 className="w-3 h-3" /> Edit</button>
                            <span className="text-gray-300">|</span>
                            <button className="text-[#1A4D8F] hover:underline flex items-center gap-0.5"><FiPlus className="w-3 h-3" /> Add new</button>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="text-sm text-gray-700 font-medium">{t.title}</span>
                        </td>
                        <td className="py-4 pr-4 max-w-xs">
                          <p className="text-xs text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: highlightPlaceholders(t.message) }} />
                        </td>
                        <td className="py-4 pr-5">
                          <button
                            onClick={() => setPushTemplate(t)}
                            className="flex items-center gap-1.5 border border-green-500 text-green-600 rounded px-3 py-1.5 text-xs font-semibold hover:bg-green-50 transition-colors whitespace-nowrap"
                          >
                            <FiSend className="w-3.5 h-3.5" /> Push Notification
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

        {/* ── History tab ────────────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <>
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
              {histSelected.length > 0 && (
                <button onClick={() => setHistConfirm(true)}
                  className="flex items-center gap-1.5 border border-red-400 text-red-500 rounded px-3 py-2 text-sm hover:bg-red-50">
                  <FiTrash2 className="w-4 h-4" /> Delete ({histSelected.length})
                </button>
              )}
            </div>

            {paginatedHist.length === 0 ? <EmptyState message="No notification history" /> : (
              <div className="divide-y divide-gray-100">
                {paginatedHist.map(h => (
                  <div key={h.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={histSelected.includes(h.id)} onChange={() => toggleHist(h.id)}
                        className="rounded border-gray-300 cursor-pointer mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {h.title}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
                            <span className="text-[#1A4D8F] font-medium">{h.recipient}</span>
                            <span>{h.sentAt}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightPlaceholders(h.message) }} />
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

      {/* Confirm dialogs */}
      <ConfirmDialog open={tmplConfirm} onClose={() => setTmplConfirm(false)} onConfirm={deleteTmpls} />
      <ConfirmDialog open={histConfirm} onClose={() => setHistConfirm(false)} onConfirm={() => deleteHist(histSelected)} />

      {/* Push notification 3-step flow */}
      {pushTemplate && (
        <PushNotificationFlow template={pushTemplate} onClose={() => setPushTemplate(null)} />
      )}
    </div>
  );
}
