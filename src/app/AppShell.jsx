import React, { useState } from 'react';
import ModuloFinanciero from '../finanzas/ModuloFinanciero';
import ComingSoon from './ComingSoon';

/**
 * AppShell -- unico lugar del proyecto que conoce las 3 pestañas del
 * dashboard personal (Finanzas / Ambito 2 / Ambito 3). Finanzas NO sabe
 * que esta navegacion existe: solo se le monta como <ModuloFinanciero />,
 * exactamente igual que si se usara sola. Cuando Ambito 2 y Ambito 3 tengan
 * su propio modulo real, solo hay que:
 *   1. crear src/ambito2/... (o el nombre que corresponda), con su propio
 *      Provider/estado, igual que src/finanzas;
 *   2. importarlo aqui y reemplazar el ComingSoon correspondiente en TABS.
 * Nada de eso implica tocar src/finanzas.
 */
const TABS = [
  { id: 'finanzas', label: 'Finanzas', render: () => <ModuloFinanciero /> },
  { id: 'ambito2', label: 'Ambito 2', render: () => <ComingSoon label="Ambito 2" /> },
  { id: 'ambito3', label: 'Ambito 3', render: () => <ComingSoon label="Ambito 3" /> },
];

export default function AppShell() {
  const [activeTab, setActiveTab] = useState('finanzas');
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Inter:wght@300;400;500&display=swap');
        .font-display { font-family: 'Sora', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-30 flex items-center gap-1 px-4 h-11 border-b border-[#161616] bg-[#0A0A0A]/95 backdrop-blur font-body">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-normal transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6] ${
              activeTab === tab.id ? 'bg-[#3B82F6]/15 text-[#3B82F6]' : 'text-[#75757A] hover:text-[#D4D4D4]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </header>

      {current.render()}
    </div>
  );
}
