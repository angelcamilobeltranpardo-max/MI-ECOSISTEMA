import React, { useState } from 'react';
import { Pencil, Trash2, FlaskConical, X } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getResumenDeuda, simularCronogramaDeuda, formatMoney, formatPct, formatDateHuman, monthFullLabel } from '../engine/calculos';
import Modal, { FieldLabel, inputClass, selectClass, ConfirmModal } from './Modal';

export default function DeudaDetalleModal({ deudaIdInicial, onClose }) {
  const { deudas, pagosDeuda, deleteDeuda, deletePagoDeuda } = useFinance();
  const [deudaId, setDeudaId] = useState(deudaIdInicial || deudas[0]?.id);
  const [editando, setEditando] = useState(false);
  const [eliminandoDeuda, setEliminandoDeuda] = useState(false);
  const [pagoEditando, setPagoEditando] = useState(null);
  const [pagoEliminando, setPagoEliminando] = useState(null);
  const [simulando, setSimulando] = useState(false);

  const deuda = deudas.find((d) => d.id === deudaId);
  const pagos = pagosDeuda.filter((p) => p.deudaId === deudaId).sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (!deuda) return null;
  const resumen = getResumenDeuda(deuda, pagos);
  const cronograma = simularCronogramaDeuda(deuda, pagos, { mesesFuturos: 24 });

  return (
    <Modal title="Deudas — detalle" onClose={onClose} width="max-w-[840px]">
      {deudas.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {deudas.map((d) => (
            <button
              key={d.id}
              onClick={() => setDeudaId(d.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${deudaId === d.id ? 'bg-[#3B82F6] text-white' : 'bg-[#0F0F0F] border border-[#1E1E1E] text-[#75757A]'}`}
            >
              {d.nombre}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <p className="text-[16px] text-[#F2F2F2] font-medium">{deuda.nombre}</p>
          {deuda.acreedor && <p className="text-[12px] text-[#5A5A5A]">{deuda.acreedor}</p>}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setEditando(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2F2F2] hover:bg-[#1E1E1E]" title="Editar deuda">
            <Pencil size={13} />
          </button>
          <button onClick={() => setEliminandoDeuda(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2685C] hover:bg-[#1E1E1E]" title="Eliminar deuda">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-5">
        <Stat label="Saldo actual" value={formatMoney(resumen.saldoActual)} color="#F2685C" />
        <Stat label="Proxima cuota" value={formatMoney(resumen.proximaCuotaMonto)} />
        <Stat label="Cuotas restantes (est.)" value={resumen.cuotasRestantesEstimadas ?? '—'} />
        <Stat label="Fin estimado" value={resumen.fechaFinEstimada ? monthFullLabel(resumen.fechaFinEstimada) : '—'} />
      </div>

      {resumen.interesRestanteEstimado !== null && (
        <p className="text-[11.5px] text-[#5A5A5A] mb-4">Interes restante estimado: <span className="font-mono text-[#D4D4D4]">{formatMoney(resumen.interesRestanteEstimado)}</span></p>
      )}

      {deuda.fechaVencimientoPlan && (
        <p className="text-[11px] text-[#454545] mb-5">
          Meta declarada: {formatDateHuman(deuda.fechaVencimientoPlan)}. La fecha de fin estimada arriba se calcula a partir de la cuota real registrada — si no coinciden, es informacion util, no un error.
        </p>
      )}

      {/* Cronograma dinamico */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13.5px] text-[#D4D4D4] font-medium">Cronograma proyectado</p>
          <button
            onClick={() => setSimulando((s) => !s)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11.5px] transition-colors ${simulando ? 'bg-[#F1BD3D]/15 text-[#F1BD3D]' : 'bg-[#0F0F0F] border border-[#1E1E1E] text-[#75757A]'}`}
          >
            <FlaskConical size={12} /> Simular escenario
          </button>
        </div>

        {simulando && <SimuladorPago deuda={deuda} pagos={pagos} onCerrar={() => setSimulando(false)} />}

        {!simulando && (
          <div className="rounded-xl border border-[#1E1E1E] overflow-hidden max-h-[260px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-[#141414]">
                <tr className="text-[#5A5A5A] text-left">
                  <th className="px-3 py-2 font-normal">Mes</th>
                  <th className="px-3 py-2 font-normal text-right">Cuota</th>
                  <th className="px-3 py-2 font-normal text-right">Capital</th>
                  <th className="px-3 py-2 font-normal text-right">Interes</th>
                  <th className="px-3 py-2 font-normal text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E1E]">
                {cronograma.map((f) => (
                  <tr key={f.mes} className="text-[#D4D4D4] font-mono">
                    <td className="px-3 py-2">{f.mesLabel}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(f.cuota)}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(f.capital)}</td>
                    <td className="px-3 py-2 text-right">{f.interes > 0 ? formatMoney(f.interes) : '—'}</td>
                    <td className="px-3 py-2 text-right">{formatMoney(f.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de pagos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13.5px] text-[#D4D4D4] font-medium">Pagos registrados</p>
          <button onClick={() => setPagoEditando('nuevo')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1B1B1B] text-[11.5px] text-[#9A9AA0] hover:text-[#F2F2F2]">
            + Registrar pago
          </button>
        </div>
        {pagos.length === 0 ? (
          <p className="text-[12px] text-[#5A5A5A]">Sin pagos registrados todavia.</p>
        ) : (
          <div className="rounded-xl border border-[#1E1E1E] overflow-hidden divide-y divide-[#1E1E1E]">
            {pagos.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 text-[12.5px]">
                <span className="text-[#5A5A5A] font-mono w-[80px] flex-shrink-0">{formatDateHuman(p.fecha)}</span>
                {p.fecha > new Date().toISOString().slice(0, 10) && (
                  <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-[#F1BD3D]/10 text-[#F1BD3D] flex-shrink-0">Planeado</span>
                )}
                {p.tipo === 'extraordinario' && <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-[#6366F1]/10 text-[#6366F1] flex-shrink-0">Extra</span>}
                <span className="flex-1 text-[#D4D4D4] font-mono">{formatMoney(p.monto)}</span>
                {p.nota && <span className="text-[#5A5A5A] italic truncate max-w-[160px]">{p.nota}</span>}
                <button onClick={() => setPagoEditando(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2F2F2] hover:bg-[#1E1E1E] flex-shrink-0">
                  <Pencil size={12} />
                </button>
                <button onClick={() => setPagoEliminando(p)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2685C] hover:bg-[#1E1E1E] flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editando && <NuevaDeudaModal deudaExistente={deuda} onClose={() => setEditando(false)} />}
      {eliminandoDeuda && (
        <ConfirmModal
          title="¿Eliminar esta deuda?"
          message="Se eliminaran tambien todos sus pagos registrados. Esta accion no se puede deshacer."
          onConfirm={() => { deleteDeuda(deuda.id); onClose(); }}
          onClose={() => setEliminandoDeuda(false)}
        />
      )}
      {pagoEditando && <RegistrarPagoModal deudaId={deuda.id} pagoExistente={pagoEditando === 'nuevo' ? null : pagoEditando} onClose={() => setPagoEditando(null)} />}
      {pagoEliminando && (
        <ConfirmModal
          title="¿Eliminar este pago?"
          message="El saldo de la deuda se recalculara automaticamente sin este pago."
          onConfirm={() => deletePagoDeuda(pagoEliminando.id)}
          onClose={() => setPagoEliminando(null)}
        />
      )}
    </Modal>
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

function SimuladorPago({ deuda, pagos, onCerrar }) {
  const { addPagoDeuda } = useFinance();
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [monto, setMonto] = useState('');

  const pagoHipotetico = monto ? { fecha: mes + '-15', monto: Number(monto) } : null;
  const cronogramaSimulado = simularCronogramaDeuda(deuda, pagos, { mesesFuturos: 24, pagoHipotetico });
  const cronogramaBase = simularCronogramaDeuda(deuda, pagos, { mesesFuturos: 24 });
  const finBase = cronogramaBase[cronogramaBase.length - 1]?.mes;
  const finSimulado = cronogramaSimulado[cronogramaSimulado.length - 1]?.mes;

  const confirmar = () => {
    if (!pagoHipotetico) return;
    addPagoDeuda({ deudaId: deuda.id, fecha: pagoHipotetico.fecha, monto: pagoHipotetico.monto, tipo: 'extraordinario', nota: 'Pago extraordinario planeado' });
    onCerrar();
  };

  return (
    <div className="rounded-xl border border-[#F1BD3D]/25 bg-[#F1BD3D]/[0.04] p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[12px] text-[#F1BD3D]">Simulacion — no se guarda hasta que confirmes</p>
        <button onClick={onCerrar} className="text-[#75757A] hover:text-[#F2F2F2]"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <FieldLabel>Mes del pago extra</FieldLabel>
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className={inputClass} />
        </div>
        <div>
          <FieldLabel>Monto adicional</FieldLabel>
          <input type="number" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} className={inputClass} placeholder="Ej: 1000000" />
        </div>
      </div>

      {pagoHipotetico && (
        <div className="text-[12px] font-mono text-[#D4D4D4] mb-3">
          <p>Sin este pago, la deuda termina: <span className="text-[#75757A]">{finBase ? monthFullLabel(finBase) : '—'}</span></p>
          <p>Con este pago, la deuda terminaria: <span className="text-[#4ADE80]">{finSimulado ? monthFullLabel(finSimulado) : '—'}</span></p>
        </div>
      )}

      <button
        onClick={confirmar}
        disabled={!pagoHipotetico}
        className="px-3.5 py-2 rounded-full bg-[#F1BD3D] text-black text-[12px] font-medium disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Confirmar este pago como plan real
      </button>
    </div>
  );
}

function RegistrarPagoModal({ deudaId, pagoExistente, onClose }) {
  const { addPagoDeuda, editPagoDeuda } = useFinance();
  const editando = !!pagoExistente;
  const [fecha, setFecha] = useState(pagoExistente?.fecha || new Date().toISOString().slice(0, 10));
  const [monto, setMonto] = useState(pagoExistente?.monto ?? '');
  const [tipo, setTipo] = useState(pagoExistente?.tipo || 'regular');
  const [nota, setNota] = useState(pagoExistente?.nota || '');

  const submit = (e) => {
    e.preventDefault();
    const m = Number(monto);
    if (!m) return;
    const payload = { fecha, monto: m, tipo, nota };
    if (editando) editPagoDeuda(pagoExistente.id, payload);
    else addPagoDeuda({ deudaId, ...payload });
    onClose();
  };

  return (
    <Modal title={editando ? 'Editar pago' : 'Registrar pago'} onClose={onClose} width="max-w-[380px]">
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Fecha</FieldLabel>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <FieldLabel>Monto</FieldLabel>
            <input type="number" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} className={inputClass} required />
          </div>
        </div>
        <div>
          <FieldLabel>Tipo</FieldLabel>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={selectClass}>
            <option value="regular">Cuota regular</option>
            <option value="extraordinario">Pago extraordinario</option>
          </select>
        </div>
        <div>
          <FieldLabel>Nota (opcional)</FieldLabel>
          <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} className={inputClass} />
        </div>
        <div className="flex gap-2.5 mt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F2F2F2]">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#3B82F6] text-white text-[13px] font-normal">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function NuevaDeudaModal({ onClose, deudaExistente }) {
  const { addDeuda, editDeuda } = useFinance();
  const editando = !!deudaExistente;
  const [nombre, setNombre] = useState(deudaExistente?.nombre || '');
  const [acreedor, setAcreedor] = useState(deudaExistente?.acreedor || '');
  const [saldoInicial, setSaldoInicial] = useState(deudaExistente?.saldoInicial ?? '');
  const [cuotaRegular, setCuotaRegular] = useState(deudaExistente?.cuotaRegular ?? '');
  const [seguro, setSeguro] = useState(deudaExistente?.seguro ?? 0);
  const [fechaInicio, setFechaInicio] = useState(deudaExistente?.fechaInicio || new Date().toISOString().slice(0, 10));
  const [tasaInteresMensual, setTasaInteresMensual] = useState(deudaExistente?.tasaInteresMensual ? (deudaExistente.tasaInteresMensual * 100).toString() : '');
  const [notas, setNotas] = useState(deudaExistente?.notas || '');

  const submit = (e) => {
    e.preventDefault();
    const saldo = Number(saldoInicial);
    const cuota = Number(cuotaRegular);
    if (!nombre.trim() || !saldo || !cuota) return;
    const payload = {
      nombre: nombre.trim(),
      acreedor: acreedor.trim(),
      saldoInicial: saldo,
      cuotaRegular: cuota,
      seguro: Number(seguro) || 0,
      fechaInicio,
      tasaInteresMensual: tasaInteresMensual ? Number(tasaInteresMensual) / 100 : null,
      notas: notas.trim(),
    };
    if (editando) editDeuda(deudaExistente.id, payload);
    else addDeuda(payload);
    onClose();
  };

  return (
    <Modal title={editando ? 'Editar deuda' : 'Nueva deuda'} onClose={onClose} width="max-w-[420px]">
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Nombre</FieldLabel>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <FieldLabel>Acreedor (opcional)</FieldLabel>
            <input type="text" value={acreedor} onChange={(e) => setAcreedor(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <FieldLabel>Saldo {editando ? 'inicial' : 'actual'}</FieldLabel>
          <input type="number" min="0" value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)} className={inputClass} required />
          {editando && <p className="text-[10.5px] text-[#5A5A5A] mt-1">Cambiar esto ajusta el saldo base; los pagos registrados se siguen restando sobre este valor.</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Cuota regular</FieldLabel>
            <input type="number" min="0" value={cuotaRegular} onChange={(e) => setCuotaRegular(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <FieldLabel>Seguro (opcional)</FieldLabel>
            <input type="number" min="0" value={seguro} onChange={(e) => setSeguro(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Fecha de inicio</FieldLabel>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <FieldLabel>Tasa interes mensual % (opcional)</FieldLabel>
            <input type="number" min="0" step="0.01" value={tasaInteresMensual} onChange={(e) => setTasaInteresMensual(e.target.value)} className={inputClass} placeholder="Si no la sabes, deja vacio" />
          </div>
        </div>
        <div>
          <FieldLabel>Notas (opcional)</FieldLabel>
          <input type="text" value={notas} onChange={(e) => setNotas(e.target.value)} className={inputClass} />
        </div>
        <div className="flex gap-2.5 mt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F2F2F2]">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#3B82F6] text-white text-[13px] font-normal">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
