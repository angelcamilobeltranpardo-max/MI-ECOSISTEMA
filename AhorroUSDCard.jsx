import React, { useState } from 'react';
import { DollarSign, ArrowUp, ArrowDown, Plus, Maximize2 } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getValorizacionUSD, formatMoney, formatPct } from '../engine/calculos';
import { useExchangeRate } from '../engine/exchangeRate';
import Modal, { FieldLabel, inputClass } from './Modal';
import USDDetalleModal from './USDDetalleModal';

function formatUSD(n, dec = 2) {
  const value = Number(n) || 0;
  return value.toLocaleString('en-US', { maximumFractionDigits: dec, minimumFractionDigits: dec });
}

export default function AhorroUSDCard() {
  const { dolares } = useFinance();
  const tasa = useExchangeRate();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);

  const val = getValorizacionUSD(dolares, tasa.rate);
  const variacionMostrada = tasa.variacion ?? tasa.variacionSesion;
  const gananciaColor = val.diferenciaCOP === null ? '#5A5A5A' : Math.abs(val.diferenciaPct || 0) < 0.001 ? '#9A9AA0' : val.diferenciaCOP >= 0 ? '#4ADE80' : '#F2685C';

  return (
    <div className="fin-card h-full rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[19px] font-display text-[#9A9AA0] flex items-center gap-1.5">
          <DollarSign size={17} /> Ahorro en dolares
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setModalAbierto(true)} className="w-7 h-7 rounded-full flex items-center justify-center bg-[#1B1B1B] text-[#75757A] hover:text-[#F2F2F2] transition-colors" title="Registrar compra">
            <Plus size={13} />
          </button>
          <button onClick={() => setDetalleAbierto(true)} className="w-7 h-7 rounded-full flex items-center justify-center bg-[#1B1B1B] text-[#75757A] hover:text-[#F2F2F2] transition-colors" title="Ver detalle">
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      <p className="font-display text-[33px] font-light text-[#F2F2F2] leading-none mt-3">
        {formatUSD(val.usdAcumulado)} <span className="text-[15px] text-[#75757A] font-sans">USD</span>
      </p>
      <p className="text-[13.5px] text-[#5A5A5A] mt-1.5 font-mono">
        {val.valorActual !== null ? `≈ ${formatMoney(val.valorActual)}` : 'Equivalente COP no disponible'}
      </p>

      {val.usdAcumulado > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#1E1E1E]">
          <div>
            <p className="text-[10.5px] text-[#5A5A5A]">Costo acumulado</p>
            <p className="font-mono text-[13px] text-[#D4D4D4] mt-0.5">{formatMoney(val.costoAcumulado)}</p>
          </div>
          <div>
            <p className="text-[10.5px] text-[#5A5A5A]">Precio promedio</p>
            <p className="font-mono text-[13px] text-[#D4D4D4] mt-0.5">{formatMoney(val.precioPromedioPonderado)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10.5px] text-[#5A5A5A]">Ganancia / perdida por valorizacion</p>
            <p className="font-mono text-[15px] mt-0.5" style={{ color: gananciaColor }}>
              {val.diferenciaCOP !== null ? (
                <>
                  {val.diferenciaCOP >= 0 ? '+' : ''}
                  {formatMoney(val.diferenciaCOP)}
                  {val.diferenciaPct !== null && ` (${val.diferenciaPct >= 0 ? '+' : ''}${formatPct(val.diferenciaPct)})`}
                </>
              ) : '—'}
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-[#1E1E1E]">
        {tasa.loading && <p className="text-[12.5px] text-[#5A5A5A]">Consultando tasa USD/COP...</p>}
        {tasa.error && <p className="text-[12.5px] text-[#F2685C]">Tasa no disponible (sin conexion a la fuente).</p>}
        {!tasa.loading && !tasa.error && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-mono text-[17px] text-[#E5E5E5]">{formatMoney(tasa.rate)}</p>
              <p className="text-[10.5px] text-[#5A5A5A] mt-0.5">{tasa.source} · act. {tasa.fecha?.slice(0, 10) || '—'}</p>
            </div>
            {variacionMostrada !== null && (
              <span
                className={`flex items-center gap-0.5 text-[12px] font-medium px-2 py-0.5 rounded-full ${
                  variacionMostrada >= 0 ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#F2685C]/10 text-[#F2685C]'
                }`}
              >
                {variacionMostrada >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {formatPct(Math.abs(variacionMostrada))}
              </span>
            )}
          </div>
        )}
      </div>

      {dolares.length === 0 && (
        <p className="text-[11.5px] text-[#454545] mt-3">Aun no registras compras de USD. Usa el boton + para agregar la primera.</p>
      )}

      {modalAbierto && <RegistrarOperacionModal onClose={() => setModalAbierto(false)} />}
      {detalleAbierto && <USDDetalleModal onClose={() => setDetalleAbierto(false)} />}
    </div>
  );
}

export function RegistrarOperacionModal({ onClose, operacionExistente }) {
  const { addOperacionDolar, editOperacionDolar } = useFinance();
  const editando = !!operacionExistente;
  const [fecha, setFecha] = useState(operacionExistente?.fecha || new Date().toISOString().slice(0, 10));
  const [usdComprados, setUsdComprados] = useState(operacionExistente?.usdComprados ?? '');
  const [precioCompra, setPrecioCompra] = useState(operacionExistente?.precioCompra ?? '');
  const [comision, setComision] = useState(operacionExistente?.comision ?? 0);
  const [fuenteCuenta, setFuenteCuenta] = useState(operacionExistente?.fuenteCuenta || '');
  const [nota, setNota] = useState(operacionExistente?.nota || '');

  const submit = (e) => {
    e.preventDefault();
    const usd = Number(usdComprados);
    const precio = Number(precioCompra);
    const com = Number(comision) || 0;
    if (!usd || !precio) return;
    const copPagados = usd * precio;
    const payload = { fecha, usdComprados: usd, precioCompra: precio, copPagados, comision: com, costoTotal: copPagados + com, fuenteCuenta, nota };
    if (editando) editOperacionDolar(operacionExistente.id, payload);
    else addOperacionDolar(payload);
    onClose();
  };

  return (
    <Modal title={editando ? 'Editar compra de USD' : 'Registrar compra de USD'} onClose={onClose} width="max-w-[400px]">
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div>
          <FieldLabel>Fecha</FieldLabel>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>USD comprados</FieldLabel>
            <input type="number" min="0" step="0.01" value={usdComprados} onChange={(e) => setUsdComprados(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <FieldLabel>Tasa de compra (COP/USD)</FieldLabel>
            <input type="number" min="0" step="1" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} className={inputClass} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Comision (opcional)</FieldLabel>
            <input type="number" min="0" step="1" value={comision} onChange={(e) => setComision(e.target.value)} className={inputClass} />
          </div>
          <div>
            <FieldLabel>Cuenta/fuente (opcional)</FieldLabel>
            <input type="text" value={fuenteCuenta} onChange={(e) => setFuenteCuenta(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <FieldLabel>Nota (opcional)</FieldLabel>
          <input type="text" value={nota} onChange={(e) => setNota(e.target.value)} className={inputClass} />
        </div>
        {usdComprados && precioCompra && (
          <p className="text-[12px] font-mono text-[#5A5A5A]">
            Costo total: {formatMoney(Number(usdComprados) * Number(precioCompra) + (Number(comision) || 0))}
          </p>
        )}
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
