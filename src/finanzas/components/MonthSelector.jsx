import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';

export default function MonthSelector() {
  const { planOficial, mesActivo, setMesActivo } = useFinance();
  const idx = planOficial.findIndex((p) => p.mes === mesActivo);
  const plan = planOficial[idx];

  const go = (delta) => {
    const next = planOficial[idx + delta];
    if (next) setMesActivo(next.mes);
  };

  return (
    <div className="flex items-center gap-1.5 bg-[#141414] border border-[#1A1A1A] rounded-full pl-1.5 pr-1.5 py-1.5">
      <button
        onClick={() => go(-1)}
        disabled={idx <= 0}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[#75757A] hover:text-[#F2F2F2] disabled:opacity-30 disabled:hover:text-[#75757A] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
      >
        <ChevronLeft size={14} />
      </button>

      <select
        value={mesActivo}
        onChange={(e) => setMesActivo(e.target.value)}
        className="bg-transparent text-[12.5px] font-normal text-[#E5E5E5] outline-none cursor-pointer px-1"
      >
        {planOficial.map((p) => (
          <option key={p.mes} value={p.mes} className="bg-[#141414]">
            {p.mesLabel}
          </option>
        ))}
      </select>

      <button
        onClick={() => go(1)}
        disabled={idx >= planOficial.length - 1}
        className="w-7 h-7 rounded-full flex items-center justify-center text-[#75757A] hover:text-[#F2F2F2] disabled:opacity-30 disabled:hover:text-[#75757A] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
