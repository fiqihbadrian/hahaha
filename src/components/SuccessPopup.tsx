import { useEffect } from "react";

type SuccessPopupProps = {
  show: boolean;
  message: string;
  onClose: () => void;
  autoCloseDelay?: number;
};

export default function SuccessPopup({ show, message, onClose, autoCloseDelay = 2000 }: SuccessPopupProps) {
  useEffect(() => {
    if (!show) return;

    // Auto close after delay
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    // Close on scroll immediately
    const handleScroll = () => {
      onClose();
    };

    // Close on click anywhere - but with delay to avoid closing from the button click that opened it
    const handleClick = () => {
      onClose();
    };

    window.addEventListener("scroll", handleScroll);
    
    // Delay attaching click listener to avoid race condition with button that opens popup
    const clickTimer = setTimeout(() => {
      window.addEventListener("click", handleClick);
    }, 150);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(clickTimer);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
    };
  }, [show, autoCloseDelay, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-7 w-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-zinc-900">Berhasil</h3>
            <p className="text-sm text-zinc-600">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
