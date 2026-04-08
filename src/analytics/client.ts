import { createTimestamp } from '@/src/utils/time';

import type {
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventPayload,
} from '@/src/analytics/schema';

export type AnalyticsAdapter = {
  track: (event: AnalyticsEvent) => Promise<void> | void;
  flush?: () => Promise<void> | void;
};

const eventBuffer: AnalyticsEvent[] = [];
const MAX_BUFFER_SIZE = 500;
const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
let activeAdapter: AnalyticsAdapter | null = null;

export function setAnalyticsAdapter(adapter: AnalyticsAdapter | null) {
  activeAdapter = adapter;
}

export function getBufferedAnalyticsEvents() {
  return [...eventBuffer];
}

export async function flushAnalyticsEvents() {
  if (!activeAdapter?.flush) {
    return;
  }

  await activeAdapter.flush();
}

export async function trackAnalyticsEvent(
  name: AnalyticsEventName,
  payload: AnalyticsEventPayload = {}
) {
  const event: AnalyticsEvent = {
    name,
    timestamp: createTimestamp(),
    sessionId,
    payload,
  };

  eventBuffer.push(event);

  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.splice(0, eventBuffer.length - MAX_BUFFER_SIZE);
  }

  if (__DEV__) {
    console.log(`[analytics] ${name}`, payload);
  }

  if (!activeAdapter) {
    return;
  }

  try {
    await activeAdapter.track(event);
  } catch (error) {
    console.warn(`Failed to track analytics event "${name}"`, error);
  }
}
