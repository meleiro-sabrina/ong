import { NextResponse } from 'next/server';

// Esta rota é usada para testar se o Sentry está funcionando
export async function GET() {
  // Simula um erro para testar o Sentry
  try {
    throw new Error('Teste de erro do Sentry - Esta é uma mensagem de teste');
  } catch (error) {
    // O erro será automaticamente capturado pelo Sentry via instrumentation
    return NextResponse.json({ 
      success: true, 
      message: 'Erro de teste enviado para o Sentry. Verifique seu dashboard.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
