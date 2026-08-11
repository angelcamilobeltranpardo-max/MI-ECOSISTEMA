import React from 'react';
import { Gauge } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getDailyPacing, formatMoney } from '../engine/calculos';

export default function DailyPacingCard() {
  const { planOficial, movimientos, mesActivo } = useFinance();
  const pacing = getDailyPacing(planOficial, movimientos, mesActivo);
  if (!pacing) return null;

  const pctUsado = pacing.presupuestoInicial > 0 ? Math.min(pacing.gastado / pacing.presupuestoInicial, 1) : 0;
  const esMesActual = pacing.diaActual !== null;

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <span className="text-[11.5px] text-[#75757A] flex items-center gap-1.5">
        <Gauge size={12} /> Daily Pacing
      </span>

      <p className="font-display text-[30px] font-light text-[#F2F2F2] leading-none mt-3">
        {formatMoney(pacing.capacidadActual)}
        <span className="text-[13px] text-[#75757A] font-sans font-normal">/dia</span>
      </p>
      <p className="text-[11px] text-[#5A5A5A] mt-1 font-mono">
        Ritmo inicial: {formatMoney(pacing.capacidadInicial)}/dia
      </p>

      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-[#1E1E1E] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pctUsado * 100}%`, background: pctUsado > 0.9 ? '#F2685C' : '#F1BD3D' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] text-[#75757A] font-mono">
          <span>Gastado: {formatMoney(pacing.gastado)}</span>
          <span>Restante: {formatMoney(pacing.restante)}</span>
        </div>
      </div>

      <p className="text-[10.5px] text-[#5A5A5A] mt-3 pt-3 border-t border-[#1E1E1E]">
        {esMesActual
          ? `Dia ${pacing.diaActual} de ${pacing.totalDias} — quedan ${pacing.diasRestantes} dias`
          : `Mes no en curso — mostrando ritmo completo de ${pacing.totalDias} dias`}
      </p>
    </div>
  );
}
