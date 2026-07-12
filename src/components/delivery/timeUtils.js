export function formatTimer(ms) {
  if (!ms || ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(ms) {
  if (!ms || ms < 0) ms = 0;
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return '0m';
}

export function computeTiming(log, now) {
  const startTime = log?.start_time ? new Date(log.start_time).getTime() : null;
  const finishTime = log?.finish_time ? new Date(log.finish_time).getTime() : null;
  const breaks = log?.breaks || [];
  const onBreak = breaks.length > 0 && !breaks[breaks.length - 1].end;

  const breakMs = breaks.reduce((sum, b) => {
    const start = new Date(b.start).getTime();
    const end = b.end ? new Date(b.end).getTime() : now;
    return sum + Math.max(0, end - start);
  }, 0);

  const elapsedMs = startTime ? Math.max(0, (finishTime || now) - startTime - breakMs) : 0;

  return { startTime, finishTime, onBreak, breakMs, elapsedMs };
}