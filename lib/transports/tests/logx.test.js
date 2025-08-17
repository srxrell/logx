import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLogger, transports } from '/index.js';
import fs from 'fs';
import path from 'path';

describe('Logx logger', () => {
  let logs;

  beforeEach(() => {
    logs = [];
  });

  it('logs only messages >= level', () => {
    const logger = createLogger({
      level: 'warn',
      transports: [ (msg, entry) => logs.push({ msg, entry }) ],
    });

    logger.info('this should not be logged');
    logger.error('this should be logged');

    expect(logs.length).toBe(1);
    expect(logs[0].entry.level).toBe('error');
  });

  it('formats pretty logs with icons and colors', () => {
    const logger = createLogger({
      level: 'info',
      format: 'pretty',
      transports: [ (msg) => logs.push(msg) ],
    });

    logger.info('hello world');
    expect(logs[0]).toMatch(/💡 INFO:/);
    expect(logs[0]).toMatch(/\x1b\[34m/); // blue color
  });

  it('formats logs as JSON', () => {
    const logger = createLogger({
      level: 'info',
      format: 'json',
      transports: [ (msg) => logs.push(msg) ],
    });

    logger.info('json test', { foo: 'bar' });
    const parsed = JSON.parse(logs[0]);
    expect(parsed.msg).toBe('json test');
    expect(parsed.meta[0].foo).toBe('bar');
  });

  it('applies redact rules', () => {
    const logger = createLogger({
      level: 'info',
      redact: ['password'],
      format: 'json',
      transports: [ (msg) => logs.push(msg) ],
    });

    logger.info('user login', { user: 'alex', password: '123' });
    const parsed = JSON.parse(logs[0]);
    expect(parsed.meta[0].password).toBe('[REDACTED]');
  });

  it('writes logs to file with rotation', () => {
    const tmpFile = path.join(process.cwd(), 'test.log');
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

    const logger = createLogger({
      level: 'info',
      transports: [transports.file(tmpFile, { maxSize: 100 })],
      format: 'json',
    });

    // записываем несколько логов, чтобы переполнить файл
    for (let i = 0; i < 50; i++) {
      logger.info('line ' + i, { foo: 'bar' });
    }

    expect(fs.existsSync(tmpFile)).toBe(true);
    const content = fs.readFileSync(tmpFile, 'utf8');
    expect(content).toMatch(/line/);
  });

  it('sends logs via server transport (mock fetch)', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));

    const logger = createLogger({
      level: 'info',
      transports: [
        transports.server('https://fake.com/ingest')
      ],
    });

    logger.info('server test', { a: 1 });
    await new Promise(r => setTimeout(r, 20));

    expect(fetch).toHaveBeenCalledOnce();
    const call = fetch.mock.calls[0];
    expect(call[0]).toBe('https://fake.com/ingest');
    const body = JSON.parse(call[1].body);
    expect(body.message).toBe('server test');
  });

  it('supports batch mode in server transport', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));

    const logger = createLogger({
      level: 'info',
      transports: [
        transports.server('https://fake.com/ingest', { batch: { size: 2, interval: 50 } })
      ],
    });

    logger.info('batch1');
    logger.info('batch2');

    await new Promise(r => setTimeout(r, 100));

    expect(fetch).toHaveBeenCalledOnce();
    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBe(2);
  });
});
