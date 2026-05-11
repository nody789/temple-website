export default function AdminToast({ msg }) {
  if (!msg) return null;

  const isError = msg.type === 'error';

  return (
    <div
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl text-sm font-medium
        modal-enter
        ${isError
          ? 'bg-red-600 text-white'
          : 'bg-gray-900 text-white border-l-4 border-green-400'
        }`}
    >
      {isError ? (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5 shrink-0 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{msg.text}</span>
    </div>
  );
}
