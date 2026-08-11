import React from 'react';
import { Wallet, Plus } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getSaldoDisponible, formatMoney } from '../engine/calculos';

export default function SaldoDisponibleCard() {
  const { planOficial, movimientos, mesActivo } = useFinance();
  const saldo = getSaldoDisponible(planOficial, movimientos, mesActivo);

  return (
    <div className="relative rounded-2xl p-6 border border-[#1A1A1A] bg-[#141414] overflow-hidden">
      <div
        className="absolute -right-10 -top-10 w-52 h-52 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.30), transparent 70%)', filter: 'blur(10px)' }}
      />
      <span className="relative text-[11.5px] text-[#75757A] flex items-center gap-1.5">
        <Wallet size={12} /> Saldo disponible
      </span>
      <p className="relative font-display text-[42px] sm:text-[48px] font-light text-[#F2F2F2] leading-none mt-3">
        {formatMoney(saldo.total)}
      </p>

      <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-4 border-t border-[#1E1E1E]">
        <Breakdown label="Presupuesto personal" value={saldo.presupuestoPersonal - saldo.usadoPersonal} color="#F1BD3D" />
        <Plus size={12} className="text-[#3A3A3A]" />
        <Breakdown label="Flujo libre" value={saldo.flujoLibre - saldo.usadoFlujoLibre} color="#22D3EE" />
      </div>

      {(saldo.usadoPersonal > 0 || saldo.usadoFlujoLibre > 0) && (
        <p className="relative text-[10.5px] text-[#5A5A5A] mt-3 font-mono">
          Ya usado este mes: {formatMoney(saldo.usadoPersonal + saldo.usadoFlujoLibre)}
        </p>
      )}
    </div>
  );
}

function Breakdown({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
      <div>
        <p className="font-mono text-[13px] text-[#E5E5E5] leading-none">{formatMoney(value)}</p>
        <p className="text-[10.5px] text-[#75757A] mt-0.5">{label}</p>
      </div>
    </div>
  );
}
