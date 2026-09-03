import React, { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { getResumenCDTs, getEvolucionCDT, formatMoney, formatPct, formatDateHuman } from '../engine/calculos';
import Modal, { FieldLabel, inputClass, ConfirmModal } from './Modal';

export default function CDTDetalleModal({ onClose }) {
  const { cdts, deleteCDT } = useFinance();
  const resumen = getResumenCDTs(cdts);
  const [expandido, setExpandido] = useState(null);
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  return (
    <Modal title="CDT — monitor de inversion" onClose={onClose} width="max-w-[820px]">
      <div className="grid sm:grid-cols-4 gap-4 mb-5">
        <Stat label="Total invertido" value={formatMoney(resumen.totalCapital)} />
        <Stat label="Rendimiento acumulado" value={'+' + formatMoney(resumen.totalRendimientoAcumulado)} color="#4ADE80" />
        <Stat label="Rendimiento esperado (total)" value={'+' + formatMoney(resumen.totalRendimientoEsperado)} color="#6366F1" />
        <Stat label="Valor total" value={formatMoney(resumen.valorTotal)} />
      </div>

      {resumen.proximoAVencer && (
        <div className="rounded-xl border border-[#1E1E1E] bg-[#0F0F0F] p-4 mb-5">
          <p className="text-[11px] uppercase tracking-wide text-[#5A5A5A] mb-2">Proximo a vencer</p>
          <div className="grid sm:grid-cols-4 gap-3">
            <Stat label="Entidad" value={resumen.proximoAVencer.entidad || '—'} />
            <Stat label="Monto" value={formatMoney(resumen.proximoAVencer.capital)} />
            <Stat label="Vencimiento" value={`${formatDateHuman(resumen.proximoAVencer.fechaVencimiento)} (${resumen.proximoAVencer.diasRestantes}d)`} />
            <Stat label="Valor al vencimiento" value={formatMoney(resumen.proximoAVencer.valorAlVencimiento)} color="#4ADE80" />
          </div>
        </div>
      )}

      {resumen.evolucion.length > 1 && (
        <div className="mb-6">
          <p className="text-[13.5px] text-[#D4D4D4] font-medium mb-2">Evolucion global del portafolio</p>
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resumen.evolucion} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                <defs>
                  <linearGradient id="cdtGlobalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="fecha" tick={{ fill: '#5A5A5A', fontSize: 10 }} axisLine={{ stroke: '#1E1E1E' }} tickLine={false} minTickGap={40} tickFormatter={(v) => formatDateHuman(v)} />
                <YAxis tick={{ fill: '#5A5A5A', fontSize: 10 }} axisLine={false} tickLine={false} width={64} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip content={<TooltipGlobal />} />
                <Area type="monotone" dataKey="valor" stroke="#6366F1" strokeWidth={2} fill="url(#cdtGlobalFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div>
        <p className="text-[13.5px] text-[#D4D4D4] font-medium mb-2">Mis CDTs</p>
        <div className="flex flex-col gap-2">
          {resumen.cdtsConRendimiento.map((cdt) => (
            <CDTRow
              key={cdt.id}
              cdt={cdt}
              expandido={expandido === cdt.id}
              onToggle={() => setExpandido((e) => (e === cdt.id ? null : cdt.id))}
              onEditar={() => setEditando(cdt)}
              onEliminar={() => setEliminando(cdt)}
            />
          ))}
        </div>
      </div>

      {editando && <NuevoCDTModal cdtExistente={editando} onClose={() => setEditando(null)} />}
      {eliminando && (
        <ConfirmModal
          title="¿Eliminar este CDT?"
          message="Esta accion eliminara el registro del CDT y todos sus calculos de rendimiento."
          onConfirm={() => deleteCDT(eliminando.id)}
          onClose={() => setEliminando(null)}
        />
      )}
    </Modal>
  );
}

function CDTRow({ cdt, expandido, onToggle, onEditar, onEliminar }) {
  const evolucion = expandido ? getEvolucionCDT(cdt) : [];
  return (
    <div className="rounded-xl border border-[#1E1E1E] bg-[#101010] overflow-hidden">
      <div
        onClick={onToggle}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        className="w-full flex items-center gap-3 px-3.5 py-3 text-left cursor-pointer"
        role="button"
        tabIndex={0}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#D4D4D4] font-mono">
            {cdt.entidad || 'CDT'} {cdt.nombre ? `— ${cdt.nombre}` : ''} · {formatMoney(cdt.capital)}
          </p>
          <p className="text-[11px] text-[#5A5A5A] mt-0.5">
            {formatPct(cdt.tasaEA)} E.A. · {cdt.vencido ? 'Vencido' : `dia ${cdt.diasTranscurridos}/${cdt.plazoDias}`} · vence {formatDateHuman(cdt.fechaVencimiento)}
          </p>
        </div>
        <span className="font-mono text-[13px] flex-shrink-0" style={{ color: cdt.vencido ? '#9A9AA0' : '#4ADE80' }}>
          +{formatMoney(cdt.rendimientoAcumulado)}
        </span>
        {cdt.vencido && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9A9AA0]/10 text-[#9A9AA0] flex-shrink-0">Vencido</span>}
        <button onClick={(e) => { e.stopPropagation(); onEditar(); }} title="Editar CDT" className="w-7 h-7 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2F2F2] hover:bg-[#1E1E1E] flex-shrink-0">
          <Pencil size={12} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEliminar(); }} title="Eliminar CDT" className="w-7 h-7 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2685C] hover:bg-[#1E1E1E] flex-shrink-0">
          <Trash2 size={12} />
        </button>
        {expandido ? <ChevronUp size={14} className="text-[#5A5A5A] flex-shrink-0" /> : <ChevronDown size={14} className="text-[#5A5A5A] flex-shrink-0" />}
      </div>

      {expandido && (
        <div className="px-3.5 pb-4">
          <div className="grid grid-cols-4 gap-2 mb-3">
            <Stat label="Rend. diario aprox." value={'+' + formatMoney(cdt.rendimientoDiarioAprox)} color="#4ADE80" />
            <Stat label="Dias restantes" value={String(cdt.diasRestantes)} />
            <Stat label="Rend. esperado total" value={'+' + formatMoney(cdt.rendimientoEsperadoTotal)} color="#6366F1" />
            <Stat label="Valor al vencimiento" value={formatMoney(cdt.valorAlVencimiento)} />
          </div>
          {evolucion.length > 1 ? (
            <div className="h-[130px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`fill-${cdt.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4ADE80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="fecha" tick={{ fill: '#5A5A5A', fontSize: 9.5 }} axisLine={false} tickLine={false} minTickGap={40} tickFormatter={(v) => formatDateHuman(v)} />
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Tooltip content={<TooltipIndividual />} />
                  <Area type="monotone" dataKey="valorTotal" stroke="#4ADE80" strokeWidth={1.75} fill={`url(#fill-${cdt.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[11.5px] text-[#5A5A5A]">Sin suficientes dias transcurridos para graficar todavia.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color = '#E5E5E5' }) {
  return (
    <div>
      <p className="font-mono text-[14px]" style={{ color }}>{value}</p>
      <p className="text-[10px] text-[#5A5A5A] mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function TooltipGlobal({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#1E1E1E] bg-[#0F0F0F] px-3 py-2 text-[11.5px]">
      <p className="text-[#D4D4D4]">{formatDateHuman(label)}</p>
      <p className="text-[#9A9AA0] font-mono">Capital: {formatMoney(d.capital)}</p>
      <p className="text-[#4ADE80] font-mono">Rendimiento: +{formatMoney(d.rendimiento)}</p>
      <p className="text-[#6366F1] font-mono">Valor total: {formatMoney(d.valor)}</p>
    </div>
  );
}

function TooltipIndividual({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#1E1E1E] bg-[#0F0F0F] px-3 py-2 text-[11.5px]">
      <p className="text-[#D4D4D4]">{formatDateHuman(label)}</p>
      <p className="text-[#9A9AA0] font-mono">Capital: {formatMoney(d.capital)}</p>
      <p className="text-[#4ADE80] font-mono">Rend. acumulado: +{formatMoney(d.rendimientoAcumulado)}</p>
      <p className="text-[#6366F1] font-mono">Valor total: {formatMoney(d.valorTotal)}</p>
    </div>
  );
}

export function NuevoCDTModal({ onClose, cdtExistente }) {
  const { addCDT, editCDT } = useFinance();
  const editando = !!cdtExistente;
  const [entidad, setEntidad] = useState(cdtExistente?.entidad || '');
  const [nombre, setNombre] = useState(cdtExistente?.nombre || '');
  const [capital, setCapital] = useState(cdtExistente?.capital ?? '');
  const [fechaApertura, setFechaApertura] = useState(cdtExistente?.fechaApertura || new Date().toISOString().slice(0, 10));
  const [fechaVencimiento, setFechaVencimiento] = useState(cdtExistente?.fechaVencimiento || '');
  const [tasaEA, setTasaEA] = useState(cdtExistente ? (cdtExistente.tasaEA * 100).toString() : '');

  const submit = (e) => {
    e.preventDefault();
    const cap = Number(capital);
    const tasa = Number(tasaEA) / 100;
    if (!cap || !fechaVencimiento || !tasa) return;
    const payload = { entidad, nombre, capital: cap, fechaApertura, fechaVencimiento, tasaEA: tasa };
    if (editando) editCDT(cdtExistente.id, payload);
    else addCDT(payload);
    onClose();
  };

  return (
    <Modal title={editando ? 'Editar CDT' : 'Nuevo CDT'} onClose={onClose} width="max-w-[400px]">
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Entidad</FieldLabel>
            <input type="text" value={entidad} onChange={(e) => setEntidad(e.target.value)} className={inputClass} placeholder="Ej: Bancolombia" />
          </div>
          <div>
            <FieldLabel>Nombre (opcional)</FieldLabel>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} />
          </div>
        </div>
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
