import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm Delete', message = 'Are you sure you want to delete the selected items? This action cannot be undone.', confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="max-w-md"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 rounded text-sm font-semibold text-white ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1A4D8F] hover:bg-[#0D2B5E]'}`}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-center py-2">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h4 className="text-base font-bold text-[#1A1A2E] mb-2">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
