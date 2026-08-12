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
import { mesActualPorDefecto, getPlanEfectivo, CAMPOS_PLAN_EDITABLES } from '../engine/calculos';

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
    tasaCambioUSD: persisted?.tasaCambioUSD ?? null, // legado: la tasa real ahora viene de engine/exchangeRate.js
    dolares: persisted?.dolares || [], // operaciones de compra de USD (punto 8)
    cdts: persisted?.cdts || [], // CDTs registrados por el usuario (punto 9)
    planOverrides: persisted?.planOverrides || {}, // PLAN ACTUALIZADO: { [mes]: { campo: valor } }, PLAN ORIGINAL nunca se toca
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_MES_ACTIVO':
      return { ...state, mesActivo: action.mes };

    case 'ADD_MOVIMIENTO': {
      const movimiento = { id: uid(), createdAt: Date.now(), updatedAt: Date.now(), nota: '', ...action.movimiento };
      return { ...state, movimientos: [...state.movimientos, movimiento] };
    }

    case 'EDIT_MOVIMIENTO': {
      return {
        ...state,
        movimientos: state.movimientos.map((m) => (m.id === action.id ? { ...m, ...action.patch, updatedAt: Date.now() } : m)),
      };
    }

    case 'DELETE_MOVIMIENTO': {
      const objetivo = state.movimientos.find((m) => m.id === action.id);
      let checklistOverrides = state.checklistOverrides;
      // Integridad: si el movimiento venia de un item de checklist, ese item
      // vuelve a PENDIENTE (evita que quede "ejecutado" apuntando a un
      // movimiento que ya no existe).
      if (objetivo?.checklistItemId && checklistOverrides[objetivo.checklistItemId]) {
        checklistOverrides = { ...checklistOverrides };
        delete checklistOverrides[objetivo.checklistItemId];
      }
      return { ...state, movimientos: state.movimientos.filter((m) => m.id !== action.id), checklistOverrides };
    }

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

    case 'ADD_OPERACION_DOLAR': {
      const operacion = { id: uid(), createdAt: Date.now(), ...action.operacion };
      return { ...state, dolares: [...state.dolares, operacion] };
    }

    case 'DELETE_OPERACION_DOLAR':
      return { ...state, dolares: state.dolares.filter((o) => o.id !== action.id) };

    case 'ADD_CDT': {
      const cdt = { id: uid(), createdAt: Date.now(), ...action.cdt };
      return { ...state, cdts: [...state.cdts, cdt] };
    }

    case 'DELETE_CDT':
      return { ...state, cdts: state.cdts.filter((c) => c.id !== action.id) };

    case 'SET_PLAN_OVERRIDE': {
      const { mes, campo, valor } = action;
      const planMes = planOficial.find((p) => p.mes === mes);
      const campoDef = CAMPOS_PLAN_EDITABLES.find((c) => c.key === campo);
      const original = campoDef && planMes ? campoDef.getOriginal(planMes) : null;

      const overridesDelMes = { ...(state.planOverrides[mes] || {}) };
      if (original !== null && Number(valor) === Number(original)) {
        // Si el nuevo valor es igual al original, no vale la pena guardar un
        // override redundante: equivale a "restaurar" ese campo.
        delete overridesDelMes[campo];
      } else {
        overridesDelMes[campo] = Number(valor);
      }

      const planOverrides = { ...state.planOverrides, [mes]: overridesDelMes };
      if (Object.keys(overridesDelMes).length === 0) delete planOverrides[mes];
      return { ...state, planOverrides };
    }

    case 'RESTORE_PLAN_FIELD': {
      const { mes, campo } = action;
      if (!state.planOverrides[mes]) return state;
      const overridesDelMes = { ...state.planOverrides[mes] };
      delete overridesDelMes[campo];
      const planOverrides = { ...state.planOverrides, [mes]: overridesDelMes };
      if (Object.keys(overridesDelMes).length === 0) delete planOverrides[mes];
      return { ...state, planOverrides };
    }

    case 'RESTORE_PLAN_MES': {
      const planOverrides = { ...state.planOverrides };
      delete planOverrides[action.mes];
      return { ...state, planOverrides };
    }

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

      editMovimiento: (id, patch) => dispatch({ type: 'EDIT_MOVIMIENTO', id, patch }),

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

      addOperacionDolar: (operacion) => dispatch({ type: 'ADD_OPERACION_DOLAR', operacion }),
      deleteOperacionDolar: (id) => dispatch({ type: 'DELETE_OPERACION_DOLAR', id }),

      addCDT: (cdt) => dispatch({ type: 'ADD_CDT', cdt }),
      deleteCDT: (id) => dispatch({ type: 'DELETE_CDT', id }),

      setPlanOverride: (mes, campo, valor) => dispatch({ type: 'SET_PLAN_OVERRIDE', mes, campo, valor }),
      restorePlanField: (mes, campo) => dispatch({ type: 'RESTORE_PLAN_FIELD', mes, campo }),
      restorePlanMes: (mes) => dispatch({ type: 'RESTORE_PLAN_MES', mes }),
    }),
    [state.checklistOverrides, state.planOverrides]
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
      planEfectivo: getPlanEfectivo(planOficial, state.planOverrides),
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
