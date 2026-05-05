import { useState } from 'react';
import { FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { mockTickets } from '../../data/adminMockData';

const MARKETS = ['All Markets', 'Corners', 'Total Goals', 'BTTS', 'Total Cards', 'Shots', 'Fouls', 'Penalty', 'Throw Ins'];
const PER_PAGE = 10;

export default function AllPredictions() {
  const { addToast } = useToast();
  const [tickets, setTickets]       = useState(mockTickets);
  const [market, setMarket]         = useState('All Markets');
  const [ticketSearch, setTicketSearch] = useState('');
  const [predSearch, setPredSearch] = useState('');
  const [selected, setSelected]     = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage]             = useState(1);

  const filtered = tickets.filter(t => {
    const mkt = market === 'All Markets' ? true : t.market === market;
    const tkn = !ticketSearch || t.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase());
    const prd = !predSearch   || String(t.prediction).includes(predSearch);
    return mkt && tkn && prd;
  });

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(t => t.id));

  const handleDelete = (ids = selected) => {
    setTickets(prev => prev.filter(t => !ids.includes(t.id)));
    setSelected([]);
    addToast(`${ids.length} ticket${ids.length > 1 ? 's' : ''} deleted`, 'success');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[#1A1A2E]">Prediction Management</h1>
        <p className="text-sm text-gray-500">Manage all user ticket predictions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select value={market} onChange={e => setMarket(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4D8F]">
            {MARKETS.map(m => <option key={m}>{m}</option>)}
          </select>

          <input value={ticketSearch} onChange={e => setTicketSearch(e.target.value)}
            placeholder="Ticket number…"
            className="border border-gray-200 rounded px-3 py-2 text-sm w-36 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />

          <input value={predSearch} onChange={e => setPredSearch(e.target.value)}
            placeholder="Prediction…"
            className="border border-gray-200 rounded px-3 py-2 text-sm w-28 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />

          {selected.length > 0 && (
            <button onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1.5 border border-red-400 text-red-500 rounded px-3 py-2 text-sm hover:bg-red-50 transition-colors">
              <FiTrash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}

          <button className="bg-[#F5C518] text-gray-900 px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5">
            <FiSearch className="w-4 h-4" /> Search
          </button>

          <span className="text-gray-400 text-sm ml-auto">{filtered.length} items</span>
        </div>

        {/* Table */}
        {paginated.length === 0 ? <EmptyState message="No predictions found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300 cursor-pointer" />
                  </th>
                  <th className="text-left py-3">Match</th>
                  <th className="text-left py-3">Market</th>
                  <th className="text-left py-3">Prediction</th>
                  <th className="text-left py-3">Ticket Number</th>
                  <th className="text-left py-3 hidden md:table-cell">User</th>
                  <th className="text-left py-3 hidden lg:table-cell">Date</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(t => (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)}
                        className="rounded border-gray-300 cursor-pointer" />
                    </td>
                    <td className="py-4 pr-4">
                      <p className="text-[#1A4D8F] font-medium text-sm hover:underline cursor-pointer">{t.match}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <button onClick={() => handleDelete([t.id])} className="text-red-500 hover:underline flex items-center gap-1">
                          <FiTrash2 className="w-3 h-3" /> Trash
                        </button>
                        <span className="text-gray-300">|</span>
                        <button className="text-blue-600 hover:underline flex items-center gap-1">
                          <FiEye className="w-3 h-3" /> View
                        </button>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-[#1A4D8F] text-sm">{t.market}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-semibold text-[#1A1A2E]">{t.prediction}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-[#1A4D8F] text-sm hover:underline cursor-pointer">{t.ticketNumber}</span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-[#1A4D8F] text-sm">{t.user}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <p className="text-xs text-gray-500">Purchased</p>
                      <p className="text-xs text-gray-400">{t.purchasedAt}</p>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} />
    </div>
  );
}
