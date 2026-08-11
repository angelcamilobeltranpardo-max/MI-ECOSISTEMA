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
// SALDO DISPONIBLE
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
// DAILY PACING (dinamico) -- usa solo "Dinero para mi", nunca el flujo libre.
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
