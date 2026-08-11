import React from 'react';
import { Scale } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getPlanVsReal, formatMoney } from '../engine/calculos';

const LABELS = {
  ingresos: 'Ingresos',
  gastos: 'Gastos + deudas',
  ahorro: 'Ahorro',
  metas: 'Independencia',
  flujo: 'Flujo',
};

export default function PlanVsRealCard() {
  const { planOficial, movimientos, mesActivo } = useFinance();
  const filas = getPlanVsReal(planOficial, movimientos, mesActivo);
  if (!filas) return null;

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <span className="text-[11.5px] text-[#75757A] flex items-center gap-1.5">
        <Scale size={12} /> Plan vs Real
      </span>

      <div className="flex flex-col gap-3 mt-4">
        {Object.entries(filas).map(([key, fila]) => (
          <FilaPlanVsReal key={key} label={LABELS[key]} fila={fila} />
        ))}
      </div>
    </div>
  );
}

function FilaPlanVsReal({ label, fila }) {
  const color = fila.favorable ? '#4ADE80' : '#F2685C';
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#9A9AA0]">{label}</span>
        <span className="text-[11px] font-mono" style={{ color }}>
          {fila.diferencia >= 0 ? '+' : ''}
          {formatMoney(fila.diferencia)}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 h-1.5 rounded-full bg-[#1E1E1E] overflow-hidden relative">
          <div className="h-full bg-[#3A3A3A]" style={{ width: '100%', position: 'absolute' }} />
          <div
            className="h-full rounded-full relative"
            style={{ width: `${Math.min(Math.abs(fila.real / (fila.plan || 1)), 1) * 100}%`, background: color }}
          />
        </div>
        <span className="text-[10px] font-mono text-[#5A5A5A] whitespace-nowrap">
          {formatMoney(fila.real)} / {formatMoney(fila.plan)}
        </span>
      </div>
    </div>
  );
}
