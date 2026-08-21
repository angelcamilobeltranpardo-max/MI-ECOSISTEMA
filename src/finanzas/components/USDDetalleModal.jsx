import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Pencil, Trash2 } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getPosicionUSD, getValorizacionUSD, getEvolucionPosicionUSD, formatMoney, formatPct, formatDateHuman } from '../engine/calculos';
import { useExchangeRate, useExchangeRateHistory, PERIODOS_TASA } from '../engine/exchangeRate';
import Modal, { ConfirmModal } from './Modal';
import { RegistrarOperacionModal } from './AhorroUSDCard';

function formatUSD(n, dec = 2) {
  return (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: dec, minimumFractionDigits: dec });
}

export default function USDDetalleModal({ onClose }) {
  const { dolares, deleteOperacionDolar } = useFinance();
  const tasa = useExchangeRate();

  const [periodoMercado, setPeriodoMercado] = useState('1m');
  const [periodoPersonal, setPeriodoPersonal] = useState('1m');
  const [metricaPersonal, setMetricaPersonal] = useState('usd'); // 'usd' | 'cop'
  const [editando, setEditando] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const limiteMercado = PERIODOS_TASA.find((p) => p.key === periodoMercado)?.limite ?? 22;
  const limitePersonal = PERIODOS_TASA.find((p) => p.key === periodoPersonal)?.limite ?? 22;
  const historiaMercado = useExchangeRateHistory(limiteMercado);
  const historiaParaPersonal = useExchangeRateHistory(Math.max(limitePersonal, 30));

  const val = getValorizacionUSD(dolares, tasa.rate);
  const posicion = getPosicionUSD(dolares);
  const evolucionPersonal = getEvolucionPosicionUSD(dolares, historiaParaPersonal.puntos).slice(-limitePersonal);

  return (
    <Modal title="Ahorro en dolares — detalle" onClose={onClose} width="max-w-[820px]">
      <div className="grid sm:grid-cols-4 gap-4 mb-5">
        <Stat label="USD acumulados" value={formatUSD(posicion.usdAcumulado)} />
        <Stat label="Costo acumulado" value={formatMoney(posicion.costoAcumulado)} />
        <Stat label="Precio promedio" value={formatMoney(posicion.precioPromedioPonderado)} />
        <Stat
          label="Ganancia / perdida"
          value={val.diferenciaCOP !== null ? `${val.diferenciaCOP >= 0 ? '+' : ''}${formatMoney(val.diferenciaCOP)}` : '—'}
          color={val.diferenciaCOP === null ? '#5A5A5A' : val.diferenciaCOP >= 0 ? '#4ADE80' : '#F2685C'}
        />
      </div>

      {/* Grafica de mercado */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p className="text-[13.5px] text-[#D4D4D4] font-medium">Mercado USD/COP (TRM)</p>
          <PeriodoTabs value={periodoMercado} onChange={setPeriodoMercado} />
        </div>
        {tasa.error && <p className="text-[12px] text-[#F2685C] mb-2">Fuente no disponible en este momento.</p>}
        {periodoMercado === '1d' && (
          <p className="text-[11px] text-[#5A5A5A] mb-2">
            La TRM se publica una vez por dia habil — no hay datos intradia sin una fuente de pago adicional.
          </p>
        )}
        <div className="h-[180px]">
          {historiaMercado.loading ? (
            <div className="h-full flex items-center justify-center text-[12px] text-[#5A5A5A]">Cargando...</div>
          ) : historiaMercado.puntos.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historiaMercado.puntos} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fill: '#5A5A5A', fontSize: 10 }} axisLine={{ stroke: '#1E1E1E' }} tickLine={false} minTickGap={30}
                  tickFormatter={(v) => formatDateHuman(v)} />
                <YAxis tick={{ fill: '#5A5A5A', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} tickFormatter={(v) => formatMoney(v)} width={64} />
                <Tooltip content={<TooltipMercado />} />
                <Line type="monotone" dataKey="valor" stroke="#3B82F6" strokeWidth={2} dot={historiaMercado.puntos.length < 20} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[12px] text-[#5A5A5A]">Sin datos historicos disponibles.</div>
          )}
        </div>
        <p className="text-[10.5px] text-[#454545] mt-1.5">
          Ultima actualizacion: {tasa.fecha ? formatDateHuman(tasa.fecha.slice(0, 10)) : '—'} · Fuente: {tasa.source || '—'}
        </p>
      </div>

      {/* Grafica de posicion personal */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p className="text-[13.5px] text-[#D4D4D4] font-medium">Evolucion de mi ahorro en dolares</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-[#0F0F0F] border border-[#1E1E1E] rounded-full p-1">
              {['usd', 'cop'].map((m) => (
                <button key={m} onClick={() => setMetricaPersonal(m)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${metricaPersonal === m ? 'bg-[#3B82F6] text-white' : 'text-[#75757A]'}`}>
                  {m === 'usd' ? 'USD acumulados' : 'Valor en COP'}
                </button>
              ))}
            </div>
            <PeriodoTabs value={periodoPersonal} onChange={setPeriodoPersonal} opciones={PERIODOS_TASA.filter((p) => !['1d', '5d'].includes(p.key)).concat([{ key: 'todo', label: 'Todo', limite: 400 }])} />
          </div>
        </div>
        <div className="h-[180px]">
          {evolucionPersonal.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucionPersonal} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fill: '#5A5A5A', fontSize: 10 }} axisLine={{ stroke: '#1E1E1E' }} tickLine={false} minTickGap={30}
                  tickFormatter={(v) => formatDateHuman(v)} />
                <YAxis tick={{ fill: '#5A5A5A', fontSize: 10 }} axisLine={false} tickLine={false} width={64}
                  tickFormatter={(v) => (metricaPersonal === 'usd' ? formatUSD(v, 0) : formatMoney(v))} />
                <Tooltip content={<TooltipPersonal metrica={metricaPersonal} />} />
                <Line type="monotone" dataKey={metricaPersonal === 'usd' ? 'usdAcumulado' : 'valorCOP'} stroke="#4ADE80" strokeWidth={2} dot={evolucionPersonal.length < 20} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[12px] text-[#5A5A5A]">
              {dolares.length === 0 ? 'Registra tu primera compra para ver la evolucion.' : 'Aun no hay suficientes datos historicos para graficar.'}
            </div>
          )}
        </div>
      </div>

      {/* Historial de operaciones */}
      <div>
        <p className="text-[13.5px] text-[#D4D4D4] font-medium mb-2">Historial de compras</p>
        {dolares.length === 0 ? (
          <p className="text-[12px] text-[#5A5A5A]">Sin operaciones registradas.</p>
        ) : (
          <div className="rounded-xl border border-[#1E1E1E] overflow-hidden divide-y divide-[#1E1E1E]">
            {[...dolares].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-3 py-2.5 text-[12.5px]">
                <span className="text-[#5A5A5A] font-mono w-[80px] flex-shrink-0">{formatDateHuman(o.fecha)}</span>
                <span className="flex-1 text-[#D4D4D4] font-mono">{formatUSD(o.usdComprados)} USD @ {formatMoney(o.precioCompra)}</span>
                <span className="text-[#9A9AA0] font-mono flex-shrink-0">{formatMoney(o.costoTotal ?? o.copPagados)}</span>
                <button onClick={() => setEditando(o)} title="Editar compra" className="w-7 h-7 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2F2F2] hover:bg-[#1E1E1E]">
                  <Pencil size={12} />
                </button>
                <button onClick={() => setEliminando(o)} title="Eliminar compra" className="w-7 h-7 rounded-lg flex items-center justify-center text-[#75757A] hover:text-[#F2685C] hover:bg-[#1E1E1E]">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editando && <RegistrarOperacionModal operacionExistente={editando} onClose={() => setEditando(null)} />}
      {eliminando && (
        <ConfirmModal
          title="¿Eliminar esta compra de USD?"
          message="Esto recalculara tu promedio ponderado, valorizacion y graficos."
          onConfirm={() => deleteOperacionDolar(eliminando.id)}
          onClose={() => setEliminando(null)}
        />
      )}
    </Modal>
  );
}

function Stat({ label, value, color = '#E5E5E5' }) {
  return (
    <div>
      <p className="font-mono text-[16px]" style={{ color }}>{value}</p>
      <p className="text-[10.5px] text-[#5A5A5A] mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function PeriodoTabs({ value, onChange, opciones = PERIODOS_TASA }) {
  return (
    <div className="flex bg-[#0F0F0F] border border-[#1E1E1E] rounded-full p-1 flex-wrap">
      {opciones.map((p) => (
        <button key={p.key} onClick={() => onChange(p.key)} className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${value === p.key ? 'bg-[#3B82F6] text-white' : 'text-[#75757A] hover:text-[#D4D4D4]'}`}>
          {p.label}
        </button>
      ))}
    </div>
  );
}

function TooltipMercado({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#1E1E1E] bg-[#0F0F0F] px-3 py-2 text-[11.5px]">
      <p className="text-[#D4D4D4]">{formatDateHuman(label)}</p>
      <p className="text-[#3B82F6] font-mono mt-0.5">USD/COP: {formatMoney(payload[0].value)}</p>
    </div>
  );
}

function TooltipPersonal({ active, payload, label, metrica }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#1E1E1E] bg-[#0F0F0F] px-3 py-2 text-[11.5px]">
      <p className="text-[#D4D4D4]">{formatDateHuman(label)}</p>
      <p className="text-[#4ADE80] font-mono mt-0.5">USD: {formatUSD(d.usdAcumulado)}</p>
      <p className="text-[#75757A] font-mono">Valor COP: {formatMoney(d.valorCOP)}</p>
      <p className="text-[#75757A] font-mono">Costo: {formatMoney(d.costoAcumulado)}</p>
    </div>
  );
}
