'use client';

import { useState } from 'react';

export default function SentryExamplePage() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Sentry Example Page</h1>
      <p className="text-sm text-slate-600 mt-2">
        Clique no botão para disparar um erro proposital e verificar se o Sentry está capturando corretamente.
      </p>

      <button
        type="button"
        onClick={() => {
          setClicked(true);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (globalThis as any).myUndefinedFunction();
        }}
        className="mt-6 bg-ngo-danger hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        Disparar erro de teste
      </button>

      {clicked && (
        <p className="text-xs text-slate-500 mt-3">
          Se você está vendo isso e a página quebrou, o erro foi disparado.
        </p>
      )}
    </div>
  );
}
