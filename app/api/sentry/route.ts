import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// This route handles Sentry tunneling to bypass ad-blockers
export async function POST(request: Request) {
  try {
    const envelope = await request.text();
    
    // Forward to Sentry
    const sentryHost = 'o4500000000000000.ingest.sentry.io'; // Replace with your Sentry host
    const sentryProjectId = '00000000'; // Replace with your project ID
    
    const url = `https://${sentryHost}/api/${sentryProjectId}/envelope/`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    return NextResponse.json({ success: response.ok }, { status: response.status });
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return NextResponse.json({ error: 'Failed to tunnel to Sentry' }, { status: 500 });
  }
}
