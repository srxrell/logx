# LogX

[![npm version](https://img.shields.io/npm/v/@logx/logx)](https://www.npmjs.com/package/@logx/logx)
[![License](https://img.shields.io/npm/l/@logx/logx)](LICENSE)

**LogX** — современный, гибкий и лёгкий логгер для Node.js и браузера с поддержкой:
- Уровней логирования: trace, debug, info, warn, error, fatal
- Красивого форматирования (pretty) с иконками и цветами
- JSON формата для структурированных логов
- Редактирования чувствительных полей (redact)
- Транспорты: консоль, файл, сервер (HTTP/REST)
- Batch логирования и ротации файлов

## Установка

npm install @logx/logx
# или
yarn add @logx/logx

## Быстрый пример

import { createLogger, transports } from '@logx/logx';

const logger = createLogger({
  level: 'info',
  format: 'pretty',
  redact: ['password'],
  transports: [
    transports.console(),
    transports.file('./app.log', { maxSize: 1024 * 1024, maxFiles: 3 }),
    transports.server('https://your-server.com/logs', { batch: { size: 5, interval: 2000 } })
  ]
});

logger.info('User login', { user: 'alice', password: '12345' });
logger.error('Something went wrong', { code: 500 });

## Форматы логов

- pretty — человекочитаемый формат с цветами и иконками
- json — структурированный JSON с полями:
  - time — метка времени
  - level — уровень логирования
  - msg — сообщение
  - meta — дополнительные данные
  - Чувствительные поля из redact заменяются на [REDACTED]

## Транспорты

- Console — вывод в stdout/stderr с авто-очисткой цветов для браузера
- File — запись в файл с поддержкой ротации по размеру
- Server — отправка логов на HTTP сервер, поддержка batch

## Лицензия

MIT © 2025
