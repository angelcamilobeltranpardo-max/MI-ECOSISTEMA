import React, { useState } from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { getDistribucionIngreso, formatMoney, formatPct } from '../engine/calculos';

export default function DistribucionIngresoCard() {
  const { planEfectivo, mesActivo } = useFinance();
  const data = getDistribucionIngreso(planEfectivo, mesActivo);
  const total = data.reduce((s, d) => s + d.valor, 0);

  const [hoverIndex, setHoverIndex] = useState(null);
  const [pinnedIndex, setPinnedIndex] = useState(null);
  const activeIndex = hoverIndex ?? pinnedIndex;
  const active = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="fin-card rounded-2xl p-5 sm:p-6 border border-[#1A1A1A] bg-[#141414] w-full">
      <span className="text-[19px] font-display text-[#9A9AA0] flex items-center gap-1.5">
        <PieIcon size={17} /> Distribucion del ingreso
      </span>
      <p className="text-[11.5px] text-[#5A5A5A] mt-0.5">Distribucion total del ingreso planificado</p>

      {/* Layout horizontal de extremo a extremo: dona grande a la izquierda,
          desglose a la derecha. Sin <Tooltip> flotante de recharts -- esa
          era la causa del texto sobrepuesto con el centro; toda la
          interaccion vive en el centro de la dona y en la lista lateral. */}
      <div className="flex flex-col lg:flex-row items-center gap-8 mt-4">
        <div className="relative w-[220px] h-[220px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="valor"
                nameKey="label"
                innerRadius={70}
                outerRadius={108}
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
                onMouseEnter={(_, i) => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={(_, i) => setPinnedIndex((prev) => (prev === i ? null : i))}
                style={{ cursor: 'pointer' }}
              >
                {data.map((d, i) => (
                  <Cell key={d.key} fill={d.color} opacity={activeIndex === null || activeIndex === i ? 1 : 0.35} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centro de la dona: Total por defecto, categoria al pasar el cursor / tocar */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
            {active ? (
              <>
                <span className="text-[11px] uppercase tracking-wide text-[#75757A] truncate max-w-[130px]">{active.label}</span>
                <span className="font-display text-[24px] font-semibold text-[#F2F2F2] leading-tight mt-1">{formatMoney(active.valor)}</span>
                <span className="text-[14px] font-mono mt-0.5" style={{ color: active.color }}>
                  {formatPct(active.pct, 0)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] uppercase tracking-wide text-[#75757A]">Total</span>
                <span className="font-display text-[24px] font-semibold text-[#F2F2F2] leading-tight mt-1">{formatMoney(total)}</span>
              </>
            )}
          </div>
        </div>

        <div className="w-full flex-1 flex flex-col gap-2.5 max-w-[420px]">
          {data.map((d, i) => (
            <button
              key={d.key}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => setPinnedIndex((prev) => (prev === i ? null : i))}
              className={`flex items-center justify-between gap-3 text-left rounded-lg px-3 py-2.5 transition-colors border ${
                activeIndex === i ? 'bg-white/[0.06] border-white/10' : 'border-transparent hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-opacity"
                  style={{ background: d.color, opacity: activeIndex === null || activeIndex === i ? 1 : 0.4 }}
                />
                <span className={`text-[14px] truncate ${activeIndex === i ? 'text-[#F2F2F2]' : 'text-[#9A9AA0]'}`}>{d.label}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[12.5px] font-mono text-[#5A5A5A]">{formatMoney(d.valor)}</span>
                <span className="text-[12.5px] font-mono text-[#D4D4D4] w-[38px] text-right">{formatPct(d.pct, 0)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
