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
        <h1 className="font-display text-[34px] sm:text-[40px] font-light text-[#F2F2F2] leading-tight">
          {saludoPorHora()}, {NOMBRE_USUARIO}
        </h1>
        <p className="text-[15px] text-[#8A8A90] mt-1.5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-3">
              <SaldoDisponibleCard />
            </div>

            <DailyPacingCard />
            <AhorroCard />
            <AhorroUSDCard />

            <div className="md:col-span-2">
              <IndependenciaCard />
            </div>
            <DistribucionIngresoCard />

            <div className="md:col-span-2 lg:col-span-3">
              <PlanVsRealCard />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <CDTCard />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <ChecklistCard />
            </div>
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Inter:wght@300;400;500&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Outfit', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
      `}</style>

      <FinanceProvider>
        <DashboardContent />
      </FinanceProvider>
    </div>
  );
}
