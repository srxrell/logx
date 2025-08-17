// lib/transports/server.js
import { LEVELS } from '../../index.js';

const hasFetch = typeof fetch === 'function';

export default function serverTransport(url, {
  level = 'trace',
  batch = false,     // true | { size, interval }
  headers = { 'Content-Type': 'application/json' },
  timeout = 5000,
  silentFail = true,
  transform = null,
} = {}) {
  if (!url) throw new Error('serverTransport requires url');
  const minLevel = LEVELS[level] ?? LEVELS.trace;

  let buffer = [];
  let timer = null;

  async function send(payload) {
    try {
      await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeout),
      });
    } catch (e) {
      if (!silentFail) console.error('Logx serverTransport error:', e);
    }
  }

  function flush() {
    if (buffer.length === 0) return;
    const payload = batch ? buffer.splice(0, buffer.length) : buffer.pop();
    send(payload);
    buffer = [];
  }

  return (formatted, entry) => {
    if ((LEVELS[entry.level] ?? 0) < minLevel) return;
    const payload = transform ? transform(entry) : entry;

    if (batch) {
      buffer.push(payload);
      const { size = 10, interval = 2000 } = batch === true ? {} : batch;
      if (buffer.length >= size) flush();
      if (!timer) timer = setInterval(flush, interval);
    } else {
      send(payload);
    }
  };
}
