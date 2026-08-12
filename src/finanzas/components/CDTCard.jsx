import React, { useState } from 'react';
import { TrendingUp, Plus, Landmark } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { getResumenCDTs, formatMoney, formatPct } from '../engine/calculos';
import Modal, { FieldLabel, inputClass } from './Modal';

export default function CDTCard() {
  const { cdts } = useFinance();
  const [modalAbierto, setModalAbierto] = useState(false);
  const resumen = getResumenCDTs(cdts);

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-display text-[#9A9AA0] flex items-center gap-1.5">
          <Landmark size={15} /> CDT
        </span>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1B1B1B] text-[11.5px] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors"
        >
          <Plus size={12} /> Nuevo CDT
        </button>
      </div>

      {cdts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
          <TrendingUp size={22} className="text-[#333]" />
          <p className="text-[12.5px] text-[#5A5A5A] max-w-[280px]">
            Aun no tienes CDTs registrados. Usa "Nuevo CDT" e ingresa capital, fecha de apertura, fecha de vencimiento y tasa E.A. — el rendimiento se calcula automaticamente, dia a dia.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Stat label="Total CDT" value={formatMoney(resumen.totalCapital)} />
            <Stat label="Rendimiento acumulado" value={'+' + formatMoney(resumen.totalRendimientoAcumulado)} color="#4ADE80" />
            <Stat label="Rendimiento esperado (total)" value={'+' + formatMoney(resumen.totalRendimientoEsperado)} color="#6366F1" />
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
                  <XAxis dataKey="fecha" tick={{ fill: '#5A5A5A', fontSize: 9.5 }} axisLine={false} tickLine={false} minTickGap={40} />
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Tooltip
                    contentStyle={{ background: '#0F0F0F', border: '1px solid #1E1E1E', borderRadius: 10, fontSize: 11.5 }}
                    formatter={(v) => formatMoney(v)}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#6366F1" strokeWidth={1.75} fill="url(#cdtFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {resumen.proximoAVencer && (
            <div className="mt-4 pt-4 border-t border-[#1E1E1E]">
              <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A] mb-2">Proximo CDT en vencer</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-[13.5px] text-[#D4D4D4] font-mono">{formatMoney(resumen.proximoAVencer.capital)}</p>
                  <p className="text-[11px] text-[#5A5A5A] mt-0.5">Vence {resumen.proximoAVencer.fechaVencimiento} · {resumen.proximoAVencer.diasRestantes} dias restantes</p>
                </div>
                <span className="text-[11.5px] font-mono text-[#4ADE80]">+{formatMoney(resumen.proximoAVencer.rendimientoAcumulado)}</span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#1E1E1E] flex flex-col gap-2">
            {resumen.cdtsConRendimiento.map((cdt) => (
              <div key={cdt.id} className="flex items-center justify-between text-[12px]">
                <div className="min-w-0">
                  <p className="text-[#D4D4D4] font-mono">{formatMoney(cdt.capital)}</p>
                  <p className="text-[10.5px] text-[#5A5A5A]">
                    {formatPct(cdt.tasaEA)} E.A. · dia {cdt.diasTranscurridos}/{cdt.plazoDias} · vence {cdt.fechaVencimiento}
                  </p>
                </div>
                <span className="font-mono text-[#4ADE80] flex-shrink-0">+{formatMoney(cdt.rendimientoAcumulado)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {modalAbierto && <NuevoCDTModal onClose={() => setModalAbierto(false)} />}
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

function NuevoCDTModal({ onClose }) {
  const { addCDT } = useFinance();
  const [capital, setCapital] = useState('');
  const [fechaApertura, setFechaApertura] = useState(new Date().toISOString().slice(0, 10));
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [tasaEA, setTasaEA] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const cap = Number(capital);
    const tasa = Number(tasaEA) / 100;
    if (!cap || !fechaVencimiento || !tasa) return;
    addCDT({ capital: cap, fechaApertura, fechaVencimiento, tasaEA: tasa });
    onClose();
  };

  return (
    <Modal title="Nuevo CDT" onClose={onClose} width="max-w-[380px]">
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div>
          <FieldLabel>Capital</FieldLabel>
          <input type="number" min="0" value={capital} onChange={(e) => setCapital(e.target.value)} className={inputClass} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Fecha de apertura</FieldLabel>
            <input type="date" value={fechaApertura} onChange={(e) => setFechaApertura(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <FieldLabel>Fecha de vencimiento</FieldLabel>
            <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} className={inputClass} required />
          </div>
        </div>
        <div>
          <FieldLabel>Tasa E.A. (%)</FieldLabel>
          <input type="number" min="0" step="0.01" value={tasaEA} onChange={(e) => setTasaEA(e.target.value)} className={inputClass} required />
        </div>
        <div className="flex gap-2.5 mt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F2F2F2]">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#6366F1] text-white text-[13px] font-normal">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
