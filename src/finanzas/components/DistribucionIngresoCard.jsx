import React from 'react';
import { PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { getDistribucionIngreso, formatMoney, formatPct } from '../engine/calculos';

export default function DistribucionIngresoCard() {
  const { planOficial, mesActivo } = useFinance();
  const data = getDistribucionIngreso(planOficial, mesActivo);

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <span className="text-[11.5px] text-[#75757A] flex items-center gap-1.5">
        <PieIcon size={12} /> Distribucion del ingreso (plan)
      </span>

      <div className="flex items-center gap-4 mt-2">
        <div className="w-[110px] h-[110px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="valor" nameKey="label" innerRadius={34} outerRadius={52} paddingAngle={2} stroke="none">
                {data.map((d) => (
                  <Cell key={d.key} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 10, fontSize: 11 }}
                formatter={(value) => formatMoney(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {data.map((d) => (
            <div key={d.key} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[11px] text-[#9A9AA0] truncate">{d.label}</span>
              </div>
              <span className="text-[10.5px] font-mono text-[#5A5A5A] flex-shrink-0">{formatPct(d.pct, 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
