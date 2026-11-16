# API de Anúncios

API que simula o backend de um marketplace. Para subir o serviço, veja o [README](./README.md).

Base URL local: `http://localhost:8788`

## Problemas conhecidos (não serão corrigidos)

Este backend é uma dependência que você não controla. Ele tem dois problemas **intencionais** em `GET /v1/ads` e `POST /v1/ads`. Não altere o `server.js`: adapte a sua aplicação para conviver com eles.

| Problema | O que acontece | Frequência padrão |
| --- | --- | --- |
| Resposta lenta | A chamada demora de **5 a 10 segundos** para responder. Nas demais, a latência fica entre 100 e 600 ms. | ~15% das chamadas |
| Erro interno | A chamada responde `500 {"error": "internal_error"}`. | ~10% das chamadas |

Os dois ocorrem de forma aleatória e independente, então uma chamada pode ser lenta e ainda terminar em `500`. Uma tentativa de criação que termina em `500` **não** cria o anúncio. `GET /health` não é afetado.

Para reproduzir os cenários com facilidade, ajuste as probabilidades ao subir o servidor:

```bash
# Toda chamada falha com 500
ERROR_RATE=1 SLOW_RESPONSE_RATE=0 node server.js

# Toda chamada é lenta
ERROR_RATE=0 SLOW_RESPONSE_RATE=1 node server.js

# Sem problemas (útil para isolar o fluxo feliz)
ERROR_RATE=0 SLOW_RESPONSE_RATE=0 node server.js
```

Com Docker, use `ERROR_RATE=1 docker compose up` ou defina `environment` no `docker-compose.yml`.

## Configuração

| Variável | Padrão | Descrição |
| --- | ---: | --- |
| `PORT` | `8788` | Porta do servidor. |
| `ERROR_RATE` | `0.1` | Probabilidade (0 a 1) de `500`. |
| `SLOW_RESPONSE_RATE` | `0.15` | Probabilidade (0 a 1) de resposta lenta. |
| `LATENCY_MIN_MS` / `LATENCY_MAX_MS` | `100` / `600` | Latência das respostas normais. |
| `SLOW_LATENCY_MIN_MS` / `SLOW_LATENCY_MAX_MS` | `5000` / `10000` | Latência das respostas lentas. |

## CORS

A API aceita requisições de qualquer origem (`Access-Control-Allow-Origin: *`) e responde ao preflight `OPTIONS`, então pode ser chamada diretamente pelo navegador.

## Persistência

Os anúncios criados ficam apenas na memória do processo. Reiniciar o servidor restaura os anúncios iniciais.

## Categorias

| `id` | Nome |
| --- | --- |
| `eletronicos` | Eletrônicos |
| `casa-decoracao` | Casa e decoração |
| `veiculos` | Veículos |
| `esportes` | Esportes |
| `moda` | Moda |

## Endpoints

### `GET /health`

Verifica a disponibilidade. Responde `200 {"status": "ok"}`, sem atraso nem falhas simuladas.

### `GET /v1/ads`

Lista anúncios, do mais recente para o mais antigo.

| Query | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `q` | string | | Texto procurado no título e na descrição, sem diferenciar maiúsculas/minúsculas nem acentos. |
| `category` | string | | `id` de uma categoria. |
| `page` | inteiro ≥ 1 | `1` | Página. |
| `pageSize` | inteiro de 1 a 50 | `12` | Itens por página. |

Os filtros se combinam e são aplicados antes da paginação.

```bash
curl "http://localhost:8788/v1/ads?q=bicicleta&category=esportes&page=1&pageSize=12"
```

**Resposta `200`:**

```json
{
  "data": [
    {
      "id": "ad-004",
      "title": "Bicicleta Aro 29 Shimano 21V",
      "description": "Mountain bike em alumínio, freios a disco e câmbio Shimano de 21 marchas.",
      "price": 1250,
      "category": "esportes",
      "imageUrl": "https://picsum.photos/seed/ad-004/600/400",
      "location": "Belo Horizonte, MG",
      "createdAt": "2026-11-14T08:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "pageSize": 12, "totalItems": 1, "totalPages": 1 }
}
```

- `price` é um número em reais.
- `location` é `null` nos anúncios criados via API.
- Sem resultados, ou com `page` além da última, a resposta é `200` com `data: []`. Nesse caso `totalPages` reflete o total real (`0` quando não há nenhum item).

**Resposta `400`:** parâmetro inválido.

```json
{ "error": "validation_error", "details": [{ "field": "page", "message": "page must be a positive integer" }] }
```

### `POST /v1/ads`

Cria um anúncio.

| Campo | Tipo | Regra |
| --- | --- | --- |
| `title` | string | Obrigatório, de 10 a 100 caracteres (após remover espaços nas pontas). |
| `description` | string | Obrigatória, até 2000 caracteres. |
| `price` | number | Obrigatório, maior que zero. Deve ser número, não texto. |
| `category` | string | Obrigatória, um `id` da tabela de categorias. |
| `imageUrl` | string | Obrigatória, URL `http` ou `https`. |

```bash
curl -X POST http://localhost:8788/v1/ads \
  -H "Content-Type: application/json" \
  -d '{"title":"Mesa de escritório compacta","description":"Mesa de madeira em bom estado.","price":350,"category":"casa-decoracao","imageUrl":"https://picsum.photos/seed/mesa/600/400"}'
```

**Resposta `201`:** o anúncio criado, com `id` e `createdAt` gerados pelo servidor.

**Resposta `400`:** `invalid_json` (corpo não é JSON) ou `validation_error` com um item em `details` por campo inválido:

```json
{
  "error": "validation_error",
  "details": [{ "field": "title", "message": "title must have between 10 and 100 characters" }]
}
```

### Erros comuns

| Status | Quando |
| --- | --- |
| `400` | Parâmetros ou corpo inválidos. |
| `404` | Rota inexistente (`{"error": "not_found"}`). |
| `413` | Corpo maior que 100 KB. |
| `500` | Erro interno simulado (`{"error": "internal_error"}`). |

## Observações

- As imagens do seed usam `picsum.photos` e exigem acesso à internet.
- Os testes do mock rodam com `node --test`.
