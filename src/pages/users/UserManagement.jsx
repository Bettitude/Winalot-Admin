import { useState } from 'react';
import { FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { mockUsers } from '../../data/adminMockData';

const STATUSES = ['All Status', 'Enabled', 'Disabled', 'Suspended'];
const PER_PAGE = 10;

export default function UserManagement() {
  const { addToast } = useToast();
  const [users, setUsers]     = useState(mockUsers);
  const [status, setStatus]   = useState('All Status');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [selected, setSelected] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage]       = useState(1);

  const filtered = users.filter(u => {
    const st = status === 'All Status' ? true : u.status.toLowerCase() === status.toLowerCase();
    const em = !email || u.email.toLowerCase().includes(email.toLowerCase());
    const ph = !phone || u.phone.includes(phone);
    return st && em && ph;
  });

  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === paginated.length ? [] : paginated.map(u => u.id));

  const handleDelete = (ids = selected) => {
    setUsers(prev => prev.filter(u => !ids.includes(u.id)));
    setSelected([]);
    addToast(`${ids.length} user${ids.length > 1 ? 's' : ''} deleted`, 'success');
  };

  const handleStatusChange = (id, newStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    addToast('User status updated', 'success');
  };

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-[#1A1A2E]">User Management</h1>
        <p className="text-sm text-gray-500">{users.length} registered users</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4D8F]">
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>

          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email…"
            className="border border-gray-200 rounded px-3 py-2 text-sm w-40 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />

          <input value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Phone number…"
            className="border border-gray-200 rounded px-3 py-2 text-sm w-36 focus:outline-none focus:border-[#1A4D8F] placeholder-gray-300" />

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
        {paginated.length === 0 ? <EmptyState message="No users found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100">
                  <th className="w-10 px-5 py-3">
                    <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0}
                      onChange={toggleAll} className="rounded border-gray-300 cursor-pointer" />
                  </th>
                  <th className="text-left py-3">Username</th>
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3 hidden md:table-cell">Email</th>
                  <th className="text-left py-3 hidden lg:table-cell">Phone</th>
                  <th className="text-left py-3 hidden lg:table-cell">Date Added</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u, idx) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)}
                        className="rounded border-gray-300 cursor-pointer" />
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="text-[#1A4D8F] font-semibold text-sm hover:underline cursor-pointer">{u.username}</p>
                          <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                            <FiEye className="w-3 h-3" /> View
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-700">{u.name}</span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="text-[#1A4D8F] text-sm hover:underline cursor-pointer">{u.email}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-600">{u.phone}</span>
                    </td>
                    <td className="py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-500">{u.dateAdded}</span>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={u.status} withChevron onChange={(s) => handleStatusChange(u.id, s)} />
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
