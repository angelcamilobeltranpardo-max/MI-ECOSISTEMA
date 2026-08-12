import React, { useMemo, useState } from 'react';
import { Search, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { formatMoney, formatDateHuman, ymOfDate, monthFullLabel } from '../engine/calculos';
import Modal, { FieldLabel, inputClass, selectClass, ConfirmModal } from './Modal';

const TIPO_LABEL = { INGRESO: 'Ingreso', GASTO: 'Gasto', AHORRO: 'Ahorro', APORTE_META: 'Aporte a meta', COMPRA: 'Compra', INVERSION: 'Inversion' };
const TIPO_COLOR = { INGRESO: '#4ADE80', GASTO: '#F2685C', AHORRO: '#3B82F6', APORTE_META: '#6366F1', COMPRA: '#F1BD3D', INVERSION: '#22D3EE' };

export default function MovimientosView({ onVolver }) {
  const { movimientos, deleteMovimiento } = useFinance();
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const categorias = useMemo(() => Array.from(new Set(movimientos.map((m) => m.categoria))).sort(), [movimientos]);
  const periodos = useMemo(() => Array.from(new Set(movimientos.map((m) => ymOfDate(m.fecha)))).sort().reverse(), [movimientos]);

  const filtrados = useMemo(() => {
    return movimientos
      .filter((m) => (filtroTipo === 'todos' ? true : m.tipo === filtroTipo))
      .filter((m) => (filtroCategoria === 'todas' ? true : m.categoria === filtroCategoria))
      .filter((m) => (filtroPeriodo === 'todos' ? true : ymOfDate(m.fecha) === filtroPeriodo))
      .filter((m) => {
        if (!busqueda.trim()) return true;
        const q = busqueda.trim().toLowerCase();
        return m.concepto.toLowerCase().includes(q) || m.categoria.toLowerCase().includes(q) || (m.nota || '').toLowerCase().includes(q);
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || (b.createdAt || 0) - (a.createdAt || 0));
  }, [movimientos, filtroTipo, filtroCategoria, filtroPeriodo, busqueda]);

  const totalIngresos = filtrados.filter((m) => m.tipo === 'INGRESO').reduce((s, m) => s + m.monto, 0);
  const totalGastos = filtrados.filter((m) => m.tipo === 'GASTO').reduce((s, m) => s + m.monto, 0);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onVolver}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#141414] border border-[#1A1A1A] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          <h2 className="font-display text-[26px] font-light text-[#F2F2F2]">Movimientos</h2>
        </div>
        <div className="flex items-center gap-4 text-[12.5px] font-mono">
          <span className="text-[#4ADE80]">+{formatMoney(totalIngresos)}</span>
          <span className="text-[#F2685C]">-{formatMoney(totalGastos)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar concepto, categoria o nota..."
            className="w-full rounded-full border border-[#1E1E1E] bg-[#141414] pl-9 pr-4 py-2.5 text-[13px] text-[#E5E5E5] outline-none focus:border-[#3B82F6]"
          />
        </div>

        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="rounded-full border border-[#1E1E1E] bg-[#141414] px-3.5 py-2.5 text-[12.5px] text-[#D4D4D4] outline-none">
          <option value="todos">Todos los tipos</option>
          {Object.entries(TIPO_LABEL).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </select>

        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="rounded-full border border-[#1E1E1E] bg-[#141414] px-3.5 py-2.5 text-[12.5px] text-[#D4D4D4] outline-none">
          <option value="todas">Todas las categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)} className="rounded-full border border-[#1E1E1E] bg-[#141414] px-3.5 py-2.5 text-[12.5px] text-[#D4D4D4] outline-none">
          <option value="todos">Todos los meses</option>
          {periodos.map((p) => (
            <option key={p} value={p}>{monthFullLabel(p)}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-[#1A1A1A] bg-[#141414] overflow-hidden">
        {filtrados.length === 0 ? (
          <p className="text-center text-[13px] text-[#5A5A5A] py-12">No hay movimientos que coincidan con estos filtros.</p>
        ) : (
          <div className="divide-y divide-[#1E1E1E]">
            {filtrados.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: TIPO_COLOR[m.tipo] }} />

                <div className="w-[92px] flex-shrink-0 text-[11.5px] text-[#5A5A5A] font-mono hidden sm:block">
                  {formatDateHuman(m.fecha)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] text-[#E5E5E5] truncate">{m.concepto}</p>
                  <p className="text-[11px] text-[#5A5A5A] mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded-full bg-[#1E1E1E]">{m.categoria}</span>
                    <span className="sm:hidden">{formatDateHuman(m.fecha)}</span>
                    {m.nota && <span className="italic truncate max-w-[220px]">{m.nota}</span>}
                  </p>
                </div>

                <span className="font-mono text-[13.5px] flex-shrink-0" style={{ color: m.tipo === 'INGRESO' ? '#4ADE80' : m.tipo === 'GASTO' ? '#F2685C' : '#D4D4D4' }}>
                  {m.tipo === 'INGRESO' ? '+' : m.tipo === 'GASTO' ? '-' : ''}
                  {formatMoney(m.monto)}
                </span>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditando(m)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2F2F2] hover:bg-[#1E1E1E] transition-colors" title="Editar">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setEliminando(m)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2685C] hover:bg-[#1E1E1E] transition-colors" title="Eliminar">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editando && <EditarMovimientoModal movimiento={editando} onClose={() => setEditando(null)} />}
      {eliminando && (
        <ConfirmModal
          title="¿Eliminar este movimiento?"
          message="Esta accion modificara los calculos financieros asociados."
          confirmLabel="Eliminar"
          onConfirm={() => deleteMovimiento(eliminando.id)}
          onClose={() => setEliminando(null)}
        />
      )}
    </div>
  );
}

function EditarMovimientoModal({ movimiento, onClose }) {
  const { editMovimiento } = useFinance();
  const [fecha, setFecha] = useState(movimiento.fecha);
  const [concepto, setConcepto] = useState(movimiento.concepto);
  const [categoria, setCategoria] = useState(movimiento.categoria);
  const [monto, setMonto] = useState(movimiento.monto);
  const [nota, setNota] = useState(movimiento.nota || '');

  const submit = (e) => {
    e.preventDefault();
    const m = Number(monto);
    if (!m || m <= 0) return;
    editMovimiento(movimiento.id, { fecha, concepto: concepto.trim(), categoria: categoria.trim(), monto: m, nota: nota.trim() });
    onClose();
  };

  return (
    <Modal title={`Editar — ${TIPO_LABEL[movimiento.tipo]}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Fecha</FieldLabel>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <FieldLabel>Monto</FieldLabel>
            <input type="number" min="0" step="1" value={monto} onChange={(e) => setMonto(e.target.value)} className={inputClass} required />
          </div>
        </div>
        <div>
          <FieldLabel>Concepto</FieldLabel>
          <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)} className={selectClass} required />
        </div>
        <div>
          <FieldLabel>Categoria</FieldLabel>
          <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} className={selectClass} required />
        </div>
        <div>
          <FieldLabel>Nota (opcional)</FieldLabel>
          <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} className={selectClass} />
        </div>
        <div className="flex gap-2.5 mt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F2F2F2]">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#3B82F6] text-white text-[13px] font-normal">
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}
