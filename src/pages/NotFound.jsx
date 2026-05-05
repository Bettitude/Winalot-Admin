import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl font-black text-[#1A4D8F]">404</span>
      </div>
      <h1 className="text-2xl font-black text-[#1A1A2E] mb-2">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-sm">
        The admin page you are looking for does not exist or has been moved.
      </p>
      <Link to="/admin"
        className="inline-flex items-center gap-2 bg-[#1A4D8F] text-white font-semibold px-5 py-2.5 rounded text-sm hover:bg-[#0D2B5E] transition-colors">
        <FiArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );
}
