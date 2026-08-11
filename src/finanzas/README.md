# Modulo Finanzas — primera version funcional

Esta es la primera version funcional del dashboard, verificada con un render real
(React + jsdom) y con pruebas de interaccion (marcar checklist, registrar un gasto
y confirmar que el saldo disponible reacciona correctamente). No es un mockup: los
numeros que ves son los que produce el motor de calculo real sobre tus datos del Excel.

## Como integrarlo

1. Copia toda esta carpeta `finanzas/` dentro del `src/` de tu proyecto (reemplaza
   el `modulo-financiero__1_.jsx` anterior).
2. Donde antes importabas el componente viejo, importa ahora:
   ```jsx
   import ModuloFinanciero from './finanzas/ModuloFinanciero';
   ```
3. Dependencias que ya usabas y se siguen usando tal cual: `react`, `lucide-react`,
   `recharts`, Tailwind. No se agrego ninguna libreria nueva.
4. Persistencia: por ahora todo se guarda en `localStorage` bajo la clave
   `finanzasAngel_v1` (ver pregunta abierta #10 mas abajo). Si abres la app en otro
   navegador o borras datos del sitio, se reinicia el REAL (el PLAN nunca se pierde
   porque vive en el codigo, no en el navegador).

## Que quedo funcionando en esta version (verificado con pruebas reales)

- Encabezado con saludo dinamico ("Buenos dias/Buenas tardes/Buenas noches, Angel")
  y subtitulo con el mes activo.
- Selector de mes (recorre los 19 meses de "Flujo 2026-2027").
- **Saldo disponible**: $478.000 en agosto ($400.000 + $78.000), se recalcula si
  registras un gasto "personal" o de "flujo libre" — probado: un gasto personal de
  $20.000 lo deja en $458.000, exactamente tu ejemplo.
- **Daily Pacing**: dinamico, basado solo en "Dinero para mi".
- **Ahorro**: plan vs. real vs. cumplimiento vs. acumulado, exclusivamente del
  fondo de emergencia (pesos + dolares), separado de Independencia.
- **Independencia**: $10.000.000 proyectado / $12.680.000 meta = 78,9% (fijo, no
  cambia segun el mes que estes viendo); lista de los 11 articulos con prioridad,
  registro de compra real con calculo automatico de ahorro conseguido.
- **Plan vs Real**: ingresos, gastos+deudas, ahorro, independencia y flujo.
- **Checklist del mes**: se genera solo desde las lineas del Excel con valor > 0
  para el mes activo; marcar como ejecutado crea un movimiento real y no vuelve
  a tocar el plan.
- **Distribucion del ingreso**: donut con las categorias del plan del mes activo.
- Accesos rapidos: + Ingreso / + Gasto / + Ahorro / + Aporte a meta / + Compra /
  + Inversion (los dos ultimos quedan registrados pero, como acordamos, todavia
  no tienen tarjeta propia -- son para Dolares/CDTs en la siguiente iteracion).

## Lo que deliberadamente NO se construyo todavia (segun tu priorizacion)

Dolares, CDTs, Deseos ("Cosas que quiero") y el Historial financiero completo.
Los datos de deseos ya estan extraidos en `data/deseos.js`, listos para cuando
retomemos esa parte.

## Decisiones que tome para poder avanzar (revisalas)

1. **"Dinero para mi" no aparece en el Checklist.** Se rastrea gasto a gasto via
   Daily Pacing; meterlo tambien como un item unico de "pendiente -> ejecutado"
   generaria doble conteo. Ver comentario en `engine/checklist.js`.
2. **El % de Independencia (78,9%) es fijo**, no cambia segun el mes activo --
   representa el total proyectado por el plan completo (Sep-26 a Jun-27). El
   acumulado *real* (lo que efectivamente has aportado) si es dinamico y crece
   con tus movimientos reales.
3. **Persistencia en localStorage** porque no encontre backend/API en el archivo
   que me compartiste. Si ya existe uno en otra parte del proyecto, se puede migrar
   sin tocar el resto del modulo (todo pasa por `FinanceContext`).
4. **Play 5, Teatro en casa y Decoracion** (sin prioridad en el Excel) se ordenan
   al final de la cola de financiacion, despues de CRITICO e IMPORTANTE.
5. **El deposito de arriendo** ($1.400.000) se muestra en `data/costosInstalacion.js`
   como referencia, pero no encontre la linea correspondiente en la columna Jul-26
   de "Flujo 2026-2027" -- no asumi si ya se pago o no.

Estas siguen siendo las mismas preguntas abiertas del analisis anterior; ninguna
bloqueo la implementacion, pero varias si cambian numeros si las resuelves distinto.

## Siguiente paso

Como acordamos: esta ronda fue funcional, no definitiva en diseño. Cuando la
pruebes, la siguiente iteracion es visual (tipografia, tamaños, espaciado,
jerarquia) mas Dolares/CDTs/Deseos/Historial.
