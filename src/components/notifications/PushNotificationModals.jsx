import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import Modal from '../ui/Modal';
import { useToast } from '../../context/ToastContext';

// ─── Step 1: Compose ──────────────────────────────────────────────────────────
function Step1({ template, onNext, onClose }) {
  const [form, setForm] = useState({
    title:   template?.title   || '',
    message: template?.message || '',
    sendAs:  'In-App Notification',
    to:      '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleNext = () => {
    if (!form.title.trim() || !form.message.trim() || !form.to.trim()) return;
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
          <textarea value={form.message} onChange={e => set('message', e.target.value)}
            rows={5}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] focus:ring-2 focus:ring-[#1A4D8F]/20 resize-none" />
          <p className="text-xs text-gray-400 mt-1">Use <strong>[User]</strong> and <strong>[Admin Name]</strong> as placeholders.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Send As *</label>
          <input value={form.sendAs} readOnly
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">To *</label>
          <input value={form.to} onChange={e => set('to', e.target.value)}
            placeholder="Username or group (e.g. All Users)"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#1A4D8F] focus:ring-2 focus:ring-[#1A4D8F]/20" />
        </div>
      </div>
    </Modal>
  );
}

// ─── Step 2: Confirm ──────────────────────────────────────────────────────────
function Step2({ form, onConfirm, onBack, onClose }) {
  return (
    <Modal open onClose={onClose} title="Push Notification" maxWidth="max-w-xl"
      footer={
        <>
          <button onClick={onBack} className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
            Back
          </button>
          <button onClick={onConfirm}
            className="bg-[#1A4D8F] text-white font-semibold px-6 py-2.5 rounded text-sm hover:bg-[#0D2B5E] transition-colors flex items-center gap-2">
            <FiSend className="w-4 h-4" /> Confirm Notification
          </button>
        </>
      }
    >
      <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
        <p className="font-bold text-[#1A1A2E] mb-2">{form.title}</p>
        {form.message}
        <p className="mt-4 text-gray-500 text-xs">Sending to: <strong>{form.to}</strong> via {form.sendAs}</p>
      </div>
    </Modal>
  );
}

// ─── Step 3: Sent ─────────────────────────────────────────────────────────────
function Step3({ onClose }) {
  return (
    <Modal open onClose={onClose} title="Push Notification" maxWidth="max-w-sm"
      footer={
        <button onClick={onClose}
          className="w-full bg-[#1A4D8F] text-white font-semibold px-6 py-2.5 rounded text-sm hover:bg-[#0D2B5E] transition-colors">
          Confirm Notification
        </button>
      }
    >
      <div className="text-center py-4">
        {/* SVG envelope illustration */}
        <div className="inline-flex items-center justify-center w-24 h-24 mx-auto mb-5 relative">
          <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
            {/* Envelope body */}
            <rect x="8" y="28" width="80" height="52" rx="6" fill="#1A4D8F" />
            {/* Envelope flap */}
            <path d="M8 34L48 58L88 34" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Left wing */}
            <path d="M8 80L34 55" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            {/* Right wing */}
            <path d="M88 80L62 55" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            {/* Gold checkmark badge */}
            <circle cx="72" cy="26" r="16" fill="#F5C518" />
            <path d="M64 26l6 6 10-12" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your notification has been sent.<br />Check the history for details.
        </p>
      </div>
    </Modal>
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────
export default function PushNotificationFlow({ template, onClose }) {
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(null);

  const handleNext = (data) => { setForm(data); setStep(2); };
  const handleConfirm = () => {
    setStep(3);
    addToast('Notification sent successfully', 'success');
  };
  const handleClose = () => { setStep(1); setForm(null); onClose(); };

  if (step === 1) return <Step1 template={template} onNext={handleNext} onClose={handleClose} />;
  if (step === 2) return <Step2 form={form} onConfirm={handleConfirm} onBack={() => setStep(1)} onClose={handleClose} />;
  if (step === 3) return <Step3 onClose={handleClose} />;
  return null;
}
