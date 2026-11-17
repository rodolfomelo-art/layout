# apps/web: protótipo navegável do BI

Tempt BI, no padrão visual da Tempt Tecnologia: landing (`#inicio`), cadastro em 2 etapas (`#cadastro`), login (`#entrar`), conexão de canais (`#conectar`) e o app: Dashboard, Vendas, Estoque, Catálogo, Margem, Publicidade, Reputação, Alertas, Canais, com Pergunte ao BI no botão flutuante.
Nome e assinatura do produto ficam em `src/brand.js`.
Todos os dados são fictícios (`src/data/mock.js`).

```powershell
cd apps\web
npm install
npx playwright install chromium   # só na primeira vez
npm run dev                        # http://localhost:5173
npm test                           # gera dist-preview/prototipo.html e roda 13 testes
```

`dist-preview/prototipo.html` abre direto no navegador (duplo clique), bom para mandar para quem vai avaliar.

Estrutura:

```
src/
├─ brand.js                 nome do produto e empresa
├─ main.jsx, App.jsx        rotas, shell do app, busca, gaveta de SKU, chat
├─ site/                    Landing, Cadastro/Entrar, Conectar canais
├─ styles.css               tokens de cor (claro/escuro) e layout
├─ data/mock.js             dados fictícios no formato da futura API
├─ components/ui.jsx        Card, Kpis, Secao, Vazio, Tabela ordenável, Status, CanalTag
├─ components/icons.jsx     ícones de traço inline
├─ components/Marca.jsx     logotipo
├─ components/charts.jsx    Linha, Barras empilhadas, Cascata, Funil, Mapa de calor, Dispersão, Cobertura
└─ screens/                 uma tela por arquivo
tests/                      metricas.test.mjs e navegacao.test.mjs (node --test + Playwright)
```
