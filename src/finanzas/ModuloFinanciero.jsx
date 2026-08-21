import React, { useState } from 'react';
import { ListTree, Settings2 } from 'lucide-react';
import { FinanceProvider, useFinance } from './state/FinanceContext';
import { monthFullLabel } from './engine/calculos';
import MonthSelector from './components/MonthSelector';
import QuickActions from './components/QuickActions';
import SaldoDisponibleCard from './components/SaldoDisponibleCard';
import DailyPacingCard from './components/DailyPacingCard';
import AhorroCard from './components/AhorroCard';
import AhorroUSDCard from './components/AhorroUSDCard';
import IndependenciaCard from './components/IndependenciaCard';
import PlanVsRealCard from './components/PlanVsRealCard';
import ChecklistCard from './components/ChecklistCard';
import DistribucionIngresoCard from './components/DistribucionIngresoCard';
import CDTCard from './components/CDTCard';
import DeudasCard from './components/DeudasCard';
import MovimientosView from './components/MovimientosView';
import PlanEditorModal from './components/PlanEditorModal';

const NOMBRE_USUARIO = 'Angel';

function saludoPorHora(hoy = new Date()) {
  const h = hoy.getHours();
  if (h < 12) return 'Buenos dias';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function Header({ onVerMovimientos, onEditarPlan }) {
  const { mesActivo } = useFinance();
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-[42px] sm:text-[52px] font-light text-[#F2F2F2] leading-tight">
          {saludoPorHora()}, <span className="font-semibold text-white">{NOMBRE_USUARIO}</span>
        </h1>
        <p className="text-[16.5px] text-[#8A8A90] mt-2">
          Este es el resumen de tu plan financiero para {monthFullLabel(mesActivo)}.
        </p>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <MonthSelector />
        <button
          onClick={onVerMovimientos}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#141414] border border-[#1A1A1A] text-[12.5px] text-[#D4D4D4] hover:border-[#2A2A2A] transition-colors"
        >
          <ListTree size={13} /> Movimientos
        </button>
        <button
          onClick={onEditarPlan}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-[#141414] border border-[#1A1A1A] text-[12.5px] text-[#D4D4D4] hover:border-[#2A2A2A] transition-colors"
        >
          <Settings2 size={13} /> Editar plan
        </button>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [vista, setVista] = useState('dashboard'); // 'dashboard' | 'movimientos'
  const [editorPlanAbierto, setEditorPlanAbierto] = useState(false);

  return (
    <main className="px-4 md:px-6 py-5 md:py-6 pb-10 max-w-[1400px] mx-auto w-full">
      <Header onVerMovimientos={() => setVista('movimientos')} onEditarPlan={() => setEditorPlanAbierto(true)} />

      {vista === 'movimientos' ? (
        <MovimientosView onVolver={() => setVista('dashboard')} />
      ) : (
        <>
          <div className="mb-5">
            <QuickActions />
          </div>

          <div className="flex flex-col gap-4">
            {/* Fila superior: Saldo disponible y Ahorro USD con presencia visual equivalente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              <SaldoDisponibleCard />
              <AhorroUSDCard />
            </div>

            {/* Daily Pacing y Ahorro / Fondo de emergencia debajo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyPacingCard />
              <AhorroCard />
            </div>

            {/* Distribucion del ingreso e Independizarme en la misma fila, altura equivalente */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 items-stretch">
              <DistribucionIngresoCard />
              <IndependenciaCard />
            </div>

            <PlanVsRealCard />
            <DeudasCard />
            <CDTCard />
            <ChecklistCard />
          </div>
        </>
      )}

      {editorPlanAbierto && <PlanEditorModal onClose={() => setEditorPlanAbierto(false)} />}
    </main>
  );
}

export default function ModuloFinanciero() {
  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] font-body text-[#E5E5E5]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Inter:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Sora', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        .fin-card {
          transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
        }
        .fin-card:hover {
          border-color: rgba(59,130,246,0.45);
          box-shadow: 0 0 0 1px rgba(59,130,246,0.12), 0 10px 28px -14px rgba(59,130,246,0.35);
          background-color: #161616;
        }
      `}</style>

      <FinanceProvider>
        <DashboardContent />
      </FinanceProvider>
    </div>
  );
}
