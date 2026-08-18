// FUENTE OFICIAL: PLAN_INTEGRAL_ANGEL_2026_v2.xlsx -> hoja "Flujo 2026-2027" (celdas B2:T34)
// Generado automaticamente a partir del Excel. NO editar valores a mano.
// Si el plan cambia en el Excel, vuelve a exportar este archivo.
// IMPORTANTE: la hoja "Flujo Ideal" NO se usa aqui -- no es la fuente oficial.
//
// Cada objeto representa un mes con la misma estructura que las filas del Excel:
//   ingresos.total       = fila 8  (TOTAL INGRESOS)
//   gastosFijos.total    = fila 17 (TOTAL GASTOS FIJOS)
//   deudas.total         = fila 25 (TOTAL DEUDAS)
//   fondosMetas.total    = fila 30 (TOTAL FONDOS Y METAS)
//   acumuladoFondosMetas = fila 31 (mezcla fondo emergencia + independencia, tal cual el Excel;
//                           el motor de calculo NO usa este campo para "Ahorro" ni "Independencia"
//                           por separado -- ver engine/calculos.js)
//   totalEgresos         = fila 33
//   flujoNeto            = fila 34 (superavit/deficit == "flujo libre")
export const planOficial = [
  {
    "mes": "2026-06",
    "mesLabel": "Jun-26",
    "ingresos": {
      "salarioNeto": 2746610,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 2746610
    },
    "gastosFijos": {
      "creditoUniversidad": 744310,
      "arriendo": 0,
      "mercado": 0,
      "servicios": 105000,
      "transporte": 150000,
      "gimnasio": 0,
      "dineroParaMi": 400000,
      "total": 1399310
    },
    "deudas": {
      "salidasRegaloPareja": 560000,
      "tarjetaCredito": 301300,
      "ropa": 486000,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 1347300
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 0,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 0
    },
    "acumuladoFondosMetas": 0,
    "totalEgresos": 2746610,
    "flujoNeto": 0
  },
  {
    "mes": "2026-07",
    "mesLabel": "Jul-26",
    "ingresos": {
      "salarioNeto": 1500000,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 1500000
    },
    "gastosFijos": {
      "creditoUniversidad": 415356,
      "arriendo": 0,
      "mercado": 0,
      "servicios": 86660,
      "transporte": 150230,
      "gimnasio": 0,
      "dineroParaMi": 0,
      "total": 652246
    },
    "deudas": {
      "salidasRegaloPareja": 500000,
      "tarjetaCredito": 301750,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 801750
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 0,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 0
    },
    "acumuladoFondosMetas": 0,
    "totalEgresos": 1453996,
    "flujoNeto": 46004
  },
  {
    "mes": "2026-08",
    "mesLabel": "Ago-26",
    "ingresos": {
      "salarioNeto": 2950000,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 2950000
    },
    "gastosFijos": {
      "creditoUniversidad": 406500,
      "arriendo": 0,
      "mercado": 0,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 1100000
    },
    "deudas": {
      "salidasRegaloPareja": 600000,
      "tarjetaCredito": 300000,
      "ropa": 0,
      "deudasVarias": 330000,
      "smartfit": 242000,
      "cuotasUniversidad": 0,
      "total": 1472000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 300000,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 300000
    },
    "acumuladoFondosMetas": 300000,
    "totalEgresos": 2872000,
    "flujoNeto": 78000
  },
  {
    "mes": "2026-09",
    "mesLabel": "Sep-26",
    "ingresos": {
      "salarioNeto": 2950000,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 2950000
    },
    "gastosFijos": {
      "creditoUniversidad": 406500,
      "arriendo": 0,
      "mercado": 0,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 300000,
      "total": 1000000
    },
    "deudas": {
      "salidasRegaloPareja": 650000,
      "tarjetaCredito": 300000,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 950000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 0,
      "fondoEmergenciaDolares": 0,
      "independizarme": 1000000,
      "total": 1000000
    },
    "acumuladoFondosMetas": 1300000,
    "totalEgresos": 2950000,
    "flujoNeto": 0
  },
  {
    "mes": "2026-10",
    "mesLabel": "Oct-26",
    "ingresos": {
      "salarioNeto": 2943320,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 2943320
    },
    "gastosFijos": {
      "creditoUniversidad": 406500,
      "arriendo": 0,
      "mercado": 0,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 700000,
      "total": 1400000
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 300000,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 550000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 0,
      "fondoEmergenciaDolares": 0,
      "independizarme": 1000000,
      "total": 1000000
    },
    "acumuladoFondosMetas": 2300000,
    "totalEgresos": 2950000,
    "flujoNeto": -6680
  },
  {
    "mes": "2026-11",
    "mesLabel": "Nov-26",
    "ingresos": {
      "salarioNeto": 2943320,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 2943320
    },
    "gastosFijos": {
      "creditoUniversidad": 406500,
      "arriendo": 0,
      "mercado": 0,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 1100000
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 300000,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 550000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 300000,
      "fondoEmergenciaDolares": 0,
      "independizarme": 1000000,
      "total": 1300000
    },
    "acumuladoFondosMetas": 3600000,
    "totalEgresos": 2950000,
    "flujoNeto": -6680
  },
  {
    "mes": "2026-12",
    "mesLabel": "Dic-26",
    "ingresos": {
      "salarioNeto": 2943320,
      "cesantias": 2290233,
      "prima": 1500000,
      "ingresosExtra": 0,
      "total": 6733553
    },
    "gastosFijos": {
      "creditoUniversidad": 2300000,
      "arriendo": 0,
      "mercado": 0,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 2993500
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 300000,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 1400000,
      "total": 1950000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 400000,
      "fondoEmergenciaDolares": 300000,
      "independizarme": 1000000,
      "total": 1700000
    },
    "acumuladoFondosMetas": 5300000,
    "totalEgresos": 6643500,
    "flujoNeto": 90053
  },
  {
    "mes": "2027-01",
    "mesLabel": "Ene-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 406500,
      "arriendo": 0,
      "mercado": 300000,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 1400000
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 500000,
      "fondoEmergenciaDolares": 0,
      "independizarme": 1000000,
      "total": 1500000
    },
    "acumuladoFondosMetas": 6800000,
    "totalEgresos": 3150000,
    "flujoNeto": -4200
  },
  {
    "mes": "2027-02",
    "mesLabel": "Feb-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 0,
      "mercado": 300000,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 993500
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 550000,
      "fondoEmergenciaDolares": 300000,
      "independizarme": 1000000,
      "total": 1850000
    },
    "acumuladoFondosMetas": 8650000,
    "totalEgresos": 3093500,
    "flujoNeto": 52300
  },
  {
    "mes": "2027-03",
    "mesLabel": "Mar-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 0,
      "mercado": 300000,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 993500
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 550000,
      "fondoEmergenciaDolares": 300000,
      "independizarme": 1000000,
      "total": 1850000
    },
    "acumuladoFondosMetas": 10500000,
    "totalEgresos": 3093500,
    "flujoNeto": 52300
  },
  {
    "mes": "2027-04",
    "mesLabel": "Abr-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 0,
      "mercado": 300000,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 993500
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 550000,
      "fondoEmergenciaDolares": 300000,
      "independizarme": 1000000,
      "total": 1850000
    },
    "acumuladoFondosMetas": 12350000,
    "totalEgresos": 3093500,
    "flujoNeto": 52300
  },
  {
    "mes": "2027-05",
    "mesLabel": "May-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 0,
      "mercado": 300000,
      "servicios": 77000,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 993500
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 550000,
      "fondoEmergenciaDolares": 300000,
      "independizarme": 1000000,
      "total": 1850000
    },
    "acumuladoFondosMetas": 14200000,
    "totalEgresos": 3093500,
    "flujoNeto": 52300
  },
  {
    "mes": "2027-06",
    "mesLabel": "Jun-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 1572900,
      "ingresosExtra": 0,
      "total": 4718700
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 0,
      "mercado": 300000,
      "servicios": 76900,
      "transporte": 146500,
      "gimnasio": 70000,
      "dineroParaMi": 400000,
      "total": 993400
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 1421800,
      "fondoEmergenciaDolares": 1000000,
      "independizarme": 1000000,
      "total": 3421800
    },
    "acumuladoFondosMetas": 17621800,
    "totalEgresos": 4665200,
    "flujoNeto": 53500
  },
  {
    "mes": "2027-07",
    "mesLabel": "Jul-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 1300000,
      "mercado": 300000,
      "servicios": 300000,
      "transporte": 95800,
      "gimnasio": 100000,
      "dineroParaMi": 300000,
      "total": 2395800
    },
    "deudas": {
      "salidasRegaloPareja": 750000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 750000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 0,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 0
    },
    "acumuladoFondosMetas": 17621800,
    "totalEgresos": 3145800,
    "flujoNeto": 0
  },
  {
    "mes": "2027-08",
    "mesLabel": "Ago-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 1300000,
      "mercado": 300000,
      "servicios": 300000,
      "transporte": 95800,
      "gimnasio": 100000,
      "dineroParaMi": 400000,
      "total": 2495800
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 400000,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 400000
    },
    "acumuladoFondosMetas": 18021800,
    "totalEgresos": 3145800,
    "flujoNeto": 0
  },
  {
    "mes": "2027-09",
    "mesLabel": "Sep-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 1300000,
      "mercado": 300000,
      "servicios": 300000,
      "transporte": 95800,
      "gimnasio": 100000,
      "dineroParaMi": 400000,
      "total": 2495800
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 400000,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 400000
    },
    "acumuladoFondosMetas": 18421800,
    "totalEgresos": 3145800,
    "flujoNeto": 0
  },
  {
    "mes": "2027-10",
    "mesLabel": "Oct-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 1300000,
      "mercado": 300000,
      "servicios": 300000,
      "transporte": 95800,
      "gimnasio": 100000,
      "dineroParaMi": 400000,
      "total": 2495800
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 400000,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 400000
    },
    "acumuladoFondosMetas": 18821800,
    "totalEgresos": 3145800,
    "flujoNeto": 0
  },
  {
    "mes": "2027-11",
    "mesLabel": "Nov-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 0,
      "ingresosExtra": 0,
      "total": 3145800
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 1300000,
      "mercado": 300000,
      "servicios": 300000,
      "transporte": 95800,
      "gimnasio": 100000,
      "dineroParaMi": 400000,
      "total": 2495800
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 400000,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 400000
    },
    "acumuladoFondosMetas": 19221800,
    "totalEgresos": 3145800,
    "flujoNeto": 0
  },
  {
    "mes": "2027-12",
    "mesLabel": "Dic-27",
    "ingresos": {
      "salarioNeto": 3145800,
      "cesantias": 0,
      "prima": 1572900,
      "ingresosExtra": 0,
      "total": 4718700
    },
    "gastosFijos": {
      "creditoUniversidad": 0,
      "arriendo": 1300000,
      "mercado": 300000,
      "servicios": 300000,
      "transporte": 100000,
      "gimnasio": 100000,
      "dineroParaMi": 500000,
      "total": 2600000
    },
    "deudas": {
      "salidasRegaloPareja": 250000,
      "tarjetaCredito": 0,
      "ropa": 0,
      "deudasVarias": 0,
      "smartfit": 0,
      "cuotasUniversidad": 0,
      "total": 250000
    },
    "fondosMetas": {
      "fondoEmergenciaPesos": 1868700,
      "fondoEmergenciaDolares": 0,
      "independizarme": 0,
      "total": 1868700
    },
    "acumuladoFondosMetas": 21090500,
    "totalEgresos": 4718700,
    "flujoNeto": 0
  }
];

export default planOficial;
