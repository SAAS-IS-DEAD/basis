# Basis

Для запуска нужны Bun 1.3.6 и Node.js 24 (от 24.15).

```sh
bun install
bun run dev
```

Открыть [localhost:3000](http://localhost:3000).

Проверки:

```sh
bun run test
bun run typecheck
bun run lint
```

Сборка и запуск собранного приложения:

```sh
bun run build
bun run preview
```

Или через Docker:

```sh
docker compose up --build
```
