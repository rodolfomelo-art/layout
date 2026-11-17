// Verifica que os dados fictícios respeitam as definições de docs/02-kpis.md.
import test from 'node:test';
import assert from 'node:assert/strict';
import { margemPorSku, resumo, estoque } from '../src/data/mock.js';

test('margem = receita − comissão − frete − impostos − Ads − custo, em toda linha', () => {
  for (const l of margemPorSku('todos', 30)) {
    const calc = l.receita - l.comissao - l.frete - l.imposto - l.ads - l.custo;
    assert.ok(Math.abs(calc - l.margem) < 0.01, `${l.sku}/${l.canal}`);
  }
});

test('GMV de "todos" é a soma dos canais', () => {
  const soma = ['ml', 'amz', 'shp'].reduce((a, c) => a + resumo(c, 30).gmv, 0);
  assert.ok(Math.abs(soma - resumo('todos', 30).gmv) < 0.01);
});

test('cobertura de estoque = estoque ÷ venda diária', () => {
  for (const e of estoque('todos').filter(x => x.vendaDia > 0)) assert.ok(Math.abs(e.cobertura - e.estoque / e.vendaDia) < 1e-9);
});
