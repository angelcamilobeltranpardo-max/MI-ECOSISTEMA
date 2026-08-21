import React, { useState } from 'react';
import { CreditCard, Plus, Maximize2 } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getResumenDeuda, formatMoney, formatDateHuman } from '../engine/calculos';
import DeudaDetalleModal, { NuevaDeudaModal } from './DeudaDetalleModal';

export default function DeudasCard() {
  const { deudas, pagosDeuda } = useFinance();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(null); // id de la deuda a mostrar, o 'todas'

  const activas = deudas.filter((d) => d.estado !== 'PAGADA');
  const resumenes = activas.map((d) => ({ deuda: d, resumen: getResumenDeuda(d, pagosDeuda.filter((p) => p.deudaId === d.id)) }));
  const totalSaldo = resumenes.reduce((s, r) => s + r.resumen.saldoActual, 0);
  const proximaGlobal = resumenes
    .filter((r) => r.resumen.proximaCuotaFecha)
    .sort((a, b) => a.resumen.proximaCuotaFecha.localeCompare(b.resumen.proximaCuotaFecha))[0];

  return (
    <div className="fin-card rounded-2xl p-5 sm:p-6 border border-[#1A1A1A] bg-[#141414] flex flex-col w-full">
      <div className="flex items-center justify-between">
        <span className="text-[20px] font-display text-[#9A9AA0] flex items-center gap-1.5">
          <CreditCard size={18} /> Deudas
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalAbierto(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#1B1B1B] text-[11.5px] text-[#9A9AA0] hover:text-[#F2F2F2] transition-colors"
          >
            <Plus size={12} /> Nueva deuda
          </button>
          {deudas.length > 0 && (
            <button onClick={() => setDetalleAbierto('todas')} className="w-7 h-7 rounded-full flex items-center justify-center bg-[#1B1B1B] text-[#75757A] hover:text-[#F2F2F2]" title="Ver detalle">
              <Maximize2 size={12} />
            </button>
          )}
        </div>
      </div>

      {deudas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
          <CreditCard size={22} className="text-[#333]" />
          <p className="text-[13px] text-[#5A5A5A] max-w-[300px]">Aun no tienes deudas registradas. Usa "Nueva deuda" para empezar.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <Stat label="Saldo total pendiente" value={formatMoney(totalSaldo)} color="#F2685C" />
            <Stat label="Deudas activas" value={String(activas.length)} />
            {proximaGlobal && (
              <Stat
                label="Proxima cuota"
                value={`${formatMoney(proximaGlobal.resumen.proximaCuotaMonto)} · ${formatDateHuman(proximaGlobal.resumen.proximaCuotaFecha + '-01')}`}
              />
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[#1E1E1E] flex flex-col gap-2.5">
            {resumenes.map(({ deuda, resumen }) => (
              <button
                key={deuda.id}
                onClick={() => setDetalleAbierto(deuda.id)}
                className="flex items-center justify-between gap-3 text-left rounded-lg -mx-1 px-2 py-1.5 hover:bg-white/5 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[13px] text-[#D4D4D4] truncate">{deuda.nombre}</p>
                  <p className="text-[11px] text-[#5A5A5A] mt-0.5">
                    {resumen.cuotasRestantesEstimadas !== null ? `${resumen.cuotasRestantesEstimadas} cuotas restantes est.` : 'Sin cuota definida'}
                  </p>
                </div>
                <span className="font-mono text-[13px] text-[#F2685C] flex-shrink-0">{formatMoney(resumen.saldoActual)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {modalAbierto && <NuevaDeudaModal onClose={() => setModalAbierto(false)} />}
      {detalleAbierto && <DeudaDetalleModal deudaIdInicial={detalleAbierto === 'todas' ? null : detalleAbierto} onClose={() => setDetalleAbierto(null)} />}
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
