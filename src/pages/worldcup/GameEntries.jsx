import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiArrowLeft, FiSearch, FiUsers, FiMail, FiCheckCircle,
  FiXCircle, FiRefreshCw, FiList,
} from 'react-icons/fi';
import { wcGamesApi } from '../../services/api';

export default function GameEntries() {
  const [params]  = useSearchParams();
  const fixtureId = params.get('fixture') || '';

  const [matchLabel, setMatchLabel] = useState('');
  const [options,    setOptions]    = useState([]);
  const [entries,    setEntries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [optFilter,  setOptFilter]  = useState('');
  const [search,     setSearch]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (optFilter) params.option_key = optFilter;
      if (search.trim()) params.search = search.trim();
      const d = await wcGamesApi.entries(fixtureId, params);
      if (d.success) {
        setEntries(d.data || []);
        setOptions(d.options || []);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [fixtureId, optFilter, search]);

  useEffect(() => {
    wcGamesApi.fixtures()
      .then(d => {
        if (d.success) {
          const found = d.data.find(f => String(f.fixture.id) === String(fixtureId));
          if (found) setMatchLabel(`${found.teams.home.name} vs ${found.teams.away.name}`);
        }
      })
      .catch(() => {});
  }, [fixtureId]);

  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0); // debounce free-text search
    return () => clearTimeout(t);
  }, [load, search]);

  const optionCounts = options.map(o => ({
    ...o,
    count: entries.filter(e => e.option_key === o.key).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/worldcup" className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <FiArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-gray-800">Predictions</h1>
          <p className="text-sm text-gray-500">{matchLabel || `Fixture #${fixtureId}`}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FiUsers className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-500">Total Entries</span>
          </div>
          <p className="text-2xl font-black text-blue-600">{entries.length}</p>
        </div>
        {optionCounts.map(o => (
          <div key={o.key} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-black text-gray-500">{o.key.toUpperCase()}</span>
              <span className="text-xs font-medium text-gray-500 truncate">{o.label}</span>
            </div>
            <p className="text-2xl font-black text-gray-700">{o.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search username or email…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4D8F]/20"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOptFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${optFilter === '' ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            All
          </button>
          {options.map(o => (
            <button key={o.key} onClick={() => setOptFilter(o.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${optFilter === o.key ? 'bg-[#1A4D8F] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="Reload">
          <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prediction</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-16">
                <div className="w-6 h-6 border-2 border-[#1A4D8F]/20 border-t-[#1A4D8F] rounded-full animate-spin mx-auto" />
              </td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                <FiList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No predictions match this filter
              </td></tr>
            ) : (
              entries.map((e, i) => (
                <tr key={e.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-xs">{e.username || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs flex items-center gap-1.5">
                    <FiMail className="w-3 h-3 text-gray-300" />{e.email || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {e.option_label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                    {e.created_at ? new Date(e.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {e.is_correct === null ? (
                      <span className="text-[10px] text-gray-400 font-medium uppercase">Pending</span>
                    ) : e.is_correct ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600"><FiCheckCircle className="w-3.5 h-3.5" />Correct</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400"><FiXCircle className="w-3.5 h-3.5" />Wrong</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
