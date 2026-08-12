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
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <span className="text-[15px] font-display text-[#9A9AA0] flex items-center gap-1.5">
        <PieIcon size={14} /> Distribucion del ingreso (plan)
      </span>

      <div className="flex items-center gap-5 mt-3">
        <div className="relative w-[128px] h-[128px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="valor"
                nameKey="label"
                innerRadius={38}
                outerRadius={60}
                paddingAngle={2}
                stroke="none"
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

          {/* Centro del donut: Total por defecto, categoria al pasar el cursor / tocar */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-2 text-center">
            {active ? (
              <>
                <span className="text-[9.5px] uppercase tracking-wide text-[#75757A] truncate max-w-[80px]">{active.label}</span>
                <span className="font-display text-[15px] font-medium text-[#F2F2F2] leading-tight mt-0.5">{formatMoney(active.valor)}</span>
                <span className="text-[11px] font-mono mt-0.5" style={{ color: active.color }}>
                  {formatPct(active.pct, 0)}
                </span>
              </>
            ) : (
              <>
                <span className="text-[9.5px] uppercase tracking-wide text-[#75757A]">Total</span>
                <span className="font-display text-[15px] font-medium text-[#F2F2F2] leading-tight mt-0.5">{formatMoney(total)}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {data.map((d, i) => (
            <button
              key={d.key}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => setPinnedIndex((prev) => (prev === i ? null : i))}
              className="flex items-center justify-between gap-2 text-left rounded-md -mx-1 px-1 py-0.5 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0 transition-opacity"
                  style={{ background: d.color, opacity: activeIndex === null || activeIndex === i ? 1 : 0.4 }}
                />
                <span className={`text-[12.5px] truncate ${activeIndex === i ? 'text-[#F2F2F2]' : 'text-[#9A9AA0]'}`}>{d.label}</span>
              </div>
              <span className="text-[11.5px] font-mono text-[#5A5A5A] flex-shrink-0">{formatPct(d.pct, 0)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
