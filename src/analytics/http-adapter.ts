import type { AnalyticsAdapter } from '@/src/analytics/client';
import { setAnalyticsAdapter } from '@/src/analytics/client';
import type { AnalyticsEvent } from '@/src/analytics/schema';
import {
  getRemoteAnalyticsConfig,
  type RemoteAnalyticsConfig,
} from '@/src/analytics/remote-config';
import { createTimestamp } from '@/src/utils/time';

type RemoteAnalyticsDebugState = {
  configured: boolean;
  endpoint: string | null;
  source: string | null;
  pendingCount: number;
  lastFlushAt: string | null;
  lastFlushStatus: 'idle' | 'success' | 'error';
  lastFlushCount: number;
  lastError: string | null;
  lastValidationAt: string | null;
  lastValidationOk: boolean | null;
  lastValidationStatusCode: number | null;
  lastValidationMessage: string | null;
};

const FLUSH_BATCH_SIZE = 20;

let activeConfig: RemoteAnalyticsConfig | null = null;
let pendingEvents: AnalyticsEvent[] = [];
let isFlushing = false;
let debugState: RemoteAnalyticsDebugState = {
  configured: false,
  endpoint: null,
  source: null,
  pendingCount: 0,
  lastFlushAt: null,
  lastFlushStatus: 'idle',
  lastFlushCount: 0,
  lastError: null,
  lastValidationAt: null,
  lastValidationOk: null,
  lastValidationStatusCode: null,
  lastValidationMessage: null,
};

function updateDebugState(
  nextState: Partial<RemoteAnalyticsDebugState>
): RemoteAnalyticsDebugState {
  debugState = {
    ...debugState,
    ...nextState,
  };

  return debugState;
}

function getHeaders(config: RemoteAnalyticsConfig) {
  return {
    'Content-Type': 'application/json',
    ...(config.apiKey ? { 'x-analytics-key': config.apiKey } : {}),
  };
}

async function postAnalyticsEnvelope(
  config: RemoteAnalyticsConfig,
  body: Record<string, unknown>
) {
  return fetch(config.endpoint, {
    method: 'POST',
    headers: getHeaders(config),
    body: JSON.stringify(body),
  });
}

async function flushPendingEvents() {
  if (!activeConfig || pendingEvents.length === 0 || isFlushing) {
    return;
  }

  isFlushing = true;

  try {
    const batch = pendingEvents.slice(0, FLUSH_BATCH_SIZE);
    const response = await postAnalyticsEnvelope(activeConfig, {
      source: activeConfig.source,
      sentAt: createTimestamp(),
      mode: 'events',
      events: batch,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(
        `Remote analytics flush failed (${response.status}): ${
          responseText || 'No response body.'
        }`
      );
    }

    pendingEvents = pendingEvents.slice(batch.length);
    updateDebugState({
      pendingCount: pendingEvents.length,
      lastFlushAt: createTimestamp(),
      lastFlushStatus: 'success',
      lastFlushCount: batch.length,
      lastError: null,
    });
  } catch (error) {
    updateDebugState({
      pendingCount: pendingEvents.length,
      lastFlushAt: createTimestamp(),
      lastFlushStatus: 'error',
      lastFlushCount: 0,
      lastError:
        error instanceof Error ? error.message : 'Remote analytics flush failed.',
    });
    throw error;
  } finally {
    isFlushing = false;
  }
}

export function getRemoteAnalyticsDebugState() {
  return {
    ...debugState,
    pendingCount: pendingEvents.length,
  };
}

export function installRemoteAnalyticsAdapter() {
  const config = getRemoteAnalyticsConfig();
  activeConfig = config;

  updateDebugState({
    configured: Boolean(config),
    endpoint: config?.endpoint ?? null,
    source: config?.source ?? null,
    pendingCount: pendingEvents.length,
    lastError: config ? debugState.lastError : null,
  });

  if (!config) {
    setAnalyticsAdapter(null);
    return false;
  }

  const adapter: AnalyticsAdapter = {
    track: async (event) => {
      pendingEvents.push(event);
      updateDebugState({
        pendingCount: pendingEvents.length,
      });

      if (pendingEvents.length >= FLUSH_BATCH_SIZE) {
        await flushPendingEvents();
      }
    },
    flush: flushPendingEvents,
  };

  setAnalyticsAdapter(adapter);
  return true;
}

export async function validateRemoteAnalyticsEndpoint() {
  const config = getRemoteAnalyticsConfig();
  activeConfig = config;

  if (!config) {
    updateDebugState({
      configured: false,
      endpoint: null,
      source: null,
      lastValidationAt: createTimestamp(),
      lastValidationOk: false,
      lastValidationStatusCode: null,
      lastValidationMessage:
        'Missing EXPO_PUBLIC_ANALYTICS_ENDPOINT. Remote validation skipped.',
    });

    return getRemoteAnalyticsDebugState();
  }

  try {
    const response = await postAnalyticsEnvelope(config, {
      source: config.source,
      sentAt: createTimestamp(),
      mode: 'validation',
      dryRun: true,
      events: [
        {
          name: 'screen_viewed',
          timestamp: createTimestamp(),
          sessionId: 'remote-validation',
          payload: {
            screen: 'dev-smoke-analytics-validation',
          },
        },
      ],
    });
    const responseText = await response.text();
    const ok = response.ok;

    updateDebugState({
      configured: true,
      endpoint: config.endpoint,
      source: config.source,
      lastValidationAt: createTimestamp(),
      lastValidationOk: ok,
      lastValidationStatusCode: response.status,
      lastValidationMessage: ok
        ? `Validation probe accepted${responseText ? `: ${responseText}` : '.'}`
        : `Validation probe rejected (${response.status})${
            responseText ? `: ${responseText}` : '.'
          }`,
      lastError: ok ? null : debugState.lastError,
    });
  } catch (error) {
    updateDebugState({
      configured: true,
      endpoint: config.endpoint,
      source: config.source,
      lastValidationAt: createTimestamp(),
      lastValidationOk: false,
      lastValidationStatusCode: null,
      lastValidationMessage:
        error instanceof Error
          ? error.message
          : 'Validation probe failed before a response was received.',
      lastError:
        error instanceof Error
          ? error.message
          : 'Validation probe failed before a response was received.',
    });
  }

  return getRemoteAnalyticsDebugState();
}
