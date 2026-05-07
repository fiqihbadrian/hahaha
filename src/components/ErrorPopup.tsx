type ErrorPopupProps = {
  show: boolean;
  message: string;
  onClose: () => void;
};

export default function ErrorPopup({ show, message, onClose }: ErrorPopupProps) {
  if (!show) return null;

  
  

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg
              
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Error</h3>
        </div>
        <p className="mb-6 text-sm text-zinc-700">{message}</p>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
