'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { MdClose, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useClientAuth } from '@/lib/context/ClientAuthContext';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialForm = {
  email: '',
  fullName: '',
  password: '',
};

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login, register, isAuthenticated } = useClientAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setError(null);
      setSuccess(null);
      setMode('login');
      setShowPassword(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const primaryLabel = useMemo(
    () => (mode === 'login' ? 'შესვლა' : 'რეგისტრაცია'),
    [mode]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
        setSuccess('ავტორიზაცია წარმატებით შესრულდა');
      } else {
        await register({
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
        });
        setSuccess('რეგისტრაცია დასრულდა');
      }
    } catch (err) {
      setError((err as Error).message || 'მოქმედება ვერ შესრულდა');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="დახურე ავტორიზაციის ფანჯარა"
          onClick={onClose}
        >
          <MdClose size={22} />
        </button>

        <div className="px-8 pt-10 pb-8">
          <div className="flex items-center gap-2 rounded-full bg-[#F5F5F7] p-1 mb-6">
            {(['login', 'register'] as AuthMode[]).map((value) => (
              <button
                key={value}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                  mode === value ? 'bg-white text-[#EE563B] shadow' : 'text-gray-500'
                }`}
                onClick={() => {
                  setMode(value);
                  setError(null);
                  setSuccess(null);
                }}
              >
                {value === 'login' ? 'შესვლა' : 'რეგისტრაცია'}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label className="text-sm text-gray-600 mb-2 block">სრული სახელი</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[#EE563B] focus:outline-none focus:ring-2 focus:ring-[#EE563B]/20"
                  placeholder="მაგ: ნინო ქავთარაძე"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-gray-600 mb-2 block">ელ-ფოსტა</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:border-[#EE563B] focus:outline-none focus:ring-2 focus:ring-[#EE563B]/20"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">პაროლი</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 pr-12 focus:border-[#EE563B] focus:outline-none focus:ring-2 focus:ring-[#EE563B]/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#EE563B] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#d74931] disabled:opacity-60"
            >
              {loading ? 'მუშავდება...' : primaryLabel}
            </button>

            <button
              type="button"
              className="w-full rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Google-ით შესვლა
            </button>
          </form>

          <button
            type="button"
            className="mx-auto mt-6 block text-sm font-medium text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            გაუქმება
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

