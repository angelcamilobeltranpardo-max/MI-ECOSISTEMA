import React from 'react';

/**
 * Placeholder generico para pestañas que todavia no tienen modulo propio
 * (Ambito 2, Ambito 3). Cuando ese modulo exista, se reemplaza por su
 * propio componente independiente en AppShell.jsx -- esto no vive dentro
 * de src/finanzas, para no acoplar Finanzas a la navegacion general.
 */
export default function ComingSoon({ label }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#0A0A0A]">
      <div className="text-center">
        <p className="font-display text-[20px] font-light text-[#75757A]">{label}</p>
        <p className="text-[12.5px] text-[#454545] mt-2">Este modulo todavia no esta construido.</p>
      </div>
    </div>
  );
}
