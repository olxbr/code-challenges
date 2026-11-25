# Desafio Técnico — Frontend Web

## Objetivo

Construa a interface web de um **marketplace de anúncios**, onde pessoas podem publicar anúncios e consultar os já publicados.

O enunciado descreve o que a aplicação precisa resolver, mas não existe uma única resposta esperada. Você tem liberdade para usar a criatividade e tomar decisões de experiência, arquitetura e engenharia que façam sentido para a sua solução, desde que bem embasadas e explicadas.

### 1. Listar anúncios

Permita que a pessoa usuária explore os anúncios fornecidos pela API, combinando as seguintes funcionalidades:

A listagem deve oferecer:

- paginação;
- filtro por categoria;
- busca textual por título e descrição.

Você decide como esses controles interagem, como os resultados são exibidos e como a navegação se comporta ao longo do uso.

### 2. Criar anúncio

Permita a publicação de um novo anúncio respeitando os campos e regras definidos no contrato da API.

A pessoa usuária deve entender o resultado da operação e conseguir encontrar o anúncio publicado na listagem. Fica a seu critério como conduzir esse fluxo, do preenchimento à exibição na listagem.

### 3. Experiência de uso

Pense na aplicação como um produto real:

- ela será utilizada por diferentes públicos, em diferentes dispositivos e contextos de uso — busque torná-la fácil de encontrar e utilizar por qualquer pessoa;
- a API apresenta variações reais de resposta e disponibilidade; decida como a interface deve reagir a esses momentos e orientar quem está usando.

## Referência visual

O [`handoff.png`](./handoff.png) traz uma proposta de interface como ponto de partida.

Ele não é uma especificação fechada nem um checklist: layout, componentes, estados e interações ali representados são apenas exemplos. Você pode seguir a proposta, adaptá-la ou propor outro caminho — o importante é resolver o problema com coerência e saber justificar suas escolhas.

[![Referência visual do desafio: listagem desktop e mobile, formulário de criação e estados da interface](./handoff.png)](./handoff.png)

## A API

Você vai consumir uma API local que fornecemos, na pasta [`api-mock`](../api-mock). **Comece pelo [guia para rodá-la](../api-mock/README.md)** e leia a [documentação](../api-mock/API.md), em especial a seção de comportamento operacional.

Trate a API como um serviço externo que você não controla. Não altere o código dela.

## Tecnologias

A escolha de linguagem, framework, bibliotecas, ferramentas e arquitetura é totalmente livre. O único requisito técnico é que a aplicação funcione em um navegador.

## O que entregar

Siga as diretrizes gerais do [README principal](../../README.md) — código funcional, `DECISIONS.md`, `AI_USAGE.md` e testes dos fluxos que considerar críticos.

Quanto à forma de estruturar e disponibilizar a aplicação para avaliação, entregue o projeto da maneira com que se sentir mais à vontade — desde que quem for avaliar consiga entender e acessar ou executar a sua entrega sem dificuldade.

A aplicação deve consumir a API por requisições HTTP, lidando com os problemas que ela apresenta sem corrigi-los nem contorná-los no mock. Use sua experiência para tratar esses comportamentos no front; existem várias formas, cada uma com seus tradeoffs, e queremos entender a sua escolha. Não use os dados do mock diretamente no código da aplicação. O endereço da API deve ser configurável, porque vamos executar sua entrega contra a nossa instância do mock. Publicar a aplicação é livre e faz parte da avaliação, da forma que preferir.
