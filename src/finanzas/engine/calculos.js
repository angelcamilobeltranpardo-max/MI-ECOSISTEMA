// ============================================================================
// engine/calculos.js
//
// UNICA fuente de verdad para toda formula financiera del modulo. Ningun
// componente debe recalcular estos valores por su cuenta -- todos consumen
// estas funciones. Esto evita la duplicacion de logica financiera que se
// pidio evitar explicitamente.
//
// Reglas duras que este archivo respeta (no las cambies sin autorizacion):
//   1. "Flujo 2026-2027" es la unica fuente del PLAN (nunca "Flujo Ideal").
//   2. El ahorro (fondo emergencia) NUNCA se resta del saldo disponible.
//   3. SALDO DISPONIBLE = Dinero para mi + Flujo libre, ajustado solo por
//      movimientos reales etiquetados 'personal' o 'flujoLibre'.
//   4. El flujo libre no se mezcla automaticamente con el Daily Pacing.
//   5. Independencia usa exclusivamente la fila "Independizarme".
//   6. PLAN y REAL nunca se mezclan: el plan es inmutable (viene del Excel),
//      lo real se deriva siempre de `movimientos`.
// ============================================================================

// ---------------------------------------------------------------------------
// Utilidades generales
// ---------------------------------------------------------------------------

export function formatMoney(n) {
  const value = Number(n) || 0;
  const sign = value < 0 ? '-' : '';
  return sign + '$' + Math.round(Math.abs(value)).toLocaleString('es-CO');
}

export function formatPct(n, decimals = 1) {
  if (n === null || n === undefined || !isFinite(n)) return '—';
  return (n * 100).toFixed(decimals).replace('.', ',') + '%';
}

const MESES_COMPLETOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function monthFullLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  return `${MESES_COMPLETOS[m - 1]} ${y}`;
}

const MESES_ABREV = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatDateHuman(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MESES_ABREV[m - 1]} ${y}`;
}

export function daysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function dayOfMonth(ym, hoy = new Date()) {
  const todayYm = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  if (ym !== todayYm) return null; // el mes seleccionado no es el mes actual
  return hoy.getDate();
}

export function ymOfDate(dateStr) {
  return dateStr.slice(0, 7);
}

export function addMonths(ym, n) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function compareYm(a, b) {
  return a.localeCompare(b);
}

// ---------------------------------------------------------------------------
// Acceso al plan
// ---------------------------------------------------------------------------

export function getPlanMensual(planOficial, ym) {
  return planOficial.find((p) => p.mes === ym) || null;
}

export function mesesDisponibles(planOficial) {
  return planOficial.map((p) => p.mes);
}

/** Mes activo por defecto: el mes actual si esta dentro del rango del plan,
 *  si no, el primer mes del plan. */
export function mesActualPorDefecto(planOficial, hoy = new Date()) {
  const ym = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  if (planOficial.some((p) => p.mes === ym)) return ym;
  return planOficial[0]?.mes || ym;
}

// ---------------------------------------------------------------------------
// PLAN EFECTIVO -- fusiona PLAN ORIGINAL (planOficial, inmutable, del Excel)
// con PLAN ACTUALIZADO (planOverrides, editado desde el dashboard) en un
// array con la MISMA FORMA que planOficial. Por eso ninguna otra funcion de
// este archivo necesita cambiar: siguen recibiendo un array de meses igual
// que antes, solo que el llamador ahora les pasa getPlanEfectivo(...) en vez
// de planOficial directamente cuando quiere que los cambios del usuario se
// reflejen en los calculos.
//
// Campos editables en esta tanda (los "como minimo" pedidos):
//   ingresosTotal, dineroParaMi, fondoEmergenciaPesos, independizarme
// "Flujo libre" NO es editable directamente: se recalcula siempre como
// ingresos - gastosFijos - deudas - fondosMetas, para que cambiar el ingreso
// cascadee correctamente (regla explicita de la tanda).
// ---------------------------------------------------------------------------

export const CAMPOS_PLAN_EDITABLES = [
  { key: 'ingresosTotal', label: 'Ingreso mensual', getOriginal: (p) => p.ingresos.total },
  { key: 'dineroParaMi', label: 'Gasto personal (Dinero para mi)', getOriginal: (p) => p.gastosFijos.dineroParaMi },
  { key: 'fondoEmergenciaPesos', label: 'Ahorro (fondo emergencia)', getOriginal: (p) => p.fondosMetas.fondoEmergenciaPesos },
  { key: 'independizarme', label: 'Fondo Independencia', getOriginal: (p) => p.fondosMetas.independizarme },
];

export function getPlanEfectivo(planOficial, planOverrides) {
  return planOficial.map((p) => {
    const ov = (planOverrides && planOverrides[p.mes]) || {};
    const ingresosTotal = ov.ingresosTotal ?? p.ingresos.total;
    const dineroParaMi = ov.dineroParaMi ?? p.gastosFijos.dineroParaMi;
    const fondoEmergenciaPesos = ov.fondoEmergenciaPesos ?? p.fondosMetas.fondoEmergenciaPesos;
    const independizarme = ov.independizarme ?? p.fondosMetas.independizarme;

    const gastosFijosTotal = p.gastosFijos.total - p.gastosFijos.dineroParaMi + dineroParaMi;
    const fondosMetasTotal = fondoEmergenciaPesos + p.fondosMetas.fondoEmergenciaDolares + independizarme;
    const totalEgresos = gastosFijosTotal + p.deudas.total + fondosMetasTotal;
    const flujoNeto = ingresosTotal - totalEgresos;

    return {
      ...p,
      ingresos: { ...p.ingresos, total: ingresosTotal },
      gastosFijos: { ...p.gastosFijos, dineroParaMi, total: gastosFijosTotal },
      fondosMetas: { ...p.fondosMetas, fondoEmergenciaPesos, independizarme, total: fondosMetasTotal },
      totalEgresos,
      flujoNeto,
      editado: Object.keys(ov).length > 0,
    };
  });
}

// ---------------------------------------------------------------------------
//   = Dinero para mi (plan) + Flujo libre (plan)
//     - gastos reales etiquetados 'personal'  (consumen el presupuesto personal)
//     - gastos reales etiquetados 'flujoLibre' (uso explicito del flujo libre)
//   El ahorro (AHORRO / APORTE_META) nunca entra en esta resta.
//   Los gastos etiquetados 'fijo' o 'deuda' (ejecutar un item del checklist)
//   tampoco vuelven a restar aqui: ya estan reflejados en el flujo neto del plan.
// ---------------------------------------------------------------------------

export function getSaldoDisponible(planOficial, movimientos, ym) {
  const plan = getPlanMensual(planOficial, ym);
  if (!plan) return { presupuestoPersonal: 0, flujoLibre: 0, total: 0, usado: 0 };

  const presupuestoPersonal = plan.gastosFijos.dineroParaMi;
  const flujoLibre = plan.flujoNeto;

  const usadoPersonal = sumMovimientos(movimientos, (m) => m.tipo === 'GASTO' && m.etiqueta === 'personal' && ymOfDate(m.fecha) === ym);
  const usadoFlujoLibre = sumMovimientos(movimientos, (m) => m.tipo === 'GASTO' && m.etiqueta === 'flujoLibre' && ymOfDate(m.fecha) === ym);

  const total = presupuestoPersonal + flujoLibre - usadoPersonal - usadoFlujoLibre;

  return {
    presupuestoPersonal,
    flujoLibre,
    usadoPersonal,
    usadoFlujoLibre,
    total,
  };
}

// ---------------------------------------------------------------------------
// VARIACION del saldo disponible respecto al mes anterior (punto 2).
// No inventa datos: compara el mismo calculo de getSaldoDisponible() en el
// mes activo contra el mes calendario inmediatamente anterior dentro del plan.
// ---------------------------------------------------------------------------

export function getSaldoDisponibleVariacion(planOficial, movimientos, ym) {
  const actual = getSaldoDisponible(planOficial, movimientos, ym);
  const ymAnterior = addMonths(ym, -1);
  const anteriorExiste = planOficial.some((p) => p.mes === ymAnterior);
  if (!anteriorExiste) return { pct: null, ymAnterior: null };

  const anterior = getSaldoDisponible(planOficial, movimientos, ymAnterior);
  const pct = anterior.total !== 0 ? (actual.total - anterior.total) / Math.abs(anterior.total) : null;
  return { pct, ymAnterior, totalAnterior: anterior.total };
}

// ---------------------------------------------------------------------------

export function getDailyPacing(planOficial, movimientos, ym, hoy = new Date()) {
  const plan = getPlanMensual(planOficial, ym);
  if (!plan) return null;

  const presupuestoInicial = plan.gastosFijos.dineroParaMi;
  const totalDias = daysInMonth(ym);
  const diaActual = dayOfMonth(ym, hoy);

  const gastado = sumMovimientos(movimientos, (m) => m.tipo === 'GASTO' && m.etiqueta === 'personal' && ymOfDate(m.fecha) === ym);
  const restante = presupuestoInicial - gastado;

  const capacidadInicial = totalDias > 0 ? presupuestoInicial / totalDias : 0;

  // Si el mes seleccionado no es el mes en curso, no hay "dias restantes" reales:
  // mostramos el ritmo ideal completo en vez de un ritmo dinamico.
  const diasRestantes = diaActual ? Math.max(totalDias - diaActual + 1, 1) : totalDias;
  const capacidadActual = restante > 0 ? restante / diasRestantes : 0;

  return {
    presupuestoInicial,
    totalDias,
    diaActual,
    diasRestantes,
    gastado,
    restante,
    capacidadInicial,
    capacidadActual,
  };
}

// ---------------------------------------------------------------------------
// AHORRO -- unicamente Fondo emergencia (Pesos + Dolares). Independencia se
// calcula aparte en getIndependencia(), nunca se mezclan (regla explicita).
// ---------------------------------------------------------------------------

export function getAhorro(planOficial, movimientos, ym) {
  const plan = getPlanMensual(planOficial, ym);
  if (!plan) return null;

  const plan_valor = plan.fondosMetas.fondoEmergenciaPesos + plan.fondosMetas.fondoEmergenciaDolares;
  const real = sumMovimientos(
    movimientos,
    (m) => m.tipo === 'AHORRO' && ymOfDate(m.fecha) === ym
  );
  const cumplimiento = plan_valor > 0 ? real / plan_valor : real > 0 ? 1 : null;

  return { plan: plan_valor, real, cumplimiento };
}

/** Acumulado de ahorro (fondo emergencia) PLAN vs REAL desde el primer mes
 *  del plan hasta `hastaYm` inclusive. Se calcula sumando mes a mes en vez de
 *  reutilizar la fila "ACUMULADO FONDOS Y METAS" del Excel, porque esa fila
 *  mezcla fondo emergencia + independencia y aqui deben quedar separados. */
export function getAhorroAcumulado(planOficial, movimientos, hastaYm) {
  let planAcum = 0;
  let realAcum = 0;
  const evolucion = [];
  for (const p of planOficial) {
    if (compareYm(p.mes, hastaYm) > 0) break;
    const planMes = p.fondosMetas.fondoEmergenciaPesos + p.fondosMetas.fondoEmergenciaDolares;
    const realMes = sumMovimientos(movimientos, (m) => m.tipo === 'AHORRO' && ymOfDate(m.fecha) === p.mes);
    planAcum += planMes;
    realAcum += realMes;
    evolucion.push({ mes: p.mes, mesLabel: p.mesLabel, plan: planMes, real: realMes, planAcum, realAcum });
  }
  return { planAcum, realAcum, evolucion };
}

// ---------------------------------------------------------------------------
// INDEPENDENCIA -- usa exclusivamente la fila "Independizarme". La meta de
// compras ($12.680.000) viene de independenciaItems.js (suma de precioObjetivo),
// NUNCA incluye deposito/mudanza (costosInstalacion.js).
// ---------------------------------------------------------------------------

export function getIndependencia(planOficial, movimientos, articulosComprados, metaCompras) {
  // El fondo proyectado es el TOTAL planificado en toda la fila "Independizarme"
  // (Sep-26 a Jun-27 = $10.000.000), no depende del mes que este viendo en el
  // dashboard -- es una meta fija de referencia, igual que la meta de compras.
  const fondoPlanAcumulado = planOficial.reduce((s, p) => s + p.fondosMetas.independizarme, 0);

  // El acumulado REAL si es dinamico: cuanto llevas aportado de verdad hasta hoy.
  const hoyStr = new Date().toISOString().slice(0, 10);
  const fondoRealAcumulado = sumMovimientos(
    movimientos,
    (m) => m.tipo === 'APORTE_META' && m.proyecto === 'independencia' && m.fecha <= hoyStr
  );

  const gastadoReal = Object.values(articulosComprados || {}).reduce(
    (s, a) => s + (a.estado === 'COMPRADO' ? Number(a.precioReal) || 0 : 0),
    0
  );
  const ahorroConseguido = Object.values(articulosComprados || {}).reduce((s, a) => {
    if (a.estado !== 'COMPRADO') return s;
    const objetivo = a.precioObjetivo || 0;
    const real = Number(a.precioReal) || 0;
    return s + (objetivo - real);
  }, 0);

  const presupuestoRestante = metaCompras - gastadoReal;
  const progresoPlanPct = metaCompras > 0 ? fondoPlanAcumulado / metaCompras : 0;
  const progresoRealPct = metaCompras > 0 ? fondoRealAcumulado / metaCompras : 0;

  return {
    fondoPlanAcumulado,
    fondoRealAcumulado,
    metaCompras,
    progresoPlanPct,
    progresoRealPct,
    gastadoReal,
    ahorroConseguido,
    presupuestoRestante,
    diferenciaInicial: metaCompras - fondoPlanAcumulado,
  };
}

/** Ordena articulos por prioridad para "financiacion progresiva":
 *  CRITICO primero, luego IMPORTANTE, luego sin prioridad asignada. */
export function ordenarPorPrioridad(articulos) {
  const orden = { CRITICO: 0, IMPORTANTE: 1 };
  return [...articulos].sort((a, b) => {
    const pa = orden[a.prioridad] ?? 2;
    const pb = orden[b.prioridad] ?? 2;
    if (pa !== pb) return pa - pb;
    return a.precioObjetivo - b.precioObjetivo;
  });
}

/** Extiende getIndependencia() con disponibilidad POR ARTICULO (punto 6):
 *  recorre los articulos en orden de prioridad y va "comprometiendo" el fondo
 *  proyectado (fondoPlanAcumulado) en ese mismo orden. Para cada articulo,
 *  pctDisponible dice que porcentaje de SU precio ya esta cubierto por el
 *  fondo, una vez descontado lo ya comprometido por los articulos de mayor
 *  prioridad (incluidos los ya comprados, que comprometen su precioReal en
 *  vez de precioObjetivo). Reversible: al desmarcar un articulo, vuelve a
 *  usar precioObjetivo y libera fondo para los siguientes automaticamente,
 *  porque esto se recalcula por completo en cada render a partir del estado. */
export function getIndependenciaConDisponibilidad(planOficial, movimientos, articulosComprados, metaCompras) {
  const base = getIndependencia(planOficial, movimientos, articulosComprados, metaCompras);
  const articulos = Object.values(articulosComprados || {});
  const ordenados = ordenarPorPrioridad(articulos);

  let comprometido = 0;
  const articulosConDisponibilidad = ordenados.map((item) => {
    const costoEfectivo = item.estado === 'COMPRADO' ? Number(item.precioReal) || 0 : item.precioObjetivo;
    const disponibleParaEste = Math.min(Math.max(base.fondoPlanAcumulado - comprometido, 0), item.precioObjetivo);
    const pctDisponible = item.precioObjetivo > 0 ? disponibleParaEste / item.precioObjetivo : 1;
    comprometido += costoEfectivo;
    return { ...item, disponibleParaEste, pctDisponible };
  });

  return { ...base, articulosConDisponibilidad };
}

// ---------------------------------------------------------------------------
// PLAN VS REAL -- comparacion generica del mes.
// Convencion de signo:
//   GASTO/DEUDA:            real < plan  => favorable (ahorraste)
//   AHORRO/APORTE_META:     real >= plan => favorable (cumpliste o superaste)
// ---------------------------------------------------------------------------

export function getPlanVsReal(planOficial, movimientos, ym) {
  const plan = getPlanMensual(planOficial, ym);
  if (!plan) return null;

  const ingresosReal = sumMovimientos(movimientos, (m) => m.tipo === 'INGRESO' && ymOfDate(m.fecha) === ym);
  const gastosReal = sumMovimientos(
    movimientos,
    (m) => m.tipo === 'GASTO' && (m.etiqueta === 'fijo' || m.etiqueta === 'deuda' || m.etiqueta === 'personal') && ymOfDate(m.fecha) === ym
  );
  const ahorroReal = sumMovimientos(movimientos, (m) => m.tipo === 'AHORRO' && ymOfDate(m.fecha) === ym);
  const metaReal = sumMovimientos(
    movimientos,
    (m) => m.tipo === 'APORTE_META' && m.proyecto === 'independencia' && ymOfDate(m.fecha) === ym
  );

  const gastosPlan = plan.gastosFijos.total + plan.deudas.total;
  const ahorroPlan = plan.fondosMetas.fondoEmergenciaPesos + plan.fondosMetas.fondoEmergenciaDolares;
  const metaPlan = plan.fondosMetas.independizarme;

  const filas = {
    ingresos: mkPlanVsReal(plan.ingresos.total, ingresosReal, 'positivo'),
    gastos: mkPlanVsReal(gastosPlan, gastosReal, 'negativo'),
    ahorro: mkPlanVsReal(ahorroPlan, ahorroReal, 'positivo'),
    metas: mkPlanVsReal(metaPlan, metaReal, 'positivo'),
    flujo: mkPlanVsReal(plan.flujoNeto, ingresosReal - gastosReal - ahorroReal - metaReal, 'positivo'),
  };

  return filas;
}

function mkPlanVsReal(plan, real, favorableCuando) {
  const diferencia = real - plan;
  let favorable;
  if (favorableCuando === 'negativo') favorable = diferencia <= 0;
  else favorable = diferencia >= 0;
  const cumplimiento = plan !== 0 ? real / plan : real > 0 ? 1 : null;
  return { plan, real, diferencia, favorable, cumplimiento };
}

/** Expresa cada fila de getPlanVsReal() como % del ingreso (plan y real),
 *  ademas del valor absoluto. Util para ver si la PROPORCION del ingreso que
 *  se va a cada categoria se esta desviando del plan, no solo el monto.
 *  No inventa fuente de datos: usa exactamente getPlanVsReal() + ingresos
 *  del plan/real ya calculados.
 *
 *  `planOriginalOficial`, si se pasa, agrega ademas el valor de PLAN ORIGINAL
 *  (antes de cualquier edicion desde el dashboard) para cada fila, dejando la
 *  estructura de datos lista para una futura vista de 3 capas
 *  (Original / Actualizado / Real) sin romper lo que ya consume esto hoy. */
export function getPlanVsRealConPorcentajes(planEfectivo, movimientos, ym, planOriginalOficial = null) {
  const filas = getPlanVsReal(planEfectivo, movimientos, ym);
  if (!filas) return null;

  const filasOriginal = planOriginalOficial ? getPlanVsReal(planOriginalOficial, movimientos, ym) : null;

  const ingresoPlanTotal = filas.ingresos.plan || 1;
  const ingresoRealTotal = filas.ingresos.real; // puede ser 0 si aun no hay movimientos reales

  const conPct = {};
  for (const [key, fila] of Object.entries(filas)) {
    conPct[key] = {
      ...fila,
      planPct: fila.plan / ingresoPlanTotal,
      realPct: ingresoRealTotal > 0 ? fila.real / ingresoRealTotal : null,
      planOriginal: filasOriginal ? filasOriginal[key].plan : fila.plan,
    };
  }
  return conPct;
}

// ---------------------------------------------------------------------------
// DISTRIBUCION DEL INGRESO (PLAN) -- para el mes seleccionado.
// ---------------------------------------------------------------------------

export function getDistribucionIngreso(planOficial, ym) {
  const plan = getPlanMensual(planOficial, ym);
  if (!plan) return [];

  const total = plan.ingresos.total || 1; // guard contra division por cero
  const gastosFijosSinPersonal = plan.gastosFijos.total - plan.gastosFijos.dineroParaMi;

  const categorias = [
    { key: 'gastosFijos', label: 'Gastos fijos', valor: gastosFijosSinPersonal, color: '#3B82F6' },
    { key: 'deudas', label: 'Deudas', valor: plan.deudas.total, color: '#F2685C' },
    { key: 'ahorro', label: 'Ahorro (fondo emergencia)', valor: plan.fondosMetas.fondoEmergenciaPesos + plan.fondosMetas.fondoEmergenciaDolares, color: '#4ADE80' },
    { key: 'independencia', label: 'Independencia', valor: plan.fondosMetas.independizarme, color: '#6366F1' },
    { key: 'personal', label: 'Dinero para mi', valor: plan.gastosFijos.dineroParaMi, color: '#F1BD3D' },
    { key: 'flujoLibre', label: 'Flujo libre', valor: Math.max(plan.flujoNeto, 0), color: '#22D3EE' },
  ];

  return categorias
    .filter((c) => c.valor > 0)
    .map((c) => ({ ...c, pct: c.valor / total }));
}

// ---------------------------------------------------------------------------
// helper interno
// ---------------------------------------------------------------------------

function sumMovimientos(movimientos, predicate) {
  return movimientos.filter(predicate).reduce((s, m) => s + (Number(m.monto) || 0), 0);
}

// ---------------------------------------------------------------------------
// CDT (punto 9) -- interes compuesto sobre tasa E.A., prorrateado por dias
// transcurridos. NUNCA inventa CDTs: opera sobre los que el usuario registre
// en `cdts` (ver FinanceContext). Si `cdts` esta vacio, todo esto devuelve
// ceros/listas vacias -- el componente debe mostrar el estado vacio, no una
// simulacion.
// ---------------------------------------------------------------------------

function diasEntre(fechaA, fechaB) {
  const a = new Date(fechaA + 'T00:00:00');
  const b = new Date(fechaB + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/** Rendimiento de UN CDT a una fecha dada (compuesto sobre tasaEA, prorrateado
 *  por dias/365). Nunca calcula mas alla de la fecha de vencimiento. */
export function getRendimientoCDT(cdt, hoy = new Date()) {
  const hoyStr = hoy.toISOString().slice(0, 10);
  const fechaCorte = hoyStr < cdt.fechaVencimiento ? hoyStr : cdt.fechaVencimiento;

  const diasTranscurridos = Math.max(0, Math.min(diasEntre(cdt.fechaApertura, fechaCorte), diasEntre(cdt.fechaApertura, cdt.fechaVencimiento)));
  const plazoDias = Math.max(diasEntre(cdt.fechaApertura, cdt.fechaVencimiento), 1);

  const rendimientoAcumulado = cdt.capital * (Math.pow(1 + cdt.tasaEA, diasTranscurridos / 365) - 1);
  const rendimientoEsperadoTotal = cdt.capital * (Math.pow(1 + cdt.tasaEA, plazoDias / 365) - 1);
  const valorActual = cdt.capital + rendimientoAcumulado;
  const diasRestantes = Math.max(diasEntre(fechaCorte, cdt.fechaVencimiento), 0);
  const vencido = hoyStr >= cdt.fechaVencimiento;

  return {
    diasTranscurridos,
    diasRestantes,
    plazoDias,
    rendimientoAcumulado,
    rendimientoEsperadoTotal,
    valorActual,
    vencido,
  };
}

/** Resumen agregado de TODOS los CDTs + serie diaria de evolucion del valor
 *  total (capital + rendimiento acumulado), para graficar. */
export function getResumenCDTs(cdts, hoy = new Date()) {
  if (!cdts || cdts.length === 0) {
    return { totalCapital: 0, totalRendimientoAcumulado: 0, totalRendimientoEsperado: 0, proximoAVencer: null, cdtsConRendimiento: [], evolucion: [] };
  }

  const cdtsConRendimiento = cdts.map((cdt) => ({ ...cdt, ...getRendimientoCDT(cdt, hoy) }));

  const totalCapital = cdtsConRendimiento.reduce((s, c) => s + c.capital, 0);
  const totalRendimientoAcumulado = cdtsConRendimiento.reduce((s, c) => s + c.rendimientoAcumulado, 0);
  const totalRendimientoEsperado = cdtsConRendimiento.reduce((s, c) => s + c.rendimientoEsperadoTotal, 0);

  const activos = cdtsConRendimiento.filter((c) => !c.vencido).sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
  const proximoAVencer = activos[0] || null;

  // Evolucion diaria del valor total desde la apertura mas antigua hasta hoy.
  const fechaInicioSerie = cdts.reduce((min, c) => (c.fechaApertura < min ? c.fechaApertura : min), cdts[0].fechaApertura);
  const hoyStr = hoy.toISOString().slice(0, 10);
  const totalDiasSerie = Math.max(diasEntre(fechaInicioSerie, hoyStr), 1);
  const paso = Math.max(Math.ceil(totalDiasSerie / 60), 1); // maximo ~60 puntos
  const evolucion = [];
  for (let d = 0; d <= totalDiasSerie; d += paso) {
    const fecha = new Date(fechaInicioSerie + 'T00:00:00');
    fecha.setDate(fecha.getDate() + d);
    const fechaStr = fecha.toISOString().slice(0, 10);
    const valorEseDia = cdts.reduce((s, c) => {
      if (fechaStr < c.fechaApertura) return s;
      return s + getRendimientoCDT(c, fecha).valorActual;
    }, 0);
    evolucion.push({ fecha: fechaStr, valor: valorEseDia });
  }

  return { totalCapital, totalRendimientoAcumulado, totalRendimientoEsperado, proximoAVencer, cdtsConRendimiento, evolucion };
}
