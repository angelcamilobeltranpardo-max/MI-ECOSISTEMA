import React, { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getSaldoDisponible, getSaldoDisponibleVariacion, formatMoney, formatPct } from '../engine/calculos';
import { useExchangeRate } from '../engine/exchangeRate';

function formatUSD(n) {
  const value = Number(n) || 0;
  const sign = value < 0 ? '-' : '';
  return sign + '$' + Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export default function SaldoDisponibleCard() {
  const { planEfectivo, movimientos, mesActivo } = useFinance();
  const saldo = getSaldoDisponible(planEfectivo, movimientos, mesActivo);
  const variacion = getSaldoDisponibleVariacion(planEfectivo, movimientos, mesActivo);
  const tasa = useExchangeRate();

  const [moneda, setMoneda] = useState('COP');
  const presupuestoDisponible = saldo.presupuestoPersonal - saldo.usadoPersonal;
  const flujoDisponible = saldo.flujoLibre - saldo.usadoFlujoLibre;

  const puedeUSD = !tasa.loading && !tasa.error && tasa.rate;
  const mostrarUSD = moneda === 'USD' && puedeUSD;

  const valorPrincipal = mostrarUSD ? formatUSD(saldo.total / tasa.rate) : formatMoney(saldo.total);
  const valorPresupuesto = mostrarUSD ? formatUSD(presupuestoDisponible / tasa.rate) : formatMoney(presupuestoDisponible);
  const valorFlujo = mostrarUSD ? formatUSD(flujoDisponible / tasa.rate) : formatMoney(flujoDisponible);

  return (
    <div className="fin-card h-full relative rounded-2xl p-6 sm:p-7 border border-[#1A1A1A] bg-[#141414] overflow-hidden flex flex-col justify-center">
      <div
        className="absolute -right-10 -top-10 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.28), transparent 70%)', filter: 'blur(10px)' }}
      />

      <div className="relative flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[19px] font-display font-normal text-[#9A9AA0]">Saldo disponible</span>

          <div className="flex items-baseline gap-1 mt-2 flex-wrap">
            <span className="font-display text-[46px] sm:text-[56px] font-light leading-none text-[#3B82F6]">$</span>
            <span className="font-display text-[46px] sm:text-[56px] font-light leading-none text-[#F2F2F2]">
              {valorPrincipal.replace('$', '').replace('-', '')}
            </span>
          </div>

          {variacion.pct !== null && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`flex items-center gap-0.5 text-[12.5px] font-medium px-2 py-0.5 rounded-full ${
                  variacion.pct >= 0 ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#F2685C]/10 text-[#F2685C]'
                }`}
              >
                {variacion.pct >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {formatPct(Math.abs(variacion.pct))}
              </span>
              <span className="text-[12px] text-[#5A5A5A]">vs. mes anterior</span>
            </div>
          )}
        </div>

        <div className="flex items-center bg-[#0F0F0F] border border-[#1E1E1E] rounded-full p-1 flex-shrink-0">
          {['COP', 'USD'].map((c) => (
            <button
              key={c}
              onClick={() => setMoneda(c)}
              disabled={c === 'USD' && !puedeUSD}
              title={c === 'USD' && !puedeUSD ? (tasa.loading ? 'Cargando tasa...' : 'Tasa no disponible') : undefined}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                moneda === c ? 'bg-[#3B82F6] text-white' : 'text-[#75757A] hover:text-[#D4D4D4]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {mostrarUSD && (
        <p className="relative text-[10.5px] text-[#454545] mt-1 font-mono">
          1 USD = {formatMoney(tasa.rate)} · fuente: {tasa.source}
        </p>
      )}

      <div className="relative flex flex-wrap gap-x-8 gap-y-3 mt-5 pt-4 border-t border-[#1E1E1E]">
        <Breakdown label="Presupuesto personal" value={valorPresupuesto} color="#F1BD3D" />
        <Breakdown label="Flujo libre" value={valorFlujo} color="#22D3EE" />
      </div>
    </div>
  );
}

function Breakdown({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px ${color}` }} />
      <div>
        <p className="font-mono text-[14px] text-[#E5E5E5] leading-none">{value}</p>
        <p className="text-[11px] text-[#75757A] mt-1">{label}</p>
      </div>
    </div>
  );
}
