import React, { useState } from 'react';
import {
  Home, Check, RotateCcw, Refrigerator, WashingMachine, Tv, Sofa,
  Table2, UtensilsCrossed, Utensils, Gamepad2, Speaker, Palette, SprayCan, Package,
} from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getIndependenciaConDisponibilidad, formatMoney, formatPct } from '../engine/calculos';
import Modal, { FieldLabel, inputClass, selectClass } from './Modal';

const PRIORIDAD_LABEL = { CRITICO: 'Critico', IMPORTANTE: 'Importante' };
const PRIORIDAD_COLOR = { CRITICO: '#F2685C', IMPORTANTE: '#F1BD3D' };

// Icono representativo por articulo. No son fotos reales del producto (no
// tenemos imagenes reales para inventar) -- son iconos de categoria, que se
// pueden reemplazar mas adelante por una foto real si se agrega ese campo.
const ICONOS = {
  nevera: Refrigerator,
  lavadora: WashingMachine,
  'televisor-smart-60': Tv,
  'sofa-2-3-puestos': Sofa,
  'mesa-comedor-2-sillas': Table2,
  'utensilios-cocina': UtensilsCrossed,
  'loza-basica-platos-vasos': Utensils,
  'play-5': Gamepad2,
  'teatro-en-casa': Speaker,
  'decoracion-tapetes-etc': Palette,
  'kit-limpieza': SprayCan,
};

export default function IndependenciaCard() {
  const { planEfectivo, movimientos, articulosIndependencia, metaComprasIndependencia } = useFinance();
  const [comprarItem, setComprarItem] = useState(null);

  const data = getIndependenciaConDisponibilidad(planEfectivo, movimientos, articulosIndependencia, metaComprasIndependencia);
  const articulos = Object.values(articulosIndependencia);
  const comprados = articulos.filter((a) => a.estado === 'COMPRADO').length;

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[15px] font-display text-[#9A9AA0] flex items-center gap-1.5">
          <Home size={14} /> Independizarme
        </span>
        <span className="text-[11.5px] text-[#5A5A5A] font-mono">
          {comprados}/{articulos.length} articulos comprados
        </span>
      </div>

      <div className="flex items-end justify-between mt-3 flex-wrap gap-2">
        <div>
          <p className="font-display text-[29px] font-light text-[#F2F2F2] leading-none">
            {formatMoney(data.fondoPlanAcumulado)}
            <span className="text-[15px] text-[#5A5A5A] font-sans"> / {formatMoney(data.metaCompras)}</span>
          </p>
          <p className="text-[12px] text-[#5A5A5A] mt-1.5 font-mono">Fondo proyectado (plan) vs. presupuesto de compras</p>
        </div>
        <p className="font-mono text-[21px] text-[#6366F1]">{formatPct(data.progresoPlanPct)}</p>
      </div>

      <div className="h-2 rounded-full bg-[#1E1E1E] overflow-hidden mt-3">
        <div className="h-full rounded-full bg-[#6366F1] transition-all" style={{ width: `${Math.min(data.progresoPlanPct, 1) * 100}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1E1E1E]">
        <MiniStat label="Diferencia inicial" value={formatMoney(data.diferenciaInicial)} note="no es un deficit definitivo" />
        <MiniStat label="Presupuesto restante" value={formatMoney(data.presupuestoRestante)} />
        <MiniStat label="Ahorro conseguido" value={formatMoney(data.ahorroConseguido)} color={data.ahorroConseguido >= 0 ? '#4ADE80' : '#F2685C'} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1E1E1E]">
        {data.articulosConDisponibilidad.map((item) => (
          <ArticuloCard key={item.id} item={item} onComprar={() => setComprarItem(item)} />
        ))}
      </div>

      {comprarItem && <ComprarArticuloModal item={comprarItem} onClose={() => setComprarItem(null)} />}
    </div>
  );
}

function MiniStat({ label, value, note, color = '#E5E5E5' }) {
  return (
    <div>
      <p className="font-mono text-[14.5px]" style={{ color }}>
        {value}
      </p>
      <p className="text-[11px] text-[#5A5A5A] mt-0.5 leading-tight">
        {label}
        {note && <span className="block text-[10px] text-[#454545]">({note})</span>}
      </p>
    </div>
  );
}

function ArticuloCard({ item, onComprar }) {
  const { desmarcarArticulo } = useFinance();
  const comprado = item.estado === 'COMPRADO';
  const Icono = ICONOS[item.id] || Package;
  const badgeColor = item.prioridad ? PRIORIDAD_COLOR[item.prioridad] : '#54545A';
  const barColor = comprado ? '#4ADE80' : item.pctDisponible >= 1 ? '#4ADE80' : item.pctDisponible > 0 ? '#F1BD3D' : '#3A3A3A';

  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-2.5 transition-colors ${comprado ? 'border-[#4ADE80]/25 bg-[#4ADE80]/[0.03]' : 'border-[#1E1E1E] bg-[#101010]'}`}>
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${badgeColor}1A`, color: badgeColor }}
        >
          <Icono size={17} />
        </div>
        <button
          onClick={() => (comprado ? desmarcarArticulo(item.id) : onComprar())}
          className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-colors ${
            comprado ? 'bg-[#4ADE80] border-[#4ADE80]' : 'border-[#333] hover:border-[#666]'
          }`}
          title={comprado ? 'Marcar como pendiente' : 'Marcar como comprado'}
        >
          {comprado && <Check size={11} className="text-black" />}
        </button>
      </div>

      <div>
        <p className={`text-[12.5px] leading-tight ${comprado ? 'text-[#75757A] line-through' : 'text-[#D4D4D4]'}`}>{item.nombre}</p>
        {item.prioridad && (
          <span className="text-[10px] font-mono mt-0.5 inline-block" style={{ color: badgeColor }}>
            {PRIORIDAD_LABEL[item.prioridad]}
          </span>
        )}
      </div>

      <div>
        {comprado ? (
          <p className="font-mono text-[12.5px] text-[#E5E5E5]">
            {formatMoney(item.precioReal)} <span className="text-[10px] text-[#5A5A5A]">de {formatMoney(item.precioObjetivo)}</span>
          </p>
        ) : (
          <p className="font-mono text-[12.5px] text-[#9A9AA0]">{formatMoney(item.precioObjetivo)}</p>
        )}
      </div>

      <div>
        <div className="h-1.5 rounded-full bg-[#1E1E1E] overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(item.pctDisponible, 1) * 100}%`, background: barColor }} />
        </div>
        <p className="text-[10px] text-[#5A5A5A] mt-1 font-mono">
          {comprado ? 'Comprado' : `${formatPct(item.pctDisponible, 0)} disponible`}
        </p>
      </div>
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
            <input type="number" min="0" value={precioReal} onChange={(e) => setPrecioReal(e.target.value)} className={inputClass} required />
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
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors">
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
