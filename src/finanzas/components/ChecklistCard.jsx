import React, { useMemo, useState } from 'react';
import { ListChecks, Check } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getPlanMensual, formatMoney } from '../engine/calculos';
import { getChecklistDelMes } from '../engine/checklist';
import Modal, { FieldLabel, inputClass } from './Modal';

const GRUPO_ORDEN = ['GASTOS_FIJOS', 'DEUDAS', 'AHORRO_METAS'];

export default function ChecklistCard() {
  const { planEfectivo, mesActivo, checklistOverrides, marcarChecklistPendiente } = useFinance();
  const [ejecutarItem, setEjecutarItem] = useState(null);

  const plan = getPlanMensual(planEfectivo, mesActivo);
  const items = useMemo(() => getChecklistDelMes(plan), [plan]);

  const conEstado = items.map((item) => ({
    ...item,
    override: checklistOverrides[item.id],
  }));

  const pendientes = conEstado.filter((i) => !i.override).length;
  const ejecutados = conEstado.length - pendientes;

  const grupos = GRUPO_ORDEN.map((g) => ({
    grupo: g,
    label: conEstado.find((i) => i.grupo === g)?.grupoLabel || g,
    items: conEstado.filter((i) => i.grupo === g),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-display text-[#9A9AA0] flex items-center gap-1.5">
          <ListChecks size={14} /> Checklist del mes
        </span>
        <span className="text-[11.5px] text-[#5A5A5A] font-mono">
          {ejecutados}/{conEstado.length} ejecutados · {pendientes} pendientes
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mt-5">
        {grupos.map((g) => (
          <div key={g.grupo}>
            <p className="text-[11.5px] uppercase tracking-wide text-[#5A5A5A] mb-2.5">{g.label}</p>
            <div className="flex flex-col gap-2">
              {g.items.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  onEjecutar={() => setEjecutarItem(item)}
                  onRevertir={() => marcarChecklistPendiente(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {ejecutarItem && <EjecutarModal item={ejecutarItem} onClose={() => setEjecutarItem(null)} />}
    </div>
  );
}

function ChecklistRow({ item, onEjecutar, onRevertir }) {
  const ejecutado = !!item.override;
  return (
    <button
      onClick={ejecutado ? onRevertir : onEjecutar}
      className="flex items-center gap-2.5 text-left group"
    >
      <span
        className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-colors ${
          ejecutado ? 'bg-[#4ADE80] border-[#4ADE80]' : 'border-[#333] group-hover:border-[#666]'
        }`}
      >
        {ejecutado && <Check size={11} className="text-black" />}
      </span>
      <span className="flex-1 min-w-0">
        <p className={`text-[13.5px] leading-tight truncate ${ejecutado ? 'text-[#5A5A5A] line-through' : 'text-[#D4D4D4]'}`}>
          {item.concepto}
        </p>
        <p className="text-[11px] text-[#5A5A5A] font-mono mt-0.5">
          {ejecutado ? formatMoney(item.override.montoReal) : formatMoney(item.montoPlan)}
        </p>
      </span>
    </button>
  );
}

function EjecutarModal({ item, onClose }) {
  const { marcarChecklistEjecutado } = useFinance();
  const [montoReal, setMontoReal] = useState(item.montoPlan);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  const submit = (e) => {
    e.preventDefault();
    marcarChecklistEjecutado(item, { montoReal: Number(montoReal), fecha });
    onClose();
  };

  const diferencia = item.montoPlan - Number(montoReal || 0);

  return (
    <Modal title={`Ejecutar — ${item.concepto}`} onClose={onClose} width="max-w-[380px]">
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div>
          <FieldLabel>Monto planificado</FieldLabel>
          <p className="font-mono text-[15px] text-[#75757A]">{formatMoney(item.montoPlan)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Monto real</FieldLabel>
            <input
              type="number"
              min="0"
              value={montoReal}
              onChange={(e) => setMontoReal(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <FieldLabel>Fecha</FieldLabel>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} required />
          </div>
        </div>

        {diferencia !== 0 && (
          <p className="text-[12px] font-mono" style={{ color: diferencia > 0 ? '#4ADE80' : '#F2685C' }}>
            {diferencia > 0 ? `Favorable: ${formatMoney(diferencia)}` : `Sobre lo planificado: ${formatMoney(-diferencia)}`}
          </p>
        )}

        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#4ADE80] text-black text-[13px] font-medium">
            Marcar ejecutado
          </button>
        </div>
      </form>
    </Modal>
  );
}
