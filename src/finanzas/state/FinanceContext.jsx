// ============================================================================
// state/FinanceContext.jsx
//
// Unica fuente de estado "REAL" del modulo (todo lo que el PLAN -- el Excel --
// no puede contener porque depende de lo que tu efectivamente hagas).
//
// PENDIENTE DE CONFIRMAR (ver mensaje de analisis): no encontre backend/API en
// el proyecto existente, asi que esta primera version persiste en localStorage
// del navegador. Si ya tienes un backend en otra parte de la app, dimelo y
// migro `persist()`/`hydrate()` a llamadas HTTP sin tocar el resto del modulo
// (el resto del codigo solo conoce esta Context API, no como se guarda).
//
// El PLAN (planOficial, independenciaItems, costosInstalacion) NUNCA se
// escribe desde aqui -- solo se lee. Todo lo que el usuario registra vive en:
//   - movimientos            (INGRESO/GASTO/AHORRO/APORTE_META/COMPRA/INVERSION)
//   - checklistOverrides     (estado EJECUTADO/PENDIENTE de cada item del mes)
//   - comprasIndependencia   (estado real de cada articulo: comprado, precio, fecha)
// ============================================================================

import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { planOficial } from '../data/planOficial';
import { independenciaItems, META_COMPRAS_INDEPENDENCIA } from '../data/independenciaItems';
import { costosInstalacion } from '../data/costosInstalacion';
import { mesActualPorDefecto } from '../engine/calculos';

const STORAGE_KEY = 'finanzasAngel_v1';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('No se pudo leer el estado guardado, se inicia vacio.', e);
    return null;
  }
}

function initialState() {
  const persisted = loadPersisted();
  return {
    mesActivo: persisted?.mesActivo || mesActualPorDefecto(planOficial),
    movimientos: persisted?.movimientos || [],
    checklistOverrides: persisted?.checklistOverrides || {},
    comprasIndependencia: persisted?.comprasIndependencia || {},
    tasaCambioUSD: persisted?.tasaCambioUSD ?? null, // pendiente: ver pregunta abierta sobre fuente de la tasa
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MES_ACTIVO':
      return { ...state, mesActivo: action.mes };

    case 'ADD_MOVIMIENTO': {
      const movimiento = { id: uid(), createdAt: Date.now(), ...action.movimiento };
      return { ...state, movimientos: [...state.movimientos, movimiento] };
    }

    case 'DELETE_MOVIMIENTO':
      return { ...state, movimientos: state.movimientos.filter((m) => m.id !== action.id) };

    case 'SET_CHECKLIST_ESTADO': {
      const { checklistItemId, estado, montoReal, fecha, movimientoId } = action;
      return {
        ...state,
        checklistOverrides: {
          ...state.checklistOverrides,
          [checklistItemId]: estado === 'PENDIENTE' ? undefined : { estado, montoReal, fecha, movimientoId },
        },
      };
    }

    case 'CLEAR_CHECKLIST_ESTADO': {
      const next = { ...state.checklistOverrides };
      delete next[action.checklistItemId];
      return { ...state, checklistOverrides: next };
    }

    case 'SET_COMPRA_INDEPENDENCIA': {
      return {
        ...state,
        comprasIndependencia: {
          ...state.comprasIndependencia,
          [action.itemId]: action.compra,
        },
      };
    }

    case 'SET_TASA_USD':
      return { ...state, tasaCambioUSD: action.tasa };

    default:
      return state;
  }
}

const FinanceStateContext = createContext(null);

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('No se pudo guardar el estado.', e);
    }
  }, [state]);

  const actions = useMemo(
    () => ({
      setMesActivo: (mes) => dispatch({ type: 'SET_MES_ACTIVO', mes }),

      addMovimiento: (movimiento) => dispatch({ type: 'ADD_MOVIMIENTO', movimiento }),

      deleteMovimiento: (id) => dispatch({ type: 'DELETE_MOVIMIENTO', id }),

      /** Marca un item de checklist como EJECUTADO: crea el movimiento real
       *  correspondiente y guarda la referencia para poder revertir. */
      marcarChecklistEjecutado: (item, { montoReal, fecha }) => {
        const movimiento = {
          id: uid(),
          createdAt: Date.now(),
          tipo: item.tipoMovimiento,
          categoria: item.concepto,
          concepto: item.concepto,
          monto: montoReal,
          fecha: fecha || todayStr(),
          etiqueta: item.etiquetaMovimiento,
          proyecto: item.proyecto || null,
          checklistItemId: item.id,
        };
        dispatch({ type: 'ADD_MOVIMIENTO', movimiento });
        dispatch({
          type: 'SET_CHECKLIST_ESTADO',
          checklistItemId: item.id,
          estado: 'EJECUTADO',
          montoReal,
          fecha: movimiento.fecha,
          movimientoId: movimiento.id,
        });
      },

      /** Revierte un item a PENDIENTE y elimina el movimiento que se creo. */
      marcarChecklistPendiente: (checklistItemId) => {
        const override = state.checklistOverrides[checklistItemId];
        if (override?.movimientoId) {
          dispatch({ type: 'DELETE_MOVIMIENTO', id: override.movimientoId });
        }
        dispatch({ type: 'CLEAR_CHECKLIST_ESTADO', checklistItemId });
      },

      marcarArticuloComprado: (itemId, { precioReal, fecha, proveedorReal }) => {
        dispatch({
          type: 'SET_COMPRA_INDEPENDENCIA',
          itemId,
          compra: { estado: 'COMPRADO', precioReal, fecha: fecha || todayStr(), proveedorReal: proveedorReal || null },
        });
      },

      desmarcarArticulo: (itemId) => {
        dispatch({
          type: 'SET_COMPRA_INDEPENDENCIA',
          itemId,
          compra: { estado: 'PENDIENTE', precioReal: null, fecha: null, proveedorReal: null },
        });
      },

      setTasaCambioUSD: (tasa) => dispatch({ type: 'SET_TASA_USD', tasa }),
    }),
    [state.checklistOverrides]
  );

  // articulosIndependencia = datos del plan (inmutables) + estado real fusionado
  const articulosIndependencia = useMemo(() => {
    const merged = {};
    independenciaItems.forEach((item) => {
      merged[item.id] = {
        ...item,
        estado: 'PENDIENTE',
        precioReal: null,
        fecha: null,
        proveedorReal: null,
        ...(state.comprasIndependencia[item.id] || {}),
      };
    });
    return merged;
  }, [state.comprasIndependencia]);

  const value = useMemo(
    () => ({
      ...state,
      planOficial,
      independenciaItems,
      metaComprasIndependencia: META_COMPRAS_INDEPENDENCIA,
      costosInstalacion,
      articulosIndependencia,
      ...actions,
    }),
    [state, articulosIndependencia, actions]
  );

  return <FinanceStateContext.Provider value={value}>{children}</FinanceStateContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceStateContext);
  if (!ctx) throw new Error('useFinance debe usarse dentro de <FinanceProvider>');
  return ctx;
}
