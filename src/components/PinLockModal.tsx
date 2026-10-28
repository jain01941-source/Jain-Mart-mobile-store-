import React, { useState } from 'react';
import { Lock, Delete, Smartphone } from 'lucide-react';

interface PinLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
  correctPin: string;
  storeName: string;
  language: 'hi' | 'en';
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isLocked,
  onUnlock,
  correctPin,
  storeName,
  language,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const isHindi = language === 'hi';

  const handleKeyClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setTimeout(() => {
            onUnlock();
            setPin('');
          }, 150);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-xs text-center space-y-6">
        {/* Brand Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/5">
          <Smartphone className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{storeName}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isHindi ? 'सुरक्षा PIN दर्ज करें (डिफ़ॉल्ट: 1234)' : 'Enter Security PIN (Default: 1234)'}
          </p>
        </div>

        {/* PIN Dots */}
        <div className="flex justify-center items-center gap-4 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110 animate-shake'
                    : isFilled
                    ? 'bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/50'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 animate-pulse">
            {isHindi ? 'गलत PIN! कृपया पुनः प्रयास करें' : 'Incorrect PIN! Try again'}
          </p>
        )}

        {/* Numeric keypad (Thumb-friendly mobile size) */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyClick(digit)}
              className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-xl font-semibold text-white hover:bg-slate-800 active:bg-slate-700 active:scale-95 transition-all flex items-center justify-center shadow-sm"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyClick('0')}
            className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-xl font-semibold text-white hover:bg-slate-800 active:bg-slate-700 active:scale-95 transition-all flex items-center justify-center shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
