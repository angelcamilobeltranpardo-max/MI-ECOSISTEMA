import React, { useState } from 'react';
import ModuloFinanciero from '../finanzas/ModuloFinanciero';
import ComingSoon from './ComingSoon';

/**
 * AppShell -- unico lugar del proyecto que conoce las 3 pestañas del
 * dashboard personal (Finanzas / Personal / Academico). Finanzas NO sabe
 * que esta navegacion existe: solo se le monta como <ModuloFinanciero />,
 * exactamente igual que si se usara sola. Cuando Personal y Academico tengan
 * su propio modulo real, solo hay que:
 *   1. crear src/personal/... (o el nombre que corresponda), con su propio
 *      Provider/estado, igual que src/finanzas;
 *   2. importarlo aqui y reemplazar el ComingSoon correspondiente en TABS.
 * Nada de eso implica tocar src/finanzas.
 */
const TABS = [
  { id: 'finanzas', label: 'FINANZAS', render: () => <ModuloFinanciero /> },
  { id: 'personal', label: 'PERSONAL', render: () => <ComingSoon label="Personal" /> },
  { id: 'academico', label: 'ACADEMICO', render: () => <ComingSoon label="Academico" /> },
];

// Ilustracion decorativa "Roma" -- NO es una foto real (evita cualquier
// problema de derechos de autor con una imagen que no podemos licenciar):
// es un degradado calido tipo atardecer + una silueta de arcos/columnas en
// SVG, generada aqui mismo. La capa oscura semitransparente + blur encima
// (glassmorphism) es la que garantiza que el texto de la navegacion y el
// saludo se lean con contraste total, tal como se pidio.
function FondoRoma() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #3D2410 0%, #6B3A1E 35%, #B5652B 65%, #E8A559 100%)',
        }}
      />
      <svg className="absolute bottom-0 left-0 w-full h-full opacity-80" viewBox="0 0 1440 260" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <g fill="#1B1409" fillOpacity="0.55">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path
              key={i}
              d={`M${i * 190} 260 L${i * 190} 140 A32 32 0 0 1 ${i * 190 + 64} 140 L${i * 190 + 64} 260 Z`}
            />
          ))}
        </g>
        <rect x="0" y="230" width="1440" height="30" fill="#150E07" fillOpacity="0.6" />
      </svg>
      {/* Capa glassmorphism: oscurece y difumina para legibilidad total */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />
    </div>
  );
}

export default function AppShell() {
  const [activeTab, setActiveTab] = useState('finanzas');
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      <header className="sticky top-0 z-30 relative h-14 border-b border-white/10 font-body overflow-hidden">
        <FondoRoma />
        <div className="relative z-10 flex items-center gap-1.5 px-4 h-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6] ${
                activeTab === tab.id ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/85'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {current.render()}
    </div>
  );
}
