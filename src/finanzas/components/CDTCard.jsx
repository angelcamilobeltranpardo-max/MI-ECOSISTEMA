import React, { useState } from 'react';
import { Landmark, Plus, Maximize2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { getResumenCDTs, formatMoney, formatDateHuman } from '../engine/calculos';
import CDTDetalleModal, { NuevoCDTModal } from './CDTDetalleModal';

export default function CDTCard() {
  const { cdts } = useFinance();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const resumen = getResumenCDTs(cdts);

  return (
    <div className="fin-card rounded-2xl p-5 sm:p-6 border border-[#1A1A1A] bg-[#141414] flex flex-col w-full">
      <div className="flex items-center justify-between">
        <span className="text-[20px] font-display text-[#9A9AA0] flex items-center gap-1.5">
          <Landmark size={18} /> CDT
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1B1B1B] text-[11.5px] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors"
          >
            <Plus size={12} /> Nuevo CDT
          </button>
          {cdts.length > 0 && (
            <button onClick={() => setDetalleAbierto(true)} className="w-7 h-7 rounded-full flex items-center justify-center bg-[#1B1B1B] text-[#75757A] hover:text-[#F2F2F2]" title="Ver detalle">
              <Maximize2 size={12} />
            </button>
          )}
        </div>
      </div>

      {cdts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
          <Landmark size={22} className="text-[#333]" />
          <p className="text-[13px] text-[#5A5A5A] max-w-[300px]">
            Aun no tienes CDTs registrados. Usa "Nuevo CDT" e ingresa entidad, capital, fecha de apertura, fecha de vencimiento y tasa E.A. — el rendimiento se calcula automaticamente, dia a dia.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <Stat label="Total invertido" value={formatMoney(resumen.totalCapital)} />
            <Stat label="Rendimiento acumulado" value={'+' + formatMoney(resumen.totalRendimientoAcumulado)} color="#4ADE80" />
            <Stat label="Valor total" value={formatMoney(resumen.valorTotal)} color="#6366F1" />
            <Stat label="CDTs activos" value={String(resumen.numeroCDTsActivos)} />
          </div>

          {resumen.evolucion.length > 1 && (
            <div className="h-[130px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resumen.evolucion} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cdtFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="fecha" tick={{ fill: '#5A5A5A', fontSize: 9.5 }} axisLine={false} tickLine={false} minTickGap={40} tickFormatter={(v) => formatDateHuman(v)} />
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Tooltip contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 10, fontSize: 11.5 }} formatter={(v) => formatMoney(v)} labelFormatter={(v) => formatDateHuman(v)} />
                  <Area type="monotone" dataKey="valor" stroke="#6366F1" strokeWidth={1.75} fill="url(#cdtFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {resumen.proximoAVencer && (
            <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
              <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A] mb-2">Proximo a vencer</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-[13.5px] text-[#D4D4D4] font-mono">
                    {resumen.proximoAVencer.entidad || 'CDT'} — {formatMoney(resumen.proximoAVencer.capital)}
                  </p>
                  <p className="text-[11px] text-[#5A5A5A] mt-0.5">
                    Vence {formatDateHuman(resumen.proximoAVencer.fechaVencimiento)} · {resumen.proximoAVencer.diasRestantes} dias restantes
                  </p>
                </div>
                <span className="text-[11.5px] font-mono text-[#4ADE80]">+{formatMoney(resumen.proximoAVencer.rendimientoAcumulado)}</span>
              </div>
            </div>
          )}
        </>
      )}

      {modalAbierto && <NuevoCDTModal onClose={() => setModalAbierto(false)} />}
      {detalleAbierto && <CDTDetalleModal onClose={() => setDetalleAbierto(false)} />}
    </div>
  );
}

function Stat({ label, value, color = '#E5E5E5' }) {
  return (
    <div>
      <p className="font-mono text-[15px]" style={{ color }}>{value}</p>
      <p className="text-[10.5px] text-[#5A5A5A] mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
