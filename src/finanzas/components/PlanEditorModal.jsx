import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useFinance } from '../state/FinanceContext';
import { getPlanMensual, formatMoney, CAMPOS_PLAN_EDITABLES } from '../engine/calculos';
import Modal, { FieldLabel, inputClass } from './Modal';

export default function PlanEditorModal({ onClose }) {
  const { planOficial, planOverrides, mesActivo, setPlanOverride, restorePlanField, restorePlanMes } = useFinance();
  const [mes, setMes] = useState(mesActivo);

  const planMes = getPlanMensual(planOficial, mes);
  const overridesDelMes = planOverrides[mes] || {};

  const [valores, setValores] = useState(() => construirValoresIniciales(planMes, overridesDelMes));

  // Si el usuario cambia de mes dentro del modal, recargamos los valores.
  const cambiarMes = (nuevoMes) => {
    setMes(nuevoMes);
    const p = getPlanMensual(planOficial, nuevoMes);
    setValores(construirValoresIniciales(p, planOverrides[nuevoMes] || {}));
  };

  const guardar = (e) => {
    e.preventDefault();
    CAMPOS_PLAN_EDITABLES.forEach((campo) => {
      setPlanOverride(mes, campo.key, Number(valores[campo.key]));
    });
    onClose();
  };

  const gastosFijosTotal = (planMes.gastosFijos.total - planMes.gastosFijos.dineroParaMi) + Number(valores.dineroParaMi || 0);
  const fondosMetasTotal = Number(valores.fondoEmergenciaPesos || 0) + planMes.fondosMetas.fondoEmergenciaDolares + Number(valores.independizarme || 0);
  const flujoLibreCalculado = Number(valores.ingresosTotal || 0) - gastosFijosTotal - planMes.deudas.total - fondosMetasTotal;

  return (
    <Modal title="Editar planificacion" onClose={onClose} width="max-w-[480px]">
      <div className="mb-4">
        <FieldLabel>Mes</FieldLabel>
        <select value={mes} onChange={(e) => cambiarMes(e.target.value)} className={inputClass} style={{ fontFamily: 'inherit' }}>
          {planOficial.map((p) => (
            <option key={p.mes} value={p.mes}>{p.mesLabel}</option>
          ))}
        </select>
      </div>

      <form onSubmit={guardar} className="flex flex-col gap-4">
        {CAMPOS_PLAN_EDITABLES.map((campo) => {
          const original = campo.getOriginal(planMes);
          const tieneOverride = overridesDelMes[campo.key] !== undefined;
          return (
            <div key={campo.key}>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel>{campo.label}</FieldLabel>
                <span className="text-[11px] text-[#5A5A5A] font-mono">Plan original: {formatMoney(original)}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={valores[campo.key]}
                  onChange={(e) => setValores((v) => ({ ...v, [campo.key]: e.target.value }))}
                  className={inputClass}
                />
                {tieneOverride && (
                  <button
                    type="button"
                    onClick={() => {
                      restorePlanField(mes, campo.key);
                      setValores((v) => ({ ...v, [campo.key]: original }));
                    }}
                    title="Restaurar valor original"
                    className="w-9 h-9 flex-shrink-0 rounded-lg border border-[#1E1E1E] flex items-center justify-center text-[#75757A] hover:text-[#F1BD3D] transition-colors"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <div className="rounded-xl bg-[#0F0F0F] border border-[#1E1E1E] p-3">
          <p className="text-[11px] text-[#5A5A5A]">Flujo libre (se recalcula automaticamente)</p>
          <p className="font-mono text-[16px] text-[#22D3EE] mt-1">{formatMoney(flujoLibreCalculado)}</p>
        </div>

        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={() => {
              restorePlanMes(mes);
              setValores(construirValoresIniciales(planMes, {}));
            }}
            className="flex-1 py-2.5 rounded-full border border-[#1E1E1E] text-[13px] text-[#9A9AA0] hover:text-[#F1BD3D] transition-colors"
          >
            Restaurar mes completo
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-full bg-[#3B82F6] text-white text-[13px] font-normal">
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  );
}

function construirValoresIniciales(planMes, overridesDelMes) {
  const valores = {};
  CAMPOS_PLAN_EDITABLES.forEach((campo) => {
    valores[campo.key] = overridesDelMes[campo.key] ?? campo.getOriginal(planMes);
  });
  return valores;
}
