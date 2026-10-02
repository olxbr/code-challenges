# Desafio Técnico — Backend

## Objetivo

Construa um serviço de **inserção e listagem de anúncios de um marketplace**.

O serviço deve contemplar:

### 1. Criar anúncio

Recebe título, descrição, preço, categoria e ao menos 1 imagem (pode ser uma URL).

Validações obrigatórias:

- preço maior que zero;
- título entre 10 e 100 caracteres.

### 2. Listar anúncios

Lista os anúncios com paginação e filtro por categoria.

### 3. Moderação automática

Antes de publicar, o anúncio passa pela API de moderação que fornecemos (mock, veja a seção abaixo). Anúncios reprovados ficam com status `rejected` e o motivo da reprovação deve ficar visível.

### 4. Detalhe do anúncio

Exibe um anúncio individual com seus dados e status.

## Entrega esperada para a trilha de Backend

- API REST de anúncios;
- Persistência dos dados;
- Integração com o mock de moderação;
- O contrato da sua própria API documentado.

Seu código deve consumir o mock **como se fosse um serviço externo real**.

## Tecnologias

- **Linguagens sugeridas:** Node, Kotlin, Go, Java ou Python.
- **Framework:** livre, fique à vontade para escolher.

## API de moderação (mock)

Você vai integrar com uma API de moderação que fornecemos como mock, na pasta [`api-mock`](./api-mock). **Comece pela documentação em [`api-mock/docs-candidato/API.md`](./api-mock/docs-candidato/API.md)**, que traz como rodar o mock e o contrato completo (endpoints, categorias, faixas de preço e respostas), antes de implementar a integração.

Consuma o mock como se fosse um serviço externo real.
