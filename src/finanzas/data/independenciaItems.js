// FUENTE OFICIAL: PLAN_INTEGRAL_ANGEL_2026_v2.xlsx -> hoja "Independencia Dic-26" (filas 4-14)
// Solo incluye la seccion ELECTRODOMESTICOS ESENCIALES. Deposito, gastos de contrato y
// flete de mudanza estan EXCLUIDOS a proposito (ver costosInstalacion.js) porque no
// forman parte de la meta de compras de $12.680.000.
//
// ASUNCION PENDIENTE DE CONFIRMAR: "Play 5", "Teatro en casa" y "Decoracion, tapetes, etc."
// no tenian una columna de Prioridad asignada en el Excel. Se les asigno prioridad = null
// y en la UI se muestran despues de CRITICO/IMPORTANTE, al final de la cola de financiacion.
// Ajusta esto si tienes una prioridad real en mente.
//
// Cada item guarda ademas su estado de compra real (PENDIENTE/COMPRADO), que se persiste
// por separado en FinanceContext (localStorage), nunca aqui -- este archivo es el PLAN.
export const independenciaItems = [
  {
    "id": "nevera",
    "nombre": "Nevera",
    "prioridad": "CRITICO",
    "precioMinimo": 1000000,
    "precioObjetivo": 1200000,
    "proveedorSugerido": "Alkosto / Éxito / Homecenter"
  },
  {
    "id": "lavadora",
    "nombre": "Lavadora",
    "prioridad": "CRITICO",
    "precioMinimo": 1200000,
    "precioObjetivo": 1500000,
    "proveedorSugerido": "Alkosto / Éxito"
  },
  {
    "id": "televisor-smart-60",
    "nombre": "Televisor Smart 60\"",
    "prioridad": "IMPORTANTE",
    "precioMinimo": 2000000,
    "precioObjetivo": 2500000,
    "proveedorSugerido": "Alkosto / Éxito"
  },
  {
    "id": "sofa-2-3-puestos",
    "nombre": "Sofá 2-3 puestos",
    "prioridad": "IMPORTANTE",
    "precioMinimo": 800000,
    "precioObjetivo": 1200000,
    "proveedorSugerido": "OLX / Facebook Marketplace"
  },
  {
    "id": "mesa-comedor-2-sillas",
    "nombre": "Mesa comedor + 2 sillas",
    "prioridad": "IMPORTANTE",
    "precioMinimo": 600000,
    "precioObjetivo": 800000,
    "proveedorSugerido": "Homecenter / OLX"
  },
  {
    "id": "utensilios-cocina",
    "nombre": "Utensilios cocina",
    "prioridad": "CRITICO",
    "precioMinimo": 250000,
    "precioObjetivo": 250000,
    "proveedorSugerido": "Homecenter / D1"
  },
  {
    "id": "loza-basica-platos-vasos",
    "nombre": "Loza básica (platos, vasos)",
    "prioridad": "CRITICO",
    "precioMinimo": 250000,
    "precioObjetivo": 250000,
    "proveedorSugerido": "D1 / Ara / Homecenter"
  },
  {
    "id": "play-5",
    "nombre": "Play 5",
    "prioridad": null,
    "precioMinimo": 2000000,
    "precioObjetivo": 2000000,
    "proveedorSugerido": null
  },
  {
    "id": "teatro-en-casa",
    "nombre": "Teatro en casa",
    "prioridad": null,
    "precioMinimo": 1900000,
    "precioObjetivo": 1900000,
    "proveedorSugerido": null
  },
  {
    "id": "decoracion-tapetes-etc",
    "nombre": "Decoración, tapetes,etc.",
    "prioridad": null,
    "precioMinimo": 1000000,
    "precioObjetivo": 1000000,
    "proveedorSugerido": null
  },
  {
    "id": "kit-limpieza",
    "nombre": "Kit limpieza",
    "prioridad": "IMPORTANTE",
    "precioMinimo": 80000,
    "precioObjetivo": 80000,
    "proveedorSugerido": "D1 / Ara"
  }
];

export const META_COMPRAS_INDEPENDENCIA = independenciaItems.reduce((s,i)=>s+i.precioObjetivo,0);

export default independenciaItems;
