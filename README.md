# LogX

[![npm version](https://img.shields.io/npm/v/@logx/logx)](https://www.npmjs.com/package/@serell_vorne/logx)
[![License](https://img.shields.io/npm/l/@logx/logx)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/srxrell/logx/nodejs.yml)](https://github.com/srxrell/logx/actions)
[![Downloads](https://img.shields.io/npm/dt/@logx/logx)](https://www.npmjs.com/package/@serell_vorne/logx)

**LogX** — современный, гибкий и лёгкий логгер для Node.js и браузера с поддержкой:
- Уровней логирования: `trace`, `debug`, `info`, `warn`, `error`, `fatal`
- Красивого форматирования (pretty) с иконками и цветами
- JSON формата для структурированных логов
- Редактирования чувствительных полей (`redact`)
- Транспорты: консоль, файл, сервер (HTTP/REST)
- Batch логирования и ротации файлов

---

## 📦 Установка


```npm install @serell_vorne/logx```
# или
```yarn add @serell_vorne/logx```

# Быстрый старт

```
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

```

# 📄 Форматы логов

```pretty``` — человекочитаемый формат с цветами и иконками

```json``` — структурированный формат JSON с полями:

  1.```time``` — метка времени
  
  2.```level``` — уровень логирования
  
  3.```msg``` — сообщение
  
  4.```meta``` — дополнительные данные
  
  5. Чувствительные поля из ```redact``` заменяются на ```[REDACTED]```

## Пример JSON

```
{
  "time": "2025-08-17T22:00:00.000Z",
  "level": "info",
  "msg": "User login",
  "meta": [{ "user": "alice", "password": "[REDACTED]" }]
}
```

# 🚚 Транспорты

Console	- Вывод в stdout/stderr с авто-очисткой цветов для браузера
File - Запись в файл с поддержкой ротации по размеру
Server - Отправка логов на HTTP сервер, поддержка batch


# 🎯 Примеры использования

## 1. Pretty

```
logger.info('Server started', { port: 3000 });
logger.warn('Low disk space');
```

## 2. JSON логирование с редактированием

```
const logger = createLogger({ format: 'json', redact: ['token'] });
logger.info('User session', { user: 'bob', token: 'abc123' });
```

## 3. Batch отправка на сервер

```
const serverLogger = createLogger({
  transports: [
    transports.server('https://your-server.com/logs', { batch: { size: 10, interval: 5000 } })
  ]
});
serverLogger.info('Batch log example', { data: [1,2,3] });
```

# 🛠 Конфигурация

| Параметр     | Тип    | Описание                          | По умолчанию |
| ------------ | ------ | --------------------------------- | ------------ |
| `level`      | string | Минимальный уровень логов         | `info`       |
| `format`     | string | Формат логов: `pretty` или `json` | `pretty`     |
| `redact`     | array  | Поля для маскировки               | `[]`         |
| `transports` | array  | Массив транспортов                | `[]`         |

Создано Serell Vorne
