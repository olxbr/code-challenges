# API mock de anúncios

API local usada pelos desafios de frontend. Não precisa instalar dependências.

## Rodar

Com [Node.js](https://nodejs.org) 18 ou superior, nesta pasta:

```bash
node server.js
```

A API fica disponível em `http://localhost:8788`. Para conferir, abra <http://localhost:8788/health> no navegador: deve aparecer `{"status":"ok"}`.

Prefere Docker?

```bash
docker compose up
```

Para parar, use `Ctrl+C`. Ao reiniciar, os anúncios criados por você são descartados.

## Atenção

Esta API **tem problemas conhecidos que não serão corrigidos**: algumas respostas demoram muito e outras falham com erro 500. Eles fazem parte do desafio. Leia a [documentação completa da API](./API.md) antes de começar.
