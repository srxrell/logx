// lib/transports/console.js

import { LEVELS } from '../../index.js'; // При ESM цикличный импорт безопасен, используется только значение.

const isNode =
  typeof process !== 'undefined' &&
  process.versions != null &&
  process.versions.node != null;

export default function consoleTransport(options = {}) {
  const {
    level = 'trace',
    stream = 'stdout',          // stdout | stderr
    stripColorsInBrowser = true // браузер ANSI не понимает
  } = options;

  const minLevel = LEVELS[level] ?? LEVELS.trace;
  const useStderr = stream === 'stderr';

  return (formattedMessage, entry) => {
    if ((LEVELS[entry.level] ?? 0) < minLevel) return;

    let out = formattedMessage;
    if (!isNode && stripColorsInBrowser) {
      out = out.replace(/\x1b\[\d+m/g, '');
    }

    if (isNode) {
      const target = useStderr ? process.stderr : process.stdout;
      try {
        target.write(out + '\n');
      } catch {
        // eslint-disable-next-line no-console
        console.log(out);
      }
    } else {
      // eslint-disable-next-line no-console
      (useStderr ? console.error : console.log)(out);
    }
  };
}
