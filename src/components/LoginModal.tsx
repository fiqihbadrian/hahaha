import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ErrorPopup from "./ErrorPopup";

type LoginModalProps = {
  show: boolean;
  onClose: () => void;
  onSubmit: (email: string, password: string, name: string, isRegister: boolean) => Promise<void>;
};

export default function LoginModal({ show, onClose, onSubmit }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi confirm password untuk registrasi menggunakan native validation
    if (isRegister && password !== confirmPassword) {
      confirmPasswordRef.current?.setCustomValidity("Password tidak sama!");
      confirmPasswordRef.current?.reportValidity();
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(email, password, name, isRegister);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setIsRegister(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Reset custom validity saat user mengetik
    if (confirmPasswordRef.current) {
      confirmPasswordRef.current.setCustomValidity("");
    }
  };

  return (
    <>
      <ErrorPopup
        show={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage("")}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-emerald-800">
            {isRegister ? "Daftar Akun" : "Login"}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-zinc-400 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Nama
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                required={isRegister}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="h-4 w-4" />
              </button>
            </div>
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Ulangi Password
              </label>
              <div className="relative mt-1">
                <input
                  ref={confirmPasswordRef}
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="Ketik ulang password"
                  required={isRegister}
                  minLength={6}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Memproses..." : isRegister ? "Daftar" : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-zinc-600">
          {isRegister ? (
            <>
              Sudah punya akun?{" "}
              <button
                onClick={() => setIsRegister(false)}
                className="font-semibold text-emerald-700 hover:underline"
              >
                Login di sini
              </button>
            </>
          ) : (
            <>
              Belum punya akun?{" "}
              <button
                onClick={() => setIsRegister(true)}
                className="font-semibold text-emerald-700 hover:underline"
              >
             Daftar di sini
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
