const MINUTE_IN_MS = 60_000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

export function createTimestamp() {
  return new Date().toISOString();
}

export function formatSaveTimestampLabel(isoTimestamp: string | null | undefined) {
  if (!isoTimestamp) {
    return 'recently';
  }

  const timestamp = new Date(isoTimestamp);
  const diffInMs = Date.now() - timestamp.getTime();

  if (Number.isNaN(diffInMs) || diffInMs < 0) {
    return 'recently';
  }

  if (diffInMs < MINUTE_IN_MS) {
    return 'a moment ago';
  }

  if (diffInMs < HOUR_IN_MS) {
    const minutes = Math.max(1, Math.floor(diffInMs / MINUTE_IN_MS));
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }

  if (diffInMs < DAY_IN_MS) {
    const hours = Math.max(1, Math.floor(diffInMs / HOUR_IN_MS));
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(timestamp);
}
