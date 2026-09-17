'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';
import {
  Coffee,
  KeyRound,
  ShieldCheck,
  Lock,
  Mail,
  AlertTriangle,
  ArrowRight,
  Delete,
  Clock,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<'pin' | 'password'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  // Check lockout timer
  useEffect(() => {
    const updateLockout = () => {
      const sec = authService.getLockoutRemainingSeconds();
      setLockoutRemaining(sec);
    };
    updateLockout();
    const interval = setInterval(updateLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle PIN Input from on-screen keypad
  const handlePinDigit = (digit: string) => {
    if (lockoutRemaining > 0 || isLoading) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      // Auto submit on 4th digit
      if (nextPin.length === 4) {
        submitPin(nextPin);
      }
    }
  };

  const handlePinBackspace = () => {
    if (lockoutRemaining > 0 || isLoading) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handlePinClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const submitPin = (pinToSubmit: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const res = authService.loginWithPin(pinToSubmit);
      if (res.success) {
        router.push('/admin');
      } else {
        setErrorMsg(res.error || 'PIN tidak valid.');
        setPin('');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0 || isLoading) return;

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.loginWithCredentials(email, password);
      if (res.success) {
        router.push('/admin');
      } else {
        setErrorMsg(res.error || 'Kredensial tidak valid.');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#070e12] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-[#007b9e] selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#007b9e]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#075f7e]/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-[#0d171d] border border-[#1c3340] rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Top Header */}
        <div className="p-6 sm:p-7 bg-[#0a1318] border-b border-[#1c3340] text-center relative">
          <Link
            href="/"
            className="absolute top-5 left-5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
          >
            ← Kembali
          </Link>

          <div className="w-16 h-16 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-cyan-950/60 border border-cyan-400/30 mb-3 p-1.5">
            <img src="/images/icon-brew-bean.png" alt="Brew Bean Mascot" className="w-12 h-12 object-contain" />
          </div>

          <h1 className="text-xl font-extrabold text-white tracking-wider uppercase">
            BREW BEAN COMMAND POS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Autentikasi Barista Shift & Manajemen Kedai
          </p>

          {/* Mode Switcher */}
          <div className="mt-5 flex p-1 bg-[#080e12] rounded-xl border border-[#1c3340]">
            <button
              type="button"
              onClick={() => {
                setLoginMode('pin');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                loginMode === 'pin'
                  ? 'bg-[#007b9e] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>PIN Cepat POS</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('password');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                loginMode === 'password'
                  ? 'bg-[#007b9e] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Email & Sandi</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Lockout Warning Banner */}
          {lockoutRemaining > 0 && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 flex items-center gap-2.5 text-xs animate-pulse">
              <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div>
                <span className="font-bold">Keamanan Terkunci:</span> Percobaan melebihi batas. Tunggu{' '}
                <strong className="text-white">{lockoutRemaining} detik</strong> sebelum mencoba lagi.
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && lockoutRemaining === 0 && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PIN Mode */}
          {loginMode === 'pin' && (
            <div className="space-y-5">
              {/* PIN Dots Display */}
              <div className="text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Masukkan 4 Digit PIN Barista
                </span>
                <div className="flex justify-center items-center gap-3">
                  {[0, 1, 2, 3].map((idx) => {
                    const isFilled = pin.length > idx;
                    return (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                          isFilled
                            ? 'bg-[#007b9e] border-cyan-400 scale-125 shadow-md shadow-cyan-500/50'
                            : 'border-slate-700 bg-[#080e12]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    disabled={lockoutRemaining > 0 || isLoading}
                    onClick={() => handlePinDigit(digit)}
                    className="h-14 rounded-2xl bg-[#080e12] hover:bg-[#152733] border border-[#1c3340] text-lg font-bold text-white transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center shadow-md"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={lockoutRemaining > 0 || isLoading}
                  onClick={handlePinClear}
                  className="h-14 rounded-2xl bg-[#080e12] hover:bg-[#152733] border border-[#1c3340] text-xs font-semibold text-slate-400 hover:text-white transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
                >
                  Clear
                </button>
                <button
                  type="button"
                  disabled={lockoutRemaining > 0 || isLoading}
                  onClick={() => handlePinDigit('0')}
                  className="h-14 rounded-2xl bg-[#080e12] hover:bg-[#152733] border border-[#1c3340] text-lg font-bold text-white transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center shadow-md"
                >
                  0
                </button>
                <button
                  type="button"
                  disabled={lockoutRemaining > 0 || isLoading}
                  onClick={handlePinBackspace}
                  className="h-14 rounded-2xl bg-[#080e12] hover:bg-[#152733] border border-[#1c3340] text-slate-400 hover:text-white transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Credentials Mode */}
          {loginMode === 'password' && (
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Admin
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    disabled={lockoutRemaining > 0 || isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@brewbean.coffee"
                    className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#007b9e] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    disabled={lockoutRemaining > 0 || isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#080e12] border border-[#1c3340] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#007b9e] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={lockoutRemaining > 0 || isLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#007b9e] hover:bg-[#006e8d] text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all active:scale-98 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Memverifikasi...</span>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Info Box */}
          <div className="pt-4 border-t border-[#1c3340]">
            <div className="p-3 rounded-xl bg-[#080e12] border border-[#1c3340] text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                <Info className="w-3.5 h-3.5" />
                <span>Kredensial Akses Cepat Demo:</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">PIN Barista Shift A:</span>
                <span className="font-mono bg-[#101b22] px-1.5 py-0.5 rounded text-cyan-300 font-bold border border-[#1c3340]">
                  8888
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">PIN Barista Shift B:</span>
                <span className="font-mono bg-[#101b22] px-1.5 py-0.5 rounded text-cyan-300 font-bold border border-[#1c3340]">
                  1234
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Owner Email / Sandi:</span>
                <span className="font-mono text-slate-300">
                  admin@brewbean.coffee / brewbean2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer Badge */}
        <div className="p-3 bg-[#0a1318] border-t border-[#1c3340] text-center flex items-center justify-center gap-2 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sesi Terenkripsi & Proteksi Brute-Force Aktif</span>
        </div>
      </div>
    </div>
  );
}
