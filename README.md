# GitHub Stats Vite

Dashboard em **Vite + React + Tailwind CSS v4** para exibir estatísticas públicas do GitHub sem depender de serviços de cards externos.

## Stack

- Vite
- React 18
- Tailwind CSS 4
- Recharts
- Lucide React
- GitHub REST API

## Executar

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite.

## Configuração

Copie `.env.example` para `.env`:

```env
VITE_GITHUB_USERNAME=dev-emartins
VITE_GITHUB_CACHE_MINUTES=30
```

## Observação importante

O projeto não utiliza `github-readme-stats`, `github-profile-summary-cards` ou outro serviço de geração de imagem/card.

Os dados são obtidos diretamente da API pública do GitHub e armazenados em cache no navegador.

Isso elimina o limite de visualizações imposto por serviços de cards externos, mas **a API pública do GitHub continua possuindo rate limit**.

### Para produção

A arquitetura recomendada é:

```text
GitHub API
    ↓
Backend / Cache
    ↓
GET /api/github/*
    ↓
React + Vite
```

Assim, o navegador não precisa chamar o GitHub a cada visualização.

## Limitação dos dados públicos

A API REST pública não fornece diretamente toda a informação exibida no gráfico de contribuições privado do perfil.

O projeto atual usa uma aproximação baseada em atividade pública dos repositórios.

Para reproduzir o gráfico de contribuições do GitHub com maior fidelidade, utilize GitHub GraphQL API através de um backend.

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
```
