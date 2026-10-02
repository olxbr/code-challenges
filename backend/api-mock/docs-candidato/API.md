# API de Moderação de Anúncios

Serviço de moderação usado pelo desafio. Todo anúncio deve ser aprovado por esta API antes de ser publicado.

## Como rodar

```bash
docker compose up
# ou, com Node 18+:
node server.js
```

O serviço sobe em `http://localhost:8787`.

## Endpoints

### `GET /health`

Verificação de disponibilidade. Retorna `200 {"status": "ok"}`.

### `POST /v1/moderation/check`

Envia um anúncio para moderação.

**Request body (JSON):**

| Campo | Tipo | Obrigatório |
|---|---|---|
| `title` | string | sim |
| `description` | string | sim |
| `price` | number | sim |
| `category` | string | sim (ver categorias abaixo) |

**Resposta `200` (aprovado):**

```json
{ "status": "approved" }
```

**Resposta `200` (reprovado):**

```json
{ "status": "rejected", "reason": "contact_info_not_allowed" }
```

Motivos possíveis de reprovação: `contact_info_not_allowed`, `prohibited_item`, `price_out_of_range`.

**Resposta `400`:** payload inválido (`validation_error` com a lista de problemas, ou `invalid_json`).

**Resposta `429`:** limite de taxa excedido. O serviço aceita até 5 requisições por segundo; acima disso responde `429` com o header `Retry-After` (em segundos).

## Categorias e faixas de preço

Anúncios com preço fora da faixa da categoria são reprovados.

| Categoria | Preço mínimo (R$) | Preço máximo (R$) |
|---|---|---|
| `eletronicos` | 10 | 50.000 |
| `moveis` | 20 | 30.000 |
| `veiculos` | 1.000 | 500.000 |
| `imoveis` | 10.000 | 5.000.000 |
| `esportes` | 5 | 20.000 |
| `colecionaveis` | 1 | 100.000 |

## Dados de exemplo

O arquivo `seed/ads.json` contém as categorias válidas e 57 anúncios de exemplo para você popular sua base e testar a listagem com paginação e filtro.

## Observações

- O serviço simula um sistema externo real: a latência de resposta é variável.
- Trate a integração como você trataria uma dependência externa em produção.
