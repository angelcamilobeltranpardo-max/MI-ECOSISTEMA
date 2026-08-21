import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getAhorro, getAhorroAcumulado, formatMoney, formatPct } from '../engine/calculos';

export default function AhorroCard() {
  const { planEfectivo, movimientos, mesActivo } = useFinance();
  const ahorro = getAhorro(planEfectivo, movimientos, mesActivo);
  const acumulado = getAhorroAcumulado(planEfectivo, movimientos, mesActivo);
  if (!ahorro) return null;

  const pct = ahorro.cumplimiento === null ? 0 : Math.min(Math.max(ahorro.cumplimiento, 0), 1);
  const color = ahorro.cumplimiento === null ? '#3A3A3A' : ahorro.cumplimiento >= 1 ? '#4ADE80' : '#F1BD3D';

  return (
    <div className="fin-card rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <span className="text-[19px] font-display text-[#9A9AA0] flex items-center gap-1.5">
        <ShieldCheck size={17} /> Ahorro (fondo emergencia)
      </span>

      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="font-display text-[33px] font-light text-[#F2F2F2] leading-none">{formatMoney(ahorro.real)}</p>
          <p className="text-[13.5px] text-[#5A5A5A] mt-1.5 font-mono">de {formatMoney(ahorro.plan)} planificados</p>
        </div>
        <p className="font-mono text-[19px]" style={{ color }}>
          {formatPct(ahorro.cumplimiento)}
        </p>
      </div>

      <div className="h-2 rounded-full bg-[#1E1E1E] overflow-hidden mt-3">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: color }} />
      </div>

      <div className="flex justify-between mt-4 pt-3 border-t border-[#1E1E1E] text-[13px] font-mono text-[#75757A]">
        <span>Acumulado plan: {formatMoney(acumulado.planAcum)}</span>
        <span>Acumulado real: {formatMoney(acumulado.realAcum)}</span>
      </div>
    </div>
  );
}
