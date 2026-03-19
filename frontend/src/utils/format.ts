/** Format a byte count into a human-readable string (e.g. 1.4 MB) */
export function fmtBytes(b: number): string {
  if (b >= 1_000_000_000) return `${(b / 1_000_000_000).toFixed(1)} GB`;
  if (b >= 1_000_000)     return `${(b / 1_000_000).toFixed(1)} MB`;
  if (b >= 1_000)         return `${(b / 1_000).toFixed(1)} KB`;
  return `${b} B`;
}

/** Format a Unix ms timestamp as HH:MM:SS */
export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

/** Format a Unix ms timestamp as a relative string (e.g. "2m ago") */
export function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
