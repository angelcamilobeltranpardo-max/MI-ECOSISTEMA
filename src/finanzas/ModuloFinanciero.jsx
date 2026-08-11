import React from 'react';
import { Wallet, GraduationCap, Repeat, Settings } from 'lucide-react';
import { FinanceProvider, useFinance } from './state/FinanceContext';
import { monthFullLabel } from './engine/calculos';
import MonthSelector from './components/MonthSelector';
import QuickActions from './components/QuickActions';
import SaldoDisponibleCard from './components/SaldoDisponibleCard';
import DailyPacingCard from './components/DailyPacingCard';
import AhorroCard from './components/AhorroCard';
import IndependenciaCard from './components/IndependenciaCard';
import PlanVsRealCard from './components/PlanVsRealCard';
import ChecklistCard from './components/ChecklistCard';
import DistribucionIngresoCard from './components/DistribucionIngresoCard';

const NOMBRE_USUARIO = 'Angel';

function saludoPorHora(hoy = new Date()) {
  const h = hoy.getHours();
  if (h < 12) return 'Buenos dias';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function Sidebar() {
  return (
    <>
      <aside className="hidden md:flex flex-col items-center w-16 py-5 border-r border-[#161616] shrink-0 bg-[#0A0A0A]">
        <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mb-7 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
        <nav className="flex flex-col gap-1">
          {[
            { icon: Wallet, active: true },
            { icon: GraduationCap, active: false },
            { icon: Repeat, active: false },
          ].map(({ icon: Icon, active }, i) => (
            <button
              key={i}
              className="w-9 h-9 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]"
            >
              <Icon size={15} className={active ? 'text-[#3B82F6]' : 'text-[#54545A] hover:text-[#9A9AA0]'} />
              {active && <span className="w-1 h-1 rounded-full bg-[#3B82F6]" />}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-2 my-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#F2685C]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
        </div>
        <button className="mt-auto w-9 h-9 rounded-lg flex items-center justify-center text-[#54545A] hover:text-[#9A9AA0] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]">
          <Settings size={15} />
        </button>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around bg-[#0F0F0F] border-t border-[#1A1A1A] py-2">
        <Wallet size={17} className="text-[#3B82F6]" />
        <GraduationCap size={17} className="text-[#54545A]" />
        <Repeat size={17} className="text-[#54545A]" />
        <Settings size={17} className="text-[#54545A]" />
      </nav>
    </>
  );
}

function Header() {
  const { mesActivo } = useFinance();
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="font-display text-[24px] sm:text-[28px] font-light text-[#F2F2F2]">
          {saludoPorHora()}, {NOMBRE_USUARIO}
        </h1>
        <p className="text-[13px] text-[#75757A] mt-1">
          Este es el resumen de tu plan financiero para {monthFullLabel(mesActivo)}.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <MonthSelector />
      </div>
    </div>
  );
}

function DashboardContent() {
  return (
    <main className="flex-1 px-4 md:px-6 py-5 md:py-6 pb-24 md:pb-6 max-w-[1400px] mx-auto w-full">
      <Header />

      <div className="mb-5">
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2 lg:col-span-3">
          <SaldoDisponibleCard />
        </div>

        <DailyPacingCard />
        <AhorroCard />
        <DistribucionIngresoCard />

        <IndependenciaCard />
        <PlanVsRealCard />

        <ChecklistCard />
      </div>
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
        <div className="flex min-h-screen">
          <Sidebar />
          <DashboardContent />
        </div>
      </FinanceProvider>
    </div>
  );
}
