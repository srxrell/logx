// lib/transports/file.js
import fs from 'fs';
import path from 'path';
import { LEVELS } from '../../index.js';

export default function fileTransport(filePath, {
  level = 'trace',
  maxSize = 1024 * 1024, // 1MB
  maxFiles = 5,
} = {}) {
  if (!filePath) throw new Error('fileTransport requires filePath');
  const minLevel = LEVELS[level] ?? LEVELS.trace;

  function rotate() {
    for (let i = maxFiles - 1; i > 0; i--) {
      const src = `${filePath}.${i}`;
      const dst = `${filePath}.${i+1}`;
      if (fs.existsSync(src)) fs.renameSync(src, dst);
    }
    fs.renameSync(filePath, `${filePath}.1`);
  }

  return (formatted, entry) => {
    if ((LEVELS[entry.level] ?? 0) < minLevel) return;

    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > maxSize) {
        rotate();
      }
      fs.appendFileSync(filePath, formatted + '\n');
    } catch (e) {
      console.error('Logx fileTransport error:', e);
    }
  };
}
