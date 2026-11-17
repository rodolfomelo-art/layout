// Teste funcional do protótipo: abre o HTML gerado por `npm run build:preview` num navegador real.
// Primeira vez: `npx playwright install chromium`.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const URL_BASE = pathToFileURL(resolve('dist-preview/prototipo.html')).href;
const TELAS = { dashboard: 'Dashboard', vendas: 'Vendas e conversão', estoque: 'Estoque', catalogo: 'Catálogo',
  margem: 'Margem e conciliação', ads: 'Publicidade', reputacao: 'Reputação', alertas: 'Alertas', canais: 'Canais conectados' };
let browser, ctx, page, erros = [];
const titulo = () => page.locator('.cab-pag h1').textContent();
const abrir = async rota => { await page.goto(`${URL_BASE}#${rota}`); await page.reload(); };

before(async () => {
  browser = await chromium.launch();
  ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  page = await ctx.newPage();
  page.on('pageerror', e => erros.push(e.message));
});
after(async () => { await browser?.close(); });

test('landing leva ao cadastro e ao login', async () => {
  await abrir('inicio');
  await page.click('.site-topo >> text=Começar agora');
  assert.equal(await page.locator('.auth-dir h1').textContent(), 'Comece agora');
  await abrir('inicio');
  await page.click('text=Já sou cliente');
  assert.equal(await page.locator('.auth-dir h1').textContent(), 'Entrar');
});

test('cadastro valida dados, exige senha forte e termos', async () => {
  await abrir('cadastro');
  await page.click('text=Continuar');
  assert.ok(await page.locator('.erro').count() >= 3, 'mostra erros nos campos obrigatórios');
  await page.fill('#nome', 'Teste da Silva'); await page.fill('#email', 'teste@loja.com.br');
  await page.fill('#empresa', 'Loja Teste'); await page.fill('#cnpj', '12345678000199');
  assert.equal(await page.inputValue('#cnpj'), '12.345.678/0001-99');
  await page.click('text=Continuar');
  await page.fill('#senha', 'abc'); await page.fill('#senha2', 'abc');
  assert.ok(await page.locator('button:has-text("Criar conta")').isDisabled(), 'senha fraca bloqueia');
  await page.fill('#senha', 'abc12345'); await page.fill('#senha2', 'abc12345');
  assert.ok(await page.locator('button:has-text("Criar conta")').isDisabled(), 'sem termos bloqueia');
  await page.check('text=Li e aceito'); await page.check('text=Declaro ter');
  await page.click('button:has-text("Criar conta")');
  assert.equal(await page.locator('.conectar h1').textContent(), 'Conecte seus canais');
});

test('sem canal conectado o dashboard mostra estado vazio; ao conectar, mostra dados', async () => {
  await page.click('text=Pular por enquanto');
  assert.equal(await page.locator('.vazio h3').textContent(), 'Nenhum canal conectado ainda');
  await page.click('.vazio >> text=Conectar canais');
  await page.click('text=Conectar Mercado Livre');
  await page.waitForSelector('.conector .ok');
  await page.click('.nav a:has-text("Dashboard")');
  assert.notEqual(await page.locator('.kpi .val').first().textContent(), '—');
  assert.equal(await page.locator('.seg[aria-label="Canal"] button').count(), 2, 'filtro mostra só Todos + ML');
});

test('cada rota do app abre a tela certa sem erro de JavaScript', async () => {
  await abrir('entrar'); await page.click('button:has-text("Entrar")');
  for (const [id, t] of Object.entries(TELAS)) { await abrir(id); assert.equal(await titulo(), t, id); }
  assert.deepEqual(erros, []);
});

test('menu lateral navega e atualiza o endereço', async () => {
  await abrir('dashboard');
  await page.click('.nav a:has-text("Estoque")');
  assert.equal(await titulo(), 'Estoque');
  assert.ok(page.url().endsWith('#estoque'));
});

test('filtro de canal e de período mudam o GMV', async () => {
  await abrir('dashboard');
  const gmv = () => page.locator('.kpi .val').first().textContent();
  const todos = await gmv();
  await page.click('.seg button:has-text("Amazon")'); const amz = await gmv();
  await page.click('.seg button:has-text("7 dias")'); const amz7 = await gmv();
  assert.notEqual(todos, amz); assert.notEqual(amz, amz7);
});

test('busca encontra SKU e abre o detalhe; Esc fecha', async () => {
  await abrir('dashboard');
  await page.fill('#busca', 'panela de pressão');
  await page.click('.resultados button >> nth=0');
  assert.equal(await page.locator('.gaveta #gav-t').textContent(), 'Panela de pressão 4,5 L');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.gaveta').count(), 0);
});

test('clicar em um SKU na tabela de margem abre o detalhe', async () => {
  await abrir('margem');
  await page.click('tbody tr.clic >> nth=0');
  assert.equal(await page.locator('.gaveta').count(), 1);
});

test('alerta leva para a tela de origem', async () => {
  await abrir('alertas');
  await page.click('.alertas li >> nth=0 >> a');
  assert.notEqual(await titulo(), TELAS.alertas);
});

test('botão flutuante abre o Pergunte ao BI e responde', async () => {
  await abrir('dashboard');
  await page.click('.fab');
  await page.click('.chip:has-text("Quais campanhas dão prejuízo?")');
  assert.match(await page.locator('.msg.bi').last().textContent(), /campanhas/);
});
