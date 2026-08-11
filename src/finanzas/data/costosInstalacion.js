// FUENTE OFICIAL: PLAN_INTEGRAL_ANGEL_2026_v2.xlsx -> hoja "Independencia Dic-26" (filas 17-19)
// Deposito de arriendo, gastos de contrato y flete de mudanza.
// Estos NO cuentan dentro de la meta de compras de independencia ($12.680.000) --
// se muestran solo como referencia informativa en la UI.
//
// PENDIENTE DE CONFIRMAR: el deposito ($1.400.000) deberia salir del presupuesto de julio
// segun tus reglas, pero no se encontro una linea equivalente en "Flujo 2026-2027" columna
// Jul-26. Como julio ya paso (hoy es 10-ago-2026), no se asume si ya se pago o no --
// se deja como referencia hasta que lo confirmes.
export const costosInstalacion = [
  {
    "id": "deposito-arriendo-1-mes",
    "nombre": "Depósito arriendo (1 mes)",
    "prioridad": "CRITICO",
    "precioMinimo": 1000000,
    "precioObjetivo": 1400000,
    "proveedorSugerido": "Propietario — negociable"
  },
  {
    "id": "gastos-contrato",
    "nombre": "Gastos contrato",
    "prioridad": "IMPORTANTE",
    "precioMinimo": 50000,
    "precioObjetivo": 100000,
    "proveedorSugerido": "Notaría / Inmobiliaria"
  },
  {
    "id": "flete-mudanza",
    "nombre": "Flete mudanza",
    "prioridad": "IMPORTANTE",
    "precioMinimo": 150000,
    "precioObjetivo": 150000,
    "proveedorSugerido": "InDriver / Recomendados"
  }
];

export default costosInstalacion;
