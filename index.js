// index.js
import consoleTransport from './lib/transports/console.js';
import fileTransport from './lib/transports/file.js';
import serverTransport from './lib/transports/server.js';

export const LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
};

export const transports = {
  console: consoleTransport,
  file: fileTransport,
  server: serverTransport,
};

export function createLogger({
  level = 'trace',
  format = 'pretty',
  transports: transportFns = [consoleTransport()],
  redact = [],
} = {}) {
  const minLevel = LEVELS[level] ?? LEVELS.trace;

  function applyRedact(meta) {
    return meta.map(item => {
      const copy = { ...item };
      redact.forEach(key => {
        if (key in copy) copy[key] = '[REDACTED]';
      });
      return copy;
    });
  }

  function formatPretty(entry) {
    const icons = {
      trace: '🔍',
      debug: '🐛',
      info: '💡',
      warn: '⚠️',
      error: '❌',
    };
    const colors = {
      trace: '\x1b[37m',
      debug: '\x1b[36m',
      info: '\x1b[34m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };
    const colorReset = '\x1b[0m';

    let metaStr = entry.meta && entry.meta.length
      ? JSON.stringify(entry.meta)
      : '';

    return `${colors[entry.level] ?? ''}${icons[entry.level] ?? ''} ${entry.level.toUpperCase()}:${colorReset} ${entry.message} ${metaStr}`;
  }

  function formatJSON(entry) {
    const meta = entry.meta ? applyRedact(entry.meta) : [];
    return JSON.stringify({
      msg: entry.message,
      level: entry.level,
      meta,
    });
  }

  function log(levelName, message, ...metaArgs) {
    const levelValue = LEVELS[levelName] ?? 0;
    if (levelValue < minLevel) return;

    const entry = {
      level: levelName,
      message,
      meta: metaArgs.length ? metaArgs : [],
    };

    const formatted = format === 'json'
      ? formatJSON(entry)
      : formatPretty(entry);

    transportFns.forEach(fn => fn(formatted, entry));
  }

  return {
    trace: (msg, ...meta) => log('trace', msg, ...meta),
    debug: (msg, ...meta) => log('debug', msg, ...meta),
    info: (msg, ...meta) => log('info', msg, ...meta),
    warn: (msg, ...meta) => log('warn', msg, ...meta),
    error: (msg, ...meta) => log('error', msg, ...meta),
  };
}
