export type RemoteAnalyticsConfig = {
  endpoint: string;
  apiKey: string | null;
  source: string;
};

function readPublicEnv(name: string) {
  const value = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env?.[name];
  return typeof value === 'string' ? value.trim() : '';
}

export function getRemoteAnalyticsConfig(): RemoteAnalyticsConfig | null {
  const endpoint = readPublicEnv('EXPO_PUBLIC_ANALYTICS_ENDPOINT');

  if (!endpoint) {
    return null;
  }

  const apiKey = readPublicEnv('EXPO_PUBLIC_ANALYTICS_API_KEY');
  const source =
    readPublicEnv('EXPO_PUBLIC_ANALYTICS_SOURCE') ||
    'dungeon-dive-bad-decisions';

  return {
    endpoint,
    apiKey: apiKey.length > 0 ? apiKey : null,
    source,
  };
}

export function isRemoteAnalyticsConfigured() {
  return Boolean(getRemoteAnalyticsConfig());
}
