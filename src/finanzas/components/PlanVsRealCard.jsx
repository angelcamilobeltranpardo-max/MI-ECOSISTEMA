import React, { useState } from 'react';
import { Scale, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { getPlanVsRealConPorcentajes, getPlanVsRealEvolucion, formatMoney, formatPct } from '../engine/calculos';

const CATEGORIAS = [
  { key: 'ingresos', label: 'Ingresos' },
  { key: 'gastos', label: 'Gastos + deudas' },
  { key: 'ahorro', label: 'Ahorro' },
  { key: 'metas', label: 'Independencia' },
  { key: 'flujo', label: 'Flujo' },
];

// El dashboard trabaja en buckets mensuales (asi esta construido todo el
// plan financiero) -- no hay datos semanales reales que graficar sin
// inventarlos. Este selector de periodo usa la misma unidad de tiempo que
// si existe (meses hacia atras), en vez de fabricar una vista "semanal" con
// datos que no tenemos.
const PERIODOS = [
  { key: 3, label: '3 meses' },
  { key: 6, label: '6 meses' },
  { key: 12, label: '12 meses' },
];

export default function PlanVsRealCard() {
  const { planEfectivo, planOficial, movimientos, mesActivo } = useFinance();
  const [categoria, setCategoria] = useState('gastos');
  const [periodo, setPeriodo] = useState(6);

  const filas = getPlanVsRealConPorcentajes(planEfectivo, movimientos, mesActivo, planOficial);
  const evolucion = getPlanVsRealEvolucion(planEfectivo, movimientos, categoria, mesActivo, periodo);
  if (!filas) return null;

  const ultimo = evolucion[evolucion.length - 1];

  return (
    <div className="fin-card rounded-2xl p-5 sm:p-6 border border-[#1A1A1A] bg-[#141414] flex flex-col w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-[20px] font-display text-[#9A9AA0] flex items-center gap-1.5">
            <Scale size={18} /> Plan vs Real
          </span>
          {ultimo && (
            <p className="text-[12px] text-[#5A5A5A] mt-1">
              {CATEGORIAS.find((c) => c.key === categoria)?.label} · ultimo mes:{' '}
              <span className="font-mono text-[#D4D4D4]">{formatMoney(ultimo.Real)}</span>
              {ultimo.desviacionPct !== null && (
                <span className={`ml-1.5 inline-flex items-center gap-0.5 ${ultimo.favorable ? 'text-[#4ADE80]' : 'text-[#F2685C]'}`}>
                  {ultimo.desviacionPct >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {formatPct(Math.abs(ultimo.desviacionPct), 0)}
                </span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#0F0F0F] border border-[#1E1E1E] rounded-full p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors ${
                  periodo === p.key ? 'bg-white/10 text-white' : 'text-[#75757A] hover:text-[#D4D4D4]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
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
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 mt-5">
        <div className="h-[240px]">
          {evolucion.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucion} margin={{ top: 10, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="realFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                <XAxis dataKey="mesLabel" tick={{ fill: '#75757A', fontSize: 11.5 }} axisLine={{ stroke: '#1E1E1E' }} tickLine={false} />
                <YAxis tick={{ fill: '#75757A', fontSize: 10.5 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatMoney(v)} width={72} />
                <Tooltip content={<TooltipPersonalizado />} cursor={{ stroke: '#3B82F6', strokeOpacity: 0.25, strokeWidth: 1 }} />
                <Line type="monotone" dataKey="Plan" stroke="#54545A" strokeWidth={1.75} strokeDasharray="4 4" dot={false} activeDot={{ r: 4, fill: '#54545A' }} />
                <Area type="monotone" dataKey="Real" stroke="#3B82F6" strokeWidth={2.75} fill="url(#realFill)" dot={false} activeDot={{ r: 5, fill: '#3B82F6', stroke: '#0A0A0A', strokeWidth: 2 }} />
              </AreaChart>
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
    <div className="rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-3.5 py-3 text-[11.5px] shadow-xl">
      <p className="text-[#D4D4D4] font-medium mb-1.5">{label}</p>
      <p className="text-[#75757A] flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[#54545A]" /> Plan: <span className="font-mono text-[#E5E5E5]">{formatMoney(d.Plan)}</span></p>
      <p className="text-[#75757A] flex items-center gap-1.5 mt-0.5"><span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Real: <span className="font-mono text-[#3B82F6]">{formatMoney(d.Real)}</span></p>
      <div className={`mt-1.5 pt-1.5 border-t border-[#1E1E1E] flex items-center gap-1 ${d.favorable ? 'text-[#4ADE80]' : 'text-[#F2685C]'}`}>
        {d.diferencia >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
        {formatMoney(Math.abs(d.diferencia))}
        {d.desviacionPct !== null && ` (${formatPct(Math.abs(d.desviacionPct), 0)})`}
      </div>
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
