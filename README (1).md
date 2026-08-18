# Dashboard — Angel

Proyecto React + Vite + Tailwind, listo para GitHub → Vercel.

## Arquitectura (importante antes de tocar nada)

```
src/
  main.jsx            monta <AppShell />
  app/
    AppShell.jsx       UNICO lugar que conoce las 3 pestañas (Finanzas / Ambito 2 / Ambito 3)
    ComingSoon.jsx      placeholder generico para pestañas sin modulo todavia
  finanzas/             modulo Finanzas, 100% independiente y autocontenido
    ModuloFinanciero.jsx
    data/ engine/ state/ components/
```

`src/finanzas/` no sabe que existen otras pestañas. Cuando construyamos Ambito 2
o Ambito 3, cada uno sera su propia carpeta hermana (`src/ambito2/`, etc.) con su
propio Provider/estado, y solo se conecta editando el arreglo `TABS` en
`AppShell.jsx` -- sin tocar Finanzas.

## Ejecutar en local

```bash
npm install
npm run dev
```

## Build de produccion

```bash
npm run build
npm run preview
```

## Desplegar: GitHub → Vercel → URL permanente

**1. Subir a GitHub**
```bash
git init
git add .
git commit -m "Dashboard: Finanzas v1 + arquitectura de pestañas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

**2. Conectar Vercel**
- Entra a vercel.com → *Add New → Project* → importa el repo de GitHub.
- Vercel detecta Vite automaticamente (usa `vercel.json` incluido: build `npm run build`, output `dist`). No necesitas configurar nada mas.
- Click *Deploy*.

**3. URL permanente**
- Al terminar el deploy, Vercel te da una URL tipo `https://tu-repo.vercel.app`. Esa es tu URL de produccion.

**4. Flujo automatico para cambios futuros**
- `main` → cada push se despliega como **produccion** (misma URL).
- Cualquier otra rama (o un Pull Request) → Vercel crea automaticamente una **preview URL** distinta, sin tocar produccion. Asi podemos probar cambios antes de fusionarlos a `main`.

No hay ninguna variable de entorno ni secreto que configurar por ahora -- el
proyecto no llama a ningun backend ni API externa todavia.
