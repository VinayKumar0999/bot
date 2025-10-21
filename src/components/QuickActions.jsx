export default function QuickActions({ onQuickAction }) {
  return (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onQuickAction('Non Member')}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full text-sm hover:shadow-md transition-all"
        >
          Non Member
        </button>
        <button
          onClick={() => onQuickAction('Member')}
          className="px-4 py-2 bg-white text-amber-700 border border-amber-600 rounded-full text-sm hover:bg-amber-50 transition-all"
        >
          Member
        </button>
      </div>
    </div>
  );
}