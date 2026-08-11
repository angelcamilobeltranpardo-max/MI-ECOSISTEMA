import React, { useState } from 'react';
import { Home, Check, RotateCcw } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getIndependencia, ordenarPorPrioridad, formatMoney, formatPct } from '../engine/calculos';
import Modal, { FieldLabel, inputClass, selectClass } from './Modal';

const PRIORIDAD_LABEL = { CRITICO: 'Critico', IMPORTANTE: 'Importante' };
const PRIORIDAD_COLOR = { CRITICO: '#F2685C', IMPORTANTE: '#F1BD3D' };

export default function IndependenciaCard() {
  const { planOficial, movimientos, mesActivo, articulosIndependencia, metaComprasIndependencia } = useFinance();
  const [comprarItem, setComprarItem] = useState(null);

  const articulos = Object.values(articulosIndependencia);
  const data = getIndependencia(planOficial, movimientos, articulosIndependencia, metaComprasIndependencia);
  const ordenados = ordenarPorPrioridad(articulos);

  const comprados = articulos.filter((a) => a.estado === 'COMPRADO').length;

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] lg:col-span-2 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-[#75757A] flex items-center gap-1.5">
          <Home size={12} /> Independizarme
        </span>
        <span className="text-[10.5px] text-[#5A5A5A] font-mono">
          {comprados}/{articulos.length} articulos comprados
        </span>
      </div>

      <div className="flex items-end justify-between mt-3">
        <div>
          <p className="font-display text-[28px] font-light text-[#F2F2F2] leading-none">
            {formatMoney(data.fondoPlanAcumulado)}
            <span className="text-[14px] text-[#5A5A5A] font-sans"> / {formatMoney(data.metaCompras)}</span>
          </p>
          <p className="text-[11px] text-[#5A5A5A] mt-1 font-mono">Fondo proyectado (plan) vs. presupuesto de compras</p>
        </div>
        <p className="font-mono text-[20px] text-[#6366F1]">{formatPct(data.progresoPlanPct)}</p>
      </div>

      <div className="h-1.5 rounded-full bg-[#1E1E1E] overflow-hidden mt-3">
        <div
          className="h-full rounded-full bg-[#6366F1] transition-all"
          style={{ width: `${Math.min(data.progresoPlanPct, 1) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1E1E1E]">
        <MiniStat label="Diferencia inicial" value={formatMoney(data.diferenciaInicial)} note="no es un deficit definitivo" />
        <MiniStat label="Presupuesto restante" value={formatMoney(data.presupuestoRestante)} />
        <MiniStat
          label="Ahorro conseguido"
          value={formatMoney(data.ahorroConseguido)}
          color={data.ahorroConseguido >= 0 ? '#4ADE80' : '#F2685C'}
        />
      </div>

      <div className="mt-4 pt-4 border-t border-[#1E1E1E] flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
        {ordenados.map((item) => (
          <ArticuloRow key={item.id} item={item} onComprar={() => setComprarItem(item)} />
        ))}
      </div>

      {comprarItem && <ComprarArticuloModal item={comprarItem} onClose={() => setComprarItem(null)} />}
    </div>
  );
}

function MiniStat({ label, value, note, color = '#E5E5E5' }) {
  return (
    <div>
      <p className="font-mono text-[14px]" style={{ color }}>
        {value}
      </p>
      <p className="text-[10.5px] text-[#5A5A5A] mt-0.5 leading-tight">
        {label}
        {note && <span className="block text-[9.5px] text-[#454545]">({note})</span>}
      </p>
    </div>
  );
}

function ArticuloRow({ item, onComprar }) {
  const { desmarcarArticulo } = useFinance();
  const comprado = item.estado === 'COMPRADO';

  return (
    <div className="flex items-center gap-3 py-1.5">
      <button
        onClick={() => (comprado ? desmarcarArticulo(item.id) : onComprar())}
        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
          comprado ? 'bg-[#4ADE80] border-[#4ADE80]' : 'border-[#333] hover:border-[#666]'
        }`}
      >
        {comprado ? <Check size={12} className="text-black" /> : null}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-[12.5px] truncate ${comprado ? 'text-[#75757A] line-through' : 'text-[#D4D4D4]'}`}>{item.nombre}</p>
        {item.prioridad && (
          <span className="text-[9.5px] font-mono" style={{ color: PRIORIDAD_COLOR[item.prioridad] }}>
            {PRIORIDAD_LABEL[item.prioridad]}
          </span>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        {comprado ? (
          <>
            <p className="font-mono text-[12px] text-[#E5E5E5]">{formatMoney(item.precioReal)}</p>
            <p className="text-[9.5px] text-[#5A5A5A] font-mono">de {formatMoney(item.precioObjetivo)}</p>
          </>
        ) : (
          <p className="font-mono text-[12px] text-[#75757A]">{formatMoney(item.precioObjetivo)}</p>
        )}
      </div>

      {comprado && (
        <button onClick={() => desmarcarArticulo(item.id)} className="text-[#5A5A5A] hover:text-[#F2F2F2] flex-shrink-0">
          <RotateCcw size={12} />
        </button>
      )}
    </div>
  );
}

function ComprarArticuloModal({ item, onClose }) {
  const { marcarArticuloComprado } = useFinance();
  const [precioReal, setPrecioReal] = useState(item.precioObjetivo);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [proveedorReal, setProveedorReal] = useState(item.proveedorSugerido || '');

  const submit = (e) => {
    e.preventDefault();
    marcarArticuloComprado(item.id, { precioReal: Number(precioReal), fecha, proveedorReal });
    onClose();
  };

  const ahorro = item.precioObjetivo - Number(precioReal || 0);

  return (
    <Modal title={`Registrar compra — ${item.nombre}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div>
          <FieldLabel>Presupuesto planificado</FieldLabel>
          <p className="font-mono text-[15px] text-[#75757A]">{formatMoney(item.precioObjetivo)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Precio real pagado</FieldLabel>
            <input
              type="number"
              min="0"
              value={precioReal}
              onChange={(e) => setPrecioReal(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <FieldLabel>Fecha de compra</FieldLabel>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} required />
          </div>
        </div>

        <div>
          <FieldLabel>Proveedor</FieldLabel>
          <input type="text" value={proveedorReal} onChange={(e) => setProveedorReal(e.target.value)} className={selectClass} />
        </div>

        <p className="text-[12px] font-mono" style={{ color: ahorro >= 0 ? '#4ADE80' : '#F2685C' }}>
          {ahorro >= 0 ? `Ahorro conseguido: ${formatMoney(ahorro)}` : `Sobre el presupuesto: ${formatMoney(-ahorro)}`}
        </p>

        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#6366F1] text-white text-[13px] font-normal">
            Confirmar compra
          </button>
        </div>
      </form>
    </Modal>
  );
}
