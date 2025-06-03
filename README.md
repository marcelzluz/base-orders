# 🧾 Base Orders

**Simulador de Negociação de Ordens com Next.js e TypeScript**

Este repositório contém um **simulador de execução de ordens** inspirado em um ambiente de bolsa de valores, construído com **Next.js**, **TypeScript** e **Material UI**. As ordens são armazenadas em memória (via MSW + `localStorage`), permitindo criar, editar, cancelar e visualizar detalhes de cada ordem, além de simular o matching com base em preço e quantidade.

---

## 📑 Sumário

1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Funcionalidades](#-funcionalidades)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Links](#links)
5. [Requerimentos](#requerimentos)
6. [Iniciar](#-iniciar)
7. [Organização de Arquivos](#-organização-de-arquivos)
8. [Limitações e Próximos Passos](#-limitações-e-próximos-passos)
9. [Reflexões e Aprendizados](#-reflexões-e-aprendizados)
10. [Autor](#-autor)

---

## 📖 Sobre o Projeto

**Base Orders** é um simulador de book de ordens para ambiente de bolsa.

- **Stack:** Next.js 15, TypeScript, Material-UI, Tailwind CSS (utilitários).
- **Persistência:** MSW + localStorage (mock da API `/api/orders`).
- **Funcionalidade Principal:** criar, editar, cancelar e visualizar ordens; simular matching de preços e quantidades em memória.

---

## 📈 Funcionalidades

### 1. Listagem de Ordens

- Tabela com MUI DataGrid exibindo:  
  • ID, Símbolo, Lado (buy/sell), Quantidade Total, Quantidade Pendente, Preço Unitário, Status (Aberta/Parcial/Executada/Cancelada), Data/Hora de Criação e Ações (Ver Detalhes, Editar, Cancelar).

### 2. Criação de Nova Ordem

- Modal com formulário (React Hook Form + Zod):  
  • Campos: Símbolo, Lado, Quantidade (≤10.000), Preço (até 2 casas decimais).  
  • Modal de confirmação antes de submeter.  
  • Dados salvos em memória (MSW + localStorage).

### 3. Edição de Ordem

- Modal de edição permite alterar quantidade e preço, com validações:  
  • Quantidade mínima = Quantidade Pendente.  
  • Preço ≥ 0 e máximo 2 casas decimais.  
  • Persistência via MSW + localStorage ao confirmar.

### 4. Cancelamento de Ordem

- Disponível apenas para ordens “Aberta” ou “Parcial”.
- Modal de confirmação antes de cancelar.
- Ao cancelar, status vira “Cancelada” e `pendingQuantity=0`.

### 5. Detalhes da Ordem

- Modal que exibe:  
  • Dados principais (ID, Símbolo, Lado, Quantidade, Preço, Data de Criação).  
  • Histórico de transações em tabela (ID transação, contraparte, quantidade, preço e data).

### 6. Lógica de Execução (Matching Engine)

- Encontra contraparte seguindo price-time priority:  
  • Ordens de compra casam com ordens de venda cujo preço ≤ preço de compra (e vice-versa).  
  • Quantidade executada = min(pendingQuantity da contraparte, remainingQuantity da nova ordem).  
  • Atualiza estado (`pendingQuantity`, `status`) e cria registro de transação em `order.transactions`.

### 7. Filtros de Busca (Planejado — não implementado nesta versão)

- Planejamento para filtrar por: ID, Símbolo, Status, Data de Criação (de/até), Lado (buy/sell).
- Observação: como a versão gratuita do DataGrid não suporta filtros nativos, a lógica seria manual, aplicando filtros no estado global e re-renderizando a lista.

8. **Persistência com Mock Service Worker (MSW) + localStorage**
    - No ambiente de desenvolvimento, o MSW intercepta todas as requisições a `/api/orders` (GET, POST, PUT, DELETE).
    - Os dados são lidos/escritos em `localStorage` para simular um backend simples.
    - Em produção (build), o MSW não é executado e **deve** existir um backend real ou as rotas devem abrir error 404.

---

## 🛠 Tecnologias Utilizadas

**Front-end:**

- Next.js
- React 19
- TypeScript

**UI / Estilização:**

- Material-UI (MUI)
- Tailwind CSS (apenas para classes utilitárias pontuais)

**State Management & Validação:**

- Zustand (gerenciamento de estado global)
- React Hook Form + Zod (validação de formulários)

**Mock & Testes:**

- MSW (Mock Service Worker) para simular API em `/api/orders`
- Jest + Testing Library (configurado, mas testes não finalizados)

**Utilitários e Build:**

- Prettier, ESLint (configurações de linting e formatação)
- Husky + lint-staged (hooks de commit)
- TailwindCSS, PostCSS, Autoprefixer

---

## Links

| Ambiente   | URL                    |
| ---------- | ---------------------- |
| Local      | http://localhost:3000  |
| Produção\* | Em breve/Não aplicável |

\* Em produção, será necessário ter um backend real para as rotas `/api/orders`.

---

## Requerimentos

Antes de iniciar 🏁, você precisa ter instalado:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/) (v16 ou superior)

---

## 🏁 Iniciar

```bash
# Clone este projeto
$ git clone https://github.com/SEU-USERNAME/base-orders.git

# Acesse a pasta do projeto
$ cd base-orders

# Instale as dependências
$ yarn install

# Execute em modo desenvolvimento
$ yarn dev

# O servidor será iniciado em http://localhost:3000
```

## Para build e produção (se houver backend real)

```bash

$ yarn build

$ yarn start
```

## Script úteis

```bash
# Verifica lint (ESLint)
$ yarn lint

# Formata todo o código (Preetier)
$ yarn format

# Executa Jest (apenas configurações; testes pendentes)
$ yarn test
```

---

## 📂 Organização de Arquivos

```plaintext
src/
├── app/
│ ├── favicon.ico
│ ├── globals.css
│ ├── layout.tsx
│ └── page.tsx
├── components/
│ ├── ClientSideMSWProvider.tsx
│ ├── ClientThemeProvider.tsx
│ ├── ConfirmationModal.tsx
│ ├── MswInitializer.tsx
│ ├── OrderDetailsModal.tsx
│ ├── OrderEditForm.tsx
│ ├── OrderForm.tsx
│ ├── OrderTable.tsx
│ └── Toast.tsx
├── mocks/
│ ├── browser.ts
│ ├── handlers.ts
│ ├── orders.ts
│ ├── server.ts
│ └── symbols.ts
├── modules/
│ ├── orderUtils.ts
│ └── tests/
│ └── orderUtils.test.ts
├── services/
│ └── orderService.ts
├── store/
│ └── orderStore.ts
├── styles/
│ └── theme.ts
├── types/
│ ├── editOrderSchema.ts
│ ├── order.ts
│ ├── orderForm.ts
│ └── orderFormSchema.ts
└── utils/
└── formatters/
├── formatDate.ts
└── formatMoney.ts
```

---

## 🛑 Limitações e Próximos Passos

**O que ficou pendente nesta versão:**

1. **Testes Automatizados (Jest + MSW)**

    - Dependências e configuração de Jest já estão em `package.json`.
    - A integração com MSW (emular `server.ts` durante os testes) apresentou dificuldades de escopo de import.
    - Pretendo concluir a bateria de testes para `orderUtils.ts` e principais componentes em uma futura versão (v2).

2. **Filtros de Busca Avançados**

    - Embora a interface para filtros (lado, data, símbolo, status) esteja planejada, não implementamos a filtragem no estado (DataGrid gratuito não possui esse recurso out-of-the-box).
    - Nos próximos passos, a ideia é construir um `FilterManager` que aplique condições no estado global, permitindo pesquisas compostas.

3. **Ambiente de Produção / Backend Real**
    - Atualmente, o MSW só roda em modo de desenvolvimento. Para produção, é necessário um backend em Node.js/Express ou similar.
    - Em uma próxima iteração, o objetivo é criar um endpoint real em (por exemplo) Supabase ou Firebase, removendo a dependência de `localStorage`.

**Roadmap (v2+):**

- [ ] Finalizar cobertura de testes unitários e de integração com MSW.
- [ ] Implementar filtro de busca manual no estado (por exemplo, usando perguntas combinadas: `status = “open” AND createdAt >= “2025-05-01”`).
- [ ] Disponibilizar backend mínimo (endpoint REST) e remover MSW em produção.
- [ ] Aprimorar UI: adicionar paginação servidor-side e histórico de transações real.
- [ ] Documentar fluxos no Storybook (componentes isolados).

---

## 🎓 Reflexões e Aprendizados

- **Material-UI (MUI)**

    - O DataGrid facilitou muito a visualização tabular, mas a versão gratuita não tem filtros nativos nem export. Foi um trade-off entre produtividade e customização.
    - Customizar tema (cores neon, lilás, dark mode) mostrou flexibilidade para adaptar ao design do cliente.

- **Zustand**

    - Experiência positiva: leveza no gerenciamento de estado global, ideal para armazenar o “book” de ordens sem boilerplate.
    - Aprendizado: entender mutações imutáveis e persistência (usamos localStorage via MSW).

- **React Hook Form + Zod**

    - Validação declarativa facilitou feedback imediato ao usuário. Aprendi a combinar `resolver` com `schema` do Zod para mensagens de erro customizadas.

- **Mock Service Worker (MSW)**

    - Fundamental para simular um backend em Next.js sem criar APIs focais.
    - Desafio: integrar MSW + Jest no mesmo escopo de testes, especialmente ao importar `server.ts` corretamente.

- **Workflow de Desenvolvimento**

    - Configurar Husky + lint-staged deixou commits mais consistentes (Prettier + ESLint rodando em cada commit).
    - Time-to-market rápido ao usar Next.js 15, aproveitando turbopack para builds mais ágeis.

- **Algoritmo de Matching (Engine)**

    - Implementar price-time priority me ajudou a reforçar conceitos de mercado financeiro.
    - Escrever testes (planejados) para validar cenários de vários matchings será um exercício importante nas próximas versões.

- Benefícios deste teste

    - Consolidou meu entendimento de arquiteturas cliente-side-first (com MSW), state management leve (Zustand), e validação declarativa (Zod).

    - Me desafiou a pensar na prioridade de preço (“preço agressivo”) e implementar corretamente o algoritmo de matching, aderindo a conceitos de - bolsa de valores (price-time priority).

    - Reforçou boas práticas de repositório: README bem estruturado, modularização em pastas, convenções de commits (via Husky + lint-staged), e preparação para testes.

Agradeço novamente pela chance de desenvolver este simulador, pois foi uma excelente oportunidade de aprender e aplicar ferramentas atuais de front-end.
Espero que o resultado demonstre tanto minhas habilidades técnicas quanto meu cuidado em escrever código legível, testável e escalável.

## 🤝 Autor

<table>
  <tr>
    <td align="center">
      <a href="#">
        <img src="https://avatars.githubusercontent.com/u/128410441?s=96&v=4" width="100px;" alt="Photo do Marcel"/><br>
        <sub>
          <b>Marcel Zulian </b>
        </sub>
      </a>
    </td>
  </tr>
</table>
