// ============================================================================
// engine/exchangeRate.js
//
// Fuente REAL de la tasa USD/COP (punto 2 y 8). No hay ninguna API key
// involucrada -- ambas fuentes son publicas y no requieren autenticacion,
// por eso no hace falta backend/serverless ni variable de entorno todavia:
//
//   1. TRM oficial (Banco de la Republica de Colombia), publicada por
//      datos.gov.co (dataset "Tasa de Cambio Representativa del Mercado").
//      Es la fuente PRIMARIA -- es la tasa oficial colombiana.
//   2. Si esa fuente falla, se usa como respaldo open.er-api.com (tasas
//      genericas, sin key). Se marca claramente cual fuente esta activa.
//
// Si AMBAS fallan (ej. sin conexion), el hook devuelve error=true y
// rate=null -- el componente debe mostrar "tasa no disponible", nunca
// inventar un numero.
// ============================================================================

import { useEffect, useState } from 'react';

const TRM_URL = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=2';
const FALLBACK_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_KEY = 'finanzasAngel_ultimaTasaUSD';

async function fetchTRM() {
  const res = await fetch(TRM_URL);
  if (!res.ok) throw new Error('TRM no disponible');
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('TRM vacia');

  const actual = Number(data[0].valor);
  const anterior = data[1] ? Number(data[1].valor) : null;
  if (!actual || Number.isNaN(actual)) throw new Error('TRM invalida');

  return {
    rate: actual,
    fecha: data[0].vigenciadesde,
    variacion: anterior ? (actual - anterior) / anterior : null,
    source: 'TRM · Banco de la Republica',
  };
}

async function fetchFallback() {
  const res = await fetch(FALLBACK_URL);
  if (!res.ok) throw new Error('Fuente de respaldo no disponible');
  const data = await res.json();
  const actual = data?.rates?.COP;
  if (!actual) throw new Error('Respaldo sin dato COP');

  return {
    rate: actual,
    fecha: data.time_last_update_utc || null,
    variacion: null, // el respaldo no trae historico, no se inventa
    source: 'open.er-api.com',
  };
}

export function useExchangeRate() {
  const [state, setState] = useState({ loading: true, error: false, rate: null, source: null, fecha: null, variacion: null, variacionSesion: null });

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      let resultado = null;
      try {
        resultado = await fetchTRM();
      } catch (e) {
        try {
          resultado = await fetchFallback();
        } catch (e2) {
          if (!cancelado) setState((s) => ({ ...s, loading: false, error: true }));
          return;
        }
      }
      if (cancelado) return;

      // Variacion desde la ultima vez que se abrio la app en este navegador
      // (honesto: no es una "variacion oficial diaria" si viene del respaldo).
      let variacionSesion = null;
      try {
        const prevRaw = localStorage.getItem(CACHE_KEY);
        if (prevRaw) {
          const prev = JSON.parse(prevRaw);
          if (prev.rate) variacionSesion = (resultado.rate - prev.rate) / prev.rate;
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: resultado.rate, fecha: resultado.fecha }));
      } catch (e) {
        // localStorage no disponible: seguimos sin variacionSesion
      }

      setState({ loading: false, error: false, ...resultado, variacionSesion });
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  return state;
}

/** Historial reciente de la TRM (para graficar "evolucion del valor", punto 8).
 *  Solo funciona si la fuente primaria (TRM) responde -- el respaldo generico
 *  no trae historico, asi que en ese caso se devuelve una lista vacia en vez
 *  de inventar puntos. */
export function useExchangeRateHistory(limit = 30) {
  const [state, setState] = useState({ loading: true, error: false, puntos: [] });

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      try {
        const res = await fetch(`https://www.datos.gov.co/resource/32sa-8pi3.json?$order=vigenciadesde%20DESC&$limit=${limit}`);
        if (!res.ok) throw new Error('sin historico');
        const data = await res.json();
        if (cancelado) return;
        const puntos = data
          .map((d) => ({ fecha: d.vigenciadesde?.slice(0, 10), valor: Number(d.valor) }))
          .filter((p) => p.fecha && !Number.isNaN(p.valor))
          .reverse();
        setState({ loading: false, error: false, puntos });
      } catch (e) {
        if (!cancelado) setState({ loading: false, error: true, puntos: [] });
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [limit]);

  return state;
}
