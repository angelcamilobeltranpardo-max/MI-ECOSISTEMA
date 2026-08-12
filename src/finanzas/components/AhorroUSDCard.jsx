import React, { useState } from 'react';
import { DollarSign, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useFinance } from '../state/FinanceContext';
import { formatMoney, formatPct } from '../engine/calculos';
import { useExchangeRate, useExchangeRateHistory } from '../engine/exchangeRate';
import Modal, { FieldLabel, inputClass } from './Modal';

function formatUSD(n) {
  const value = Number(n) || 0;
  return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export default function AhorroUSDCard() {
  const { dolares } = useFinance();
  const tasa = useExchangeRate();
  const historia = useExchangeRateHistory(30);
  const [modalAbierto, setModalAbierto] = useState(false);

  const usdAcumulado = dolares.reduce((s, o) => s + (Number(o.usdComprados) || 0), 0);
  const equivalenteCOP = tasa.rate ? usdAcumulado * tasa.rate : null;

  const variacionMostrada = tasa.variacion ?? tasa.variacionSesion;
  const etiquetaVariacion = tasa.variacion !== null ? 'vs. dia anterior (TRM)' : 'desde tu ultima visita';

  return (
    <div className="rounded-2xl p-5 border border-[#1A1A1A] bg-[#141414] flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-display text-[#9A9AA0] flex items-center gap-1.5">
          <DollarSign size={14} /> Ahorro en dolares
        </span>
        <button
          onClick={() => setModalAbierto(true)}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-[#1B1B1B] text-[#75757A] hover:text-[#F2F2F2] transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>

      <p className="font-display text-[29px] font-light text-[#F2F2F2] leading-none mt-3">
        {usdAcumulado.toLocaleString('en-US', { maximumFractionDigits: 2 })} <span className="text-[15px] text-[#75757A] font-sans">USD</span>
      </p>
      <p className="text-[12.5px] text-[#5A5A5A] mt-1.5 font-mono">
        {equivalenteCOP !== null ? `≈ ${formatMoney(equivalenteCOP)}` : 'Equivalente COP no disponible'}
      </p>

      <div className="mt-4 pt-3 border-t border-[#1E1E1E]">
        {tasa.loading && <p className="text-[12px] text-[#5A5A5A]">Consultando tasa USD/COP...</p>}
        {tasa.error && <p className="text-[12px] text-[#F2685C]">Tasa no disponible (sin conexion a la fuente).</p>}
        {!tasa.loading && !tasa.error && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-mono text-[16px] text-[#E5E5E5]">{formatMoney(tasa.rate)}</p>
              <p className="text-[10.5px] text-[#5A5A5A] mt-0.5">{tasa.source}</p>
            </div>
            {variacionMostrada !== null && (
              <span
                className={`flex items-center gap-0.5 text-[12px] font-medium px-2 py-0.5 rounded-full ${
                  variacionMostrada >= 0 ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#F2685C]/10 text-[#F2685C]'
                }`}
                title={etiquetaVariacion}
              >
                {variacionMostrada >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                {formatPct(Math.abs(variacionMostrada))}
              </span>
            )}
          </div>
        )}
      </div>

      {historia.puntos.length > 1 && (
        <div className="h-[46px] mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historia.puntos}>
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Line type="monotone" dataKey="valor" stroke="#3B82F6" strokeWidth={1.75} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {dolares.length === 0 && (
        <p className="text-[11.5px] text-[#454545] mt-3">Aun no registras compras de USD. Usa el boton + para agregar la primera.</p>
      )}

      {modalAbierto && <RegistrarOperacionModal onClose={() => setModalAbierto(false)} />}
    </div>
  );
}

function RegistrarOperacionModal({ onClose }) {
  const { addOperacionDolar } = useFinance();
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [usdComprados, setUsdComprados] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const usd = Number(usdComprados);
    const precio = Number(precioCompra);
    if (!usd || !precio) return;
    addOperacionDolar({ fecha, usdComprados: usd, precioCompra: precio, copPagados: usd * precio });
    onClose();
  };

  return (
    <Modal title="Registrar compra de USD" onClose={onClose} width="max-w-[380px]">
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
            <FieldLabel>Precio de compra (COP/USD)</FieldLabel>
            <input type="number" min="0" step="1" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} className={inputClass} required />
          </div>
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
