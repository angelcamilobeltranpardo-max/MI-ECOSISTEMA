// ============================================================================
// engine/checklist.js
//
// Genera el checklist financiero del mes a partir del PLAN (nunca se escribe
// a mano). Cada item pendiente, al marcarse EJECUTADO, crea un Movimiento real
// (ver FinanceContext) -- el checklist en si nunca guarda dinero, solo estado.
//
// DECISION DE IMPLEMENTACION (marcada para tu revision):
// "Dinero para mi" NO se incluye como item de checklist. A diferencia de una
// obligacion puntual (pagar el gimnasio, pagar una deuda), "Dinero para mi" es
// un presupuesto continuo que ya se rastrea en detalle mediante Daily Pacing
// (gasto a gasto). Convertirlo en un unico item "pendiente -> ejecutado" con
// un solo monto real chocaria con esa mecanica granular y generaria doble
// conteo. Si prefieres que tambien aparezca como item de checklist, lo ajusto.
// ============================================================================

const GRUPOS = {
  GASTOS_FIJOS: 'Gastos fijos',
  DEUDAS: 'Deudas',
  AHORRO_METAS: 'Ahorro / Metas',
};

function slug(s) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
}

export function getChecklistDelMes(planMensual) {
  if (!planMensual) return [];
  const items = [];
  const ym = planMensual.mes;

  const gastosFijos = [
    ['Credito universidad', planMensual.gastosFijos.creditoUniversidad],
    ['Arriendo', planMensual.gastosFijos.arriendo],
    ['Mercado / alimentacion', planMensual.gastosFijos.mercado],
    ['Servicios (datos, Spotify, streaming)', planMensual.gastosFijos.servicios],
    ['Transporte (SITP + colchon)', planMensual.gastosFijos.transporte],
    ['Gimnasio', planMensual.gastosFijos.gimnasio],
  ];
  gastosFijos.forEach(([concepto, montoPlan]) => {
    if (montoPlan > 0) {
      items.push({
        id: `${ym}-fijo-${slug(concepto)}`,
        mes: ym,
        grupo: 'GASTOS_FIJOS',
        grupoLabel: GRUPOS.GASTOS_FIJOS,
        concepto,
        montoPlan,
        etiquetaMovimiento: 'fijo',
        tipoMovimiento: 'GASTO',
      });
    }
  });

  const deudas = [
    ['Salidas / regalo pareja', planMensual.deudas.salidasRegaloPareja],
    ['Tarjeta de credito (Mercado)', planMensual.deudas.tarjetaCredito],
    ['Ropa', planMensual.deudas.ropa],
    ['Deudas varias', planMensual.deudas.deudasVarias],
    ['SmartFit deuda acumulada', planMensual.deudas.smartfit],
    ['Cuotas universidad adicionales', planMensual.deudas.cuotasUniversidad],
  ];
  deudas.forEach(([concepto, montoPlan]) => {
    if (montoPlan > 0) {
      items.push({
        id: `${ym}-deuda-${slug(concepto)}`,
        mes: ym,
        grupo: 'DEUDAS',
        grupoLabel: GRUPOS.DEUDAS,
        concepto,
        montoPlan,
        etiquetaMovimiento: 'deuda',
        tipoMovimiento: 'GASTO',
      });
    }
  });

  const metas = [
    ['Fondo emergencia (Pesos)', planMensual.fondosMetas.fondoEmergenciaPesos, 'AHORRO', null],
    ['Fondo emergencia (Dolares)', planMensual.fondosMetas.fondoEmergenciaDolares, 'AHORRO', null],
    ['Independizarme', planMensual.fondosMetas.independizarme, 'APORTE_META', 'independencia'],
  ];
  metas.forEach(([concepto, montoPlan, tipoMovimiento, proyecto]) => {
    if (montoPlan > 0) {
      items.push({
        id: `${ym}-meta-${slug(concepto)}`,
        mes: ym,
        grupo: 'AHORRO_METAS',
        grupoLabel: GRUPOS.AHORRO_METAS,
        concepto,
        montoPlan,
        etiquetaMovimiento: null,
        tipoMovimiento,
        proyecto,
      });
    }
  });

  return items;
}
