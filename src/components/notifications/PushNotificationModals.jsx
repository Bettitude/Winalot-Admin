import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import Modal from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import { notificationsApi } from '../../services/api';

const CHANNEL_OPTIONS = [
  { key: 'in_app', label: 'In-App Notification' },
  { key: 'email',  label: 'Email' },
  { key: 'sms',    label: 'SMS' },
];

function Step1({ template, onNext, onClose }) {
  const [form, setForm] = useState({
    title:    template?.title   || '',
    message:  template?.message || '',
    channels: ['in_app'],
    target:   'all',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleChannel = (key) =>
    setForm(f => ({
      ...f,
      channels: f.channels.includes(key)
        ? f.channels.filter(c => c !== key)
        : [...f.channels, key],
    }));

  const handleNext = () => {
    if (!form.title.trim() || !form.message.trim()) return;
    if (form.channels.length === 0) return;
    onNext(form);
  };

  return (
    <Modal open onClose={onClose} title="Push Notification" maxWidth="max-w-xl"
      footer={
        <button onClick={handleNext}
          className="bg-[#1A4D8F] text-white font-semibold px-6 py-2.5 rounded text-sm hover:bg-[#0D2B5E] transition-colors">
          Continue
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title *</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] focus:ring-2 focus:ring-[#1A4D8F]/20" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Message *</label>
          <textarea value={form.message} onChange={e => set('message', e.target.value)} rows={5}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] focus:ring-2 focus:ring-[#1A4D8F]/20 resize-none" />
          <p className="text-xs text-gray-400 mt-1">Use <strong>[User]</strong> and <strong>[Admin Name]</strong> as placeholders.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Send Via *</label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map(ch => (
              <label key={ch.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.channels.includes(ch.key)} onChange={() => toggleChannel(ch.key)}
                  className="rounded border-gray-300 text-[#1A4D8F] cursor-pointer" />
                <span className="text-sm text-gray-700">{ch.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Send To *</label>
          <select value={form.target} onChange={e => set('target', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F]">
            <option value="all">All Users</option>
            <option value="selected">Selected Users</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

function Step2({ form, onConfirm, onBack, onClose, sending }) {
  return (
    <Modal open onClose={onClose} title="Push Notification" maxWidth="max-w-xl"
      footer={
        <>
          <button onClick={onBack} disabled={sending}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 disabled:opacity-60">
            Back
          </button>
          <button onClick={onConfirm} disabled={sending}
            className="bg-[#1A4D8F] text-white font-semibold px-6 py-2.5 rounded text-sm hover:bg-[#0D2B5E] transition-colors flex items-center gap-2 disabled:opacity-60">
            {sending
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> Sending…</>
              : <><FiSend className="w-4 h-4" /> Confirm &amp; Send</>}
          </button>
        </>
      }
    >
      <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
        <p className="font-bold text-[#1A1A2E] mb-2">{form.title}</p>
        <p>{form.message}</p>
        <div className="mt-4 space-y-1 text-xs text-gray-500">
          <p>To: <strong>{form.target === 'all' ? 'All Users' : 'Selected Users'}</strong></p>
          <p>Channels: <strong>{form.channels.join(', ')}</strong></p>
        </div>
      </div>
    </Modal>
  );
}

function Step3({ recipientCount, onClose }) {
  return (
    <Modal open onClose={onClose} title="Push Notification" maxWidth="max-w-sm"
      footer={
        <button onClick={onClose}
          className="w-full bg-[#1A4D8F] text-white font-semibold px-6 py-2.5 rounded text-sm hover:bg-[#0D2B5E] transition-colors">
          Done
        </button>
      }
    >
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-24 h-24 mx-auto mb-5 relative">
          <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
            <rect x="8" y="28" width="80" height="52" rx="6" fill="#1A4D8F" />
            <path d="M8 34L48 58L88 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 80L34 55" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <path d="M88 80L62 55" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <circle cx="72" cy="26" r="16" fill="#F5C518" />
            <path d="M64 26l6 6 10-12" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Notification sent to <strong>{recipientCount}</strong> user{recipientCount !== 1 ? 's' : ''}.<br />
          Check the history tab for details.
        </p>
      </div>
    </Modal>
  );
}

export default function PushNotificationFlow({ template, onClose }) {
  const { addToast } = useToast();
  const [step, setStep]                 = useState(1);
  const [form, setForm]                 = useState(null);
  const [sending, setSending]           = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);

  const handleNext = (data) => { setForm(data); setStep(2); };

  const handleConfirm = async () => {
    setSending(true);
    try {
      const res = await notificationsApi.push({
        title:    form.title,
        message:  form.message,
        target:   form.target,
        channels: form.channels,
      });
      setRecipientCount(res.data?.recipient_count || 0);
      setStep(3);
      addToast('Notification sent successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => { setStep(1); setForm(null); onClose(); };

  if (step === 1) return <Step1 template={template} onNext={handleNext} onClose={handleClose} />;
  if (step === 2) return <Step2 form={form} onConfirm={handleConfirm} onBack={() => setStep(1)} onClose={handleClose} sending={sending} />;
  if (step === 3) return <Step3 recipientCount={recipientCount} onClose={handleClose} />;
  return null;
}
