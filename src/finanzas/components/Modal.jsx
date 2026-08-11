import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, width = 'max-w-[420px]' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`w-full ${width} rounded-2xl border border-[#1E1E1E] bg-[#141414] p-5 shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-[15px] font-normal text-[#F2F2F2]">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-[#1B1B1B] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FieldLabel({ children }) {
  return <label className="block text-[11.5px] font-normal text-[#75757A] mb-1.5">{children}</label>;
}

export const inputClass =
  'w-full rounded-lg border border-[#1E1E1E] bg-[#0F0F0F] px-3 py-2.5 text-[13.5px] text-[#E5E5E5] outline-none focus:border-[#3B82F6] transition-colors font-mono';

export const selectClass =
  'w-full rounded-lg border border-[#1E1E1E] bg-[#0F0F0F] px-3 py-2.5 text-[13.5px] text-[#E5E5E5] outline-none focus:border-[#3B82F6] transition-colors';
