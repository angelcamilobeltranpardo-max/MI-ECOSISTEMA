import React from 'react';
import { Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { getPlanVsRealConPorcentajes, formatMoney, formatPct } from '../engine/calculos';

const LABELS = {
  ingresos: 'Ingresos',
  gastos: 'Gastos + deudas',
  ahorro: 'Ahorro',
  metas: 'Independencia',
  flujo: 'Flujo',
};

export default function PlanVsRealCard() {
  const { planEfectivo, planOficial, movimientos, mesActivo } = useFinance();
  const filas = getPlanVsRealConPorcentajes(planEfectivo, movimientos, mesActivo, planOficial);
  if (!filas) return null;

  const chartData = Object.entries(filas).map(([key, fila]) => ({
    key,
    label: LABELS[key],
    Planificado: fila.plan,
    Real: fila.real,
  }));

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <span className="text-[16px] font-display text-[#9A9AA0] flex items-center gap-1.5">
        <Scale size={15} /> Plan vs Real
      </span>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 mt-4">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#75757A', fontSize: 11 }} axisLine={{ stroke: '#1E1E1E' }} tickLine={false} />
              <YAxis tick={{ fill: '#75757A', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatMoney(v)} width={70} />
              <Tooltip
                contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#D4D4D4' }}
                formatter={(value) => formatMoney(value)}
              />
              <Bar dataKey="Planificado" fill="#3A3A3A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Real" radius={[4, 4, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.key} fill={filas[d.key].favorable ? '#4ADE80' : '#F2685C'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-4 justify-center">
          {Object.entries(filas).map(([key, fila]) => (
            <FilaPlanVsReal key={key} label={LABELS[key]} fila={fila} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilaPlanVsReal({ label, fila }) {
  const color = fila.favorable ? '#4ADE80' : '#F2685C';
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[13.5px] text-[#D4D4D4]">{label}</span>
        <span className="text-[12.5px] font-mono" style={{ color }}>
          {fila.diferencia >= 0 ? '+' : ''}
          {formatMoney(fila.diferencia)}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-[#5A5A5A] font-mono">
          Planificado: {formatPct(fila.planPct, 0)} · Real: {fila.realPct !== null ? formatPct(fila.realPct, 0) : '—'}
        </span>
        <span className="text-[11px] font-mono text-[#5A5A5A]">
          {formatMoney(fila.real)} / {formatMoney(fila.plan)}
        </span>
      </div>
      {fila.planOriginal !== fila.plan && (
        <p className="text-[10px] text-[#F1BD3D] font-mono mt-0.5">Plan original: {formatMoney(fila.planOriginal)} (editado)</p>
      )}
    </div>
  );
}
