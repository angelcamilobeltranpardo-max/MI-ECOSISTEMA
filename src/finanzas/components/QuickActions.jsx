import React, { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Target, ShoppingBag, TrendingUp } from 'lucide-react';
import Modal, { FieldLabel, inputClass, selectClass } from './Modal';
import { useFinance } from '../state/FinanceContext';

const TIPOS = [
  { tipo: 'INGRESO', label: 'Ingreso', icon: ArrowUpCircle, color: '#4ADE80' },
  { tipo: 'GASTO', label: 'Gasto', icon: ArrowDownCircle, color: '#F2685C' },
  { tipo: 'AHORRO', label: 'Ahorro', icon: PiggyBank, color: '#3B82F6' },
  { tipo: 'APORTE_META', label: 'Aporte a meta', icon: Target, color: '#6366F1' },
  { tipo: 'COMPRA', label: 'Compra', icon: ShoppingBag, color: '#F1BD3D' },
  { tipo: 'INVERSION', label: 'Inversion', icon: TrendingUp, color: '#22D3EE' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function QuickActions() {
  const [openTipo, setOpenTipo] = useState(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {TIPOS.map(({ tipo, label, icon: Icon, color }) => (
          <button
            key={tipo}
            onClick={() => setOpenTipo(tipo)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#141414] border border-[#1A1A1A] text-[12px] text-[#D4D4D4] hover:border-[#2A2A2A] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
          >
            <Icon size={13} style={{ color }} />
            {label}
          </button>
        ))}
      </div>

      {openTipo && <MovimientoForm tipo={openTipo} onClose={() => setOpenTipo(null)} />}
    </>
  );
}

function MovimientoForm({ tipo, onClose }) {
  const { addMovimiento, mesActivo } = useFinance();
  const meta = TIPOS.find((t) => t.tipo === tipo);

  const [fecha, setFecha] = useState(todayStr());
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [monto, setMonto] = useState('');
  const [etiqueta, setEtiqueta] = useState('personal');
  const [fondoAhorro, setFondoAhorro] = useState('Fondo emergencia (Pesos)');

  const submit = (e) => {
    e.preventDefault();
    const m = Number(monto);
    if (!m || m <= 0) return;

    const movimiento = {
      tipo,
      fecha,
      concepto: concepto.trim() || meta.label,
      categoria: tipo === 'AHORRO' ? fondoAhorro : categoria.trim() || meta.label,
      monto: m,
      etiqueta: tipo === 'GASTO' ? etiqueta : null,
      proyecto: tipo === 'APORTE_META' ? 'independencia' : null,
    };
    addMovimiento(movimiento);
    onClose();
  };

  return (
    <Modal title={`Nuevo movimiento — ${meta.label}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Fecha</FieldLabel>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <FieldLabel>Monto</FieldLabel>
            <input
              type="number"
              min="0"
              step="1"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div>
          <FieldLabel>Concepto</FieldLabel>
          <input
            type="text"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder={`Ej: ${tipo === 'GASTO' ? 'Almuerzo' : tipo === 'INGRESO' ? 'Pago extra' : meta.label}`}
            className={selectClass}
          />
        </div>

        {tipo === 'AHORRO' && (
          <div>
            <FieldLabel>Fondo</FieldLabel>
            <select value={fondoAhorro} onChange={(e) => setFondoAhorro(e.target.value)} className={selectClass}>
              <option>Fondo emergencia (Pesos)</option>
              <option>Fondo emergencia (Dolares)</option>
            </select>
          </div>
        )}

        {tipo === 'APORTE_META' && (
          <p className="text-[11.5px] text-[#75757A] -mt-1.5">Este aporte se contara para el proyecto Independencia.</p>
        )}

        {tipo !== 'AHORRO' && tipo !== 'APORTE_META' && (
          <div>
            <FieldLabel>Categoria</FieldLabel>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ej: Comida, Transporte..."
              className={selectClass}
            />
          </div>
        )}

        {tipo === 'GASTO' && (
          <div>
            <FieldLabel>¿A que afecta este gasto?</FieldLabel>
            <select value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} className={selectClass}>
              <option value="personal">Dinero para mi (Daily Pacing)</option>
              <option value="flujoLibre">Flujo libre</option>
              <option value="fijo">Gasto fijo ya presupuestado</option>
              <option value="deuda">Deuda ya presupuestada</option>
            </select>
            <p className="text-[11px] text-[#75757A] mt-1.5">
              Si es una obligacion fija o deuda de este mes, mejor marcala desde el Checklist para no duplicarla aqui.
            </p>
          </div>
        )}

        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-full bg-[#3B82F6] text-white text-[13px] font-normal transition-transform active:scale-[0.98]"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
