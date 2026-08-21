import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { getPlanVsRealConPorcentajes, getPlanVsRealEvolucion, formatMoney, formatPct } from '../engine/calculos';

const CATEGORIAS = [
  { key: 'ingresos', label: 'Ingresos' },
  { key: 'gastos', label: 'Gastos + deudas' },
  { key: 'ahorro', label: 'Ahorro' },
  { key: 'metas', label: 'Independencia' },
  { key: 'flujo', label: 'Flujo' },
];

export default function PlanVsRealCard() {
  const { planEfectivo, planOficial, movimientos, mesActivo } = useFinance();
  const [categoria, setCategoria] = useState('gastos');

  const filas = getPlanVsRealConPorcentajes(planEfectivo, movimientos, mesActivo, planOficial);
  const evolucion = getPlanVsRealEvolucion(planEfectivo, movimientos, categoria, mesActivo, 6);
  if (!filas) return null;

  return (
    <div className="fin-card rounded-2xl p-5 sm:p-6 border border-[#1A1A1A] bg-[#141414] flex flex-col w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-[20px] font-display text-[#9A9AA0] flex items-center gap-1.5">
          <Scale size={18} /> Plan vs Real
        </span>
        <div className="flex bg-[#0F0F0F] border border-[#1E1E1E] rounded-full p-1 flex-wrap">
          {CATEGORIAS.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategoria(c.key)}
              className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium transition-colors ${
                categoria === c.key ? 'bg-[#3B82F6] text-white' : 'text-[#75757A] hover:text-[#D4D4D4]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 mt-5">
        <div className="h-[230px]">
          {evolucion.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucion} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                <XAxis dataKey="mesLabel" tick={{ fill: '#75757A', fontSize: 11.5 }} axisLine={{ stroke: '#1E1E1E' }} tickLine={false} />
                <YAxis tick={{ fill: '#75757A', fontSize: 10.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatMoney(v)} width={72} />
                <Tooltip content={<TooltipPersonalizado />} />
                <Line type="monotone" dataKey="Plan" stroke="#3A3A3A" strokeWidth={2} dot={{ r: 3, fill: '#3A3A3A' }} />
                <Line type="monotone" dataKey="Real" stroke="#3B82F6" strokeWidth={2.25} dot={{ r: 3.5, fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[12.5px] text-[#5A5A5A]">Sin suficientes meses para graficar.</div>
          )}
        </div>

        <div className="flex flex-col gap-4 justify-center">
          {CATEGORIAS.map((c) => (
            <FilaPlanVsReal key={c.key} label={c.label} fila={filas[c.key]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TooltipPersonalizado({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#1E1E1E] bg-[#0F0F0F] px-3 py-2.5 text-[11.5px]">
      <p className="text-[#D4D4D4] font-medium mb-1">{label}</p>
      <p className="text-[#75757A]">Plan: <span className="font-mono text-[#E5E5E5]">{formatMoney(d.Plan)}</span></p>
      <p className="text-[#75757A]">Real: <span className="font-mono text-[#3B82F6]">{formatMoney(d.Real)}</span></p>
      <p className="mt-1" style={{ color: d.favorable ? '#4ADE80' : '#F2685C' }}>
        Diferencia: {d.diferencia >= 0 ? '+' : ''}{formatMoney(d.diferencia)}
        {d.desviacionPct !== null && ` (${formatPct(Math.abs(d.desviacionPct), 0)} ${d.desviacionPct >= 0 ? 'sobre' : 'bajo'})`}
      </p>
    </div>
  );
}

function FilaPlanVsReal({ label, fila }) {
  const color = fila.favorable ? '#4ADE80' : '#F2685C';
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-[#D4D4D4]">{label}</span>
        <span className="text-[13px] font-mono" style={{ color }}>
          {fila.diferencia >= 0 ? '+' : ''}
          {formatMoney(fila.diferencia)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11.5px] text-[#5A5A5A] font-mono">
          Planificado: {formatPct(fila.planPct, 0)} · Real: {fila.realPct !== null ? formatPct(fila.realPct, 0) : '—'}
        </span>
        <span className="text-[11.5px] font-mono text-[#5A5A5A]">
          {formatMoney(fila.real)} / {formatMoney(fila.plan)}
        </span>
      </div>
      {fila.planOriginal !== fila.plan && (
        <p className="text-[10.5px] text-[#F1BD3D] font-mono mt-0.5">Plan original: {formatMoney(fila.planOriginal)} (editado)</p>
      )}
    </div>
  );
}
