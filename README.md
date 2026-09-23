# GitHub Stats Vite

Dashboard em **Vite + React + Tailwind CSS v4** para exibir estatísticas públicas do GitHub sem depender de serviços de cards externos.

## Stack

- Vite
- React 18
- Tailwind CSS 4
- Recharts
- Lucide React
- GitHub REST + GraphQL API

## Executar

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite.

## Configuração

Copie `.env.example` para `.env` e configure um token do GitHub:

```env
VITE_GITHUB_USERNAME=dev-emartins
VITE_GITHUB_CACHE_MINUTES=30
GITHUB_USERNAME=dev-emartins
GITHUB_TOKEN=github_pat_seu_token
GITHUB_CACHE_MINUTES=30
```

Use um Fine-grained Personal Access Token com acesso aos repositórios desejados e permissões `Metadata: Read-only` e `Contents: Read-only`. Para organizações privadas, conceda também o acesso necessário à organização.

O token é usado somente pelo backend em `server/githubServer.js`. Nunca use `VITE_GITHUB_TOKEN`, pois variáveis `VITE_*` ficam expostas no navegador.

## Observação importante

O projeto não utiliza `github-readme-stats`, `github-profile-summary-cards` ou outro serviço de geração de imagem/card.

Os dados são obtidos pelo backend autenticado e armazenados em cache no navegador.

Isso elimina o limite de visualizações imposto por serviços de cards externos, mas **a API pública do GitHub continua possuindo rate limit**.

### Arquitetura

A arquitetura recomendada é:

```text
React + Vite
    ↓
GET /api/github/stats
    ↓
Backend Node autenticado
    ↓
GitHub REST + GraphQL API
```

## Deploy na Vercel

O projeto já está preparado para deploy na Vercel:

- O frontend é construído com `vite build` (detectado automaticamente pela Vercel).
- O endpoint `GET /api/github/stats` é servido por uma Serverless Function em `api/github/stats.js`, que reutiliza a lógica de `api/_lib/github.js`.
- `server/githubServer.js` continua existindo apenas para desenvolvimento local (`npm run dev`) e não é usado em produção na Vercel.

Passos:

1. Importe o repositório na Vercel.
2. Em **Project Settings → Environment Variables**, configure `GITHUB_TOKEN` (e opcionalmente `GITHUB_CACHE_MINUTES`, `VITE_GITHUB_USERNAME`, `VITE_GITHUB_CACHE_MINUTES`).
3. Faça o deploy — build command `vite build` e output directory `dist` são detectados automaticamente.

## Dados privados

Os repositórios são obtidos por `/user/repos?visibility=all` e o gráfico de contribuições usa `viewer.contributionsCollection` da GraphQL API, incluindo contribuições privadas permitidas pelo token e pelas configurações de privacidade do GitHub. O gráfico de commits por hora é calculado a partir do histórico dos repositórios aos quais o token tem acesso.

## Estrutura

```text
github-stats-vite/
├── src/
│   ├── services/
│   │   └── githubService.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
└── server/
    └── githubServer.js
```
