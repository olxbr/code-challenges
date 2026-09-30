# Desafio Técnico — Backend

Olá,

Chegou o momento de conhecermos um pouco mais sobre a sua forma de pensar, estruturar soluções e comunicar ideias.

Nesta etapa, você apresentará um projeto para algumas pessoas do time de Engenharia. O objetivo é entender como você analisa um cenário, prioriza informações, constrói uma estratégia e conduz sua linha de raciocínio.

## Como funciona a etapa técnica?

Essa etapa terá duração de até **1h** e será dividida em dois momentos: **apresentação do desafio técnico** e **conversa sobre as decisões que você tomou durante o desenvolvimento**.

Para essa etapa, você deverá construir um serviço de inserção e listagem de anúncios de um marketplace.

Abaixo, detalhamos o desafio e o que esperamos da sua entrega.

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

## Sobre o uso de IA

O uso de IA **não só está autorizado como é encorajado** e faz parte dos critérios de avaliação. Ferramentas gratuitas são suficientes (ChatGPT, Claude, Gemini e Copilot têm planos gratuitos).

Vamos avaliar o seu **senso crítico e o entendimento do resultado**, e não o plano que você assina.

## O que enviar

1. **Código funcional**, com instruções de execução aqui no `README.md` (um comando ou poucos passos).
2. **`DECISIONS.md`** — decisões técnicas relevantes, alternativas consideradas e por que foram descartadas. Se algum requisito ficou ambíguo, qual interpretação você escolheu e por quê. Inclua o tempo aproximado gasto e o que faria diferente com mais tempo.
3. **`AI_USAGE.md`** — quais ferramentas de IA usou e como, exemplos de prompts ou fluxos que funcionaram, e o que a IA gerou que você rejeitou ou corrigiu, e por quê. Não é pegadinha: usar IA bem conta a favor.
4. **Testes** dos fluxos que você considera críticos. Cobertura total não é exigida — a escolha do que testar também é avaliada.

## Prazo e formato de entrega

- **Prazo:** 7 dias corridos a partir do recebimento.
- Após finalizar, envie por e-mail ao recrutador:
  - o link do repositório (**público**);
  - a data e o horário de entrega;
  - o acesso ao projeto (GitHub, Bitbucket ou similar).
- Em seguida agendaremos a apresentação da sua solução, com duração de até 1h, com os avaliadores, e conversaremos sobre as decisões que você tomou. Conheça bem a solução entregue e as decisões tomadas, inclusive com o uso de IA.

## Dúvidas

Qualquer dúvida sobre o enunciado, entre em contato com o time de Atração!
