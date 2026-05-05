import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ message = 'No records found', action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <FiInbox className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 font-medium mb-1">{message}</p>
      <p className="text-gray-400 text-sm mb-4">Try adjusting your search or filter criteria.</p>
      {action && action}
    </div>
  );
}
