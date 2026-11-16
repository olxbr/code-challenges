# Desafio Técnico — Frontend Web

## Objetivo

Construa a interface web de um **marketplace de anúncios**, onde pessoas podem publicar anúncios e consultar os já publicados.

A interface deve contemplar:

### 1. Listar anúncios

Exibe os anúncios em cards com imagem, título, preço, categoria e localização (quando existir).

- Paginação.
- Filtro por categoria.
- Busca textual por título e descrição.
- Contagem de resultados.
- Os cards que não correspondem à busca e ao filtro não devem aparecer.

### 2. Criar anúncio

Formulário com título, descrição, preço, categoria e URL da imagem.

- Valide os campos na interface e mostre os erros próximos a cada campo.
- Ao publicar com sucesso, a pessoa deve perceber que deu certo e o anúncio deve estar disponível na listagem.

### 3. Estados da interface

Contemple os estados que a pessoa usuária encontra ao usar a aplicação: carregamento, lista vazia, nenhum resultado para a busca ou o filtro, falha ao carregar, envio em andamento e falha ao publicar.

## Referência visual

[`handoff.png`](./handoff.png) mostra uma proposta de interface, com layout desktop e mobile, formulário e estados. Use-a como referência de conteúdo e hierarquia.

[![Referência visual do desafio: listagem desktop e mobile, formulário de criação e estados da interface](./handoff.png)](./handoff.png)

**Não esperamos fidelidade visual.** Você pode adaptar o layout, e o que a imagem não mostra fica a seu critério.

## A API

Você vai consumir uma API local que fornecemos, na pasta [`api-mock`](../api-mock). **Comece pelo [guia para rodá-la](../api-mock/README.md)** e leia a [documentação](../api-mock/API.md), em especial a seção de problemas conhecidos.

Trate a API como um serviço externo que você não controla. Não altere o código dela.

## Tecnologias

- **Sugeridas:** React, TypeScript e Tailwind CSS. Para os componentes, [Base UI](https://base-ui.com) ou [shadcn/ui](https://ui.shadcn.com) são boas opções, mas qualquer biblioteca ou implementação própria é aceita.
- **Livre:** você pode usar outro framework ou linguagem. Se fugir do sugerido, conte o motivo no `DECISIONS.md`.

## O que entregar

Siga as regras de entrega do [README principal](../../README.md): código funcional com instruções de execução, `DECISIONS.md`, `AI_USAGE.md` e testes dos fluxos críticos.

Sua aplicação deve ser utilizável em telas de celular e de computador, e todas as ações precisam funcionar sem mouse.
