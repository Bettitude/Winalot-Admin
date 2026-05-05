export default function StatusBadge({ status, withChevron = false, onChange }) {
  const map = {
    active:     { label: 'Active',     cls: 'bg-green-500 text-white' },
    enabled:    { label: 'Enabled',    cls: 'bg-green-500 text-white' },
    successful: { label: 'Successful', cls: 'bg-green-500 text-white' },
    correct:    { label: 'Correct',    cls: 'bg-green-500 text-white' },
    winner:     { label: 'Winner',     cls: 'bg-green-600 text-white' },
    open:       { label: 'Open',       cls: 'bg-blue-500 text-white' },
    pending:    { label: 'Pending',    cls: 'bg-yellow-400 text-gray-900' },
    draft:      { label: 'Draft',      cls: 'bg-gray-100 text-gray-600 border border-gray-300' },
    ended:      { label: 'Ended',      cls: 'bg-gray-200 text-gray-700' },
    settled:    { label: 'Settled',    cls: 'bg-gray-200 text-gray-700' },
    closed:     { label: 'Closed',     cls: 'bg-gray-200 text-gray-700' },
    published:  { label: 'Published',  cls: 'bg-blue-600 text-white' },
    failed:     { label: 'Failed',     cls: 'bg-red-500 text-white' },
    incorrect:  { label: 'Incorrect',  cls: 'bg-red-400 text-white' },
    disabled:   { label: 'Disabled',   cls: 'bg-gray-400 text-white' },
    suspended:  { label: 'Suspended',  cls: 'bg-red-500 text-white' },
    refunded:   { label: 'Refunded',   cls: 'bg-purple-400 text-white' },
  };

  const cfg = map[status?.toLowerCase()] || { label: status, cls: 'bg-gray-200 text-gray-700' };

  if (!withChevron) {
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  }

  // Interactive dropdown badge
  const options = {
    enabled:   ['enabled', 'disabled', 'suspended'],
    disabled:  ['enabled', 'disabled', 'suspended'],
    suspended: ['enabled', 'disabled', 'suspended'],
    active:    ['active', 'ended', 'draft'],
    ended:     ['active', 'ended', 'draft'],
    draft:     ['active', 'ended', 'draft'],
  };
  const opts = options[status?.toLowerCase()] || [];

  return (
    <div className="relative group inline-block">
      <button className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold cursor-pointer ${cfg.cls}`}>
        {cfg.label}
        <span className="text-[10px] opacity-80">▼</span>
      </button>
      {opts.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20 hidden group-hover:block">
          {opts.map(o => (
            <button
              key={o}
              onClick={() => onChange?.(o)}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 capitalize"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
