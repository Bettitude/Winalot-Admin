import { useState } from 'react';
import { FiTrash2, FiSearch } from 'react-icons/fi';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { useToast } from '../context/ToastContext';
import { mockTransactions } from '../data/adminMockData';

const STATUSES = ['All Status', 'Successful', 'Failed'];
const PER_PAGE  = 10;

export default function Transactions() {
  const { addToast } = useToast();
  const [txns, setTxns]       = useState(mockTransactions);
  const [status, setStatus]   = useState('All Status');
  const [txSearch, setTxSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage]       = useState(1);

  const filtered = txns.filter(t => {
    const st = status === 'All Status' ? true : t.status.toLowerCase() === status.toLowerCase();
    const sc = !txSearch || t.reference.toLowerCase().includes(txSearch.toLowerCase());
    return st && sc;
  });

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(t => t.id));

  const handleDelete = (ids = selected) => {
    setTxns(prev => prev.filter(t => !ids.includes(t.id)));
    setSelected([]);
    addToast(`${ids.length} transaction${ids.length > 1 ? 's' : ''} deleted`, 'success');
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[#1A1A2E]">Transactions</h1>
        <p className="text-sm text-gray-500">Review all payment transactions</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4D8F]">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>

          <input value={txSearch} onChange={e => setTxSearch(e.target.value)}
            placeholder="Transaction ID…"
            className="border border-gray-200 rounded px-3 py-2 text-sm w-44 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />

          {selected.length > 0 && (
            <button onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-1.5 border border-red-400 text-red-500 rounded px-3 py-2 text-sm hover:bg-red-50">
              <FiTrash2 className="w-4 h-4" /> Delete ({selected.length})
            </button>
          )}

          <button className="bg-[#F5C518] text-gray-900 px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5">
            <FiSearch className="w-4 h-4" /> Search
          </button>

          <span className="text-gray-400 text-sm ml-auto">{filtered.length} items</span>
        </div>

        {/* Table */}
        {paginated.length === 0 ? <EmptyState message="No transactions found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300 cursor-pointer" />
                  </th>
                  <th className="text-left py-3">Transaction ID</th>
                  <th className="text-left py-3 hidden md:table-cell">Ticket Number</th>
                  <th className="text-left py-3">User</th>
                  <th className="text-left py-3">Amount Paid</th>
                  <th className="text-left py-3 hidden lg:table-cell">Date Added</th>
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
                    <td className="py-4">
                      <span className="text-[#1A4D8F] hover:underline cursor-pointer text-sm font-medium">{t.reference}</span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-xs text-gray-600">{t.ticketNumber}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-[#1A4D8F] hover:underline cursor-pointer text-sm">{t.user}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-bold text-[#1A1A2E]">{t.amount}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{t.dateAdded}</span>
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
