// Dados FICTÍCIOS para o protótipo. Na F5 isto é substituído pela API (/kpis, /margem/sku, ...).
export const CANAIS = [
  { id: 'ml', nome: 'Mercado Livre' },
  { id: 'amz', nome: 'Amazon' },
  { id: 'shp', nome: 'Shopee' },
];
export const nomeCanal = id => CANAIS.find(c => c.id === id)?.nome ?? id;

// Taxas ilustrativas, não são tarifas reais.
const TAXAS = {
  ml: { comissao: 0.14, frete: 0.09, ads: 0.06 },
  amz: { comissao: 0.13, frete: 0.11, ads: 0.09 },
  shp: { comissao: 0.20, frete: 0.05, ads: 0.05 },
};
const IMPOSTO = 0.08;

function rng(seed) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

const PRODUTOS = [
  ['GT-001', 'Garrafa térmica 1 L', 89.9, 31], ['GT-002', 'Garrafa térmica 500 ml', 64.9, 22],
  ['CF-010', 'Cafeteira italiana 6 xícaras', 129.9, 52], ['CF-011', 'Moedor de café manual', 149.9, 71],
  ['UT-020', 'Jogo de facas 5 peças', 119.9, 49], ['UT-021', 'Tábua de bambu grande', 59.9, 23],
  ['UT-022', 'Kit utensílios silicone', 79.9, 30], ['PN-030', 'Panela de pressão 4,5 L', 219.9, 118],
  ['PN-031', 'Frigideira antiaderente 28 cm', 139.9, 64], ['PN-032', 'Jogo de panelas 5 peças', 459.9, 262],
  ['OR-040', 'Pote hermético kit 10', 99.9, 38], ['OR-041', 'Porta-temperos giratório', 69.9, 31],
  ['OR-042', 'Organizador de gaveta', 49.9, 19], ['EL-050', 'Mixer de mão 400 W', 189.9, 108],
  ['EL-051', 'Balança de cozinha digital', 54.9, 21], ['EL-052', 'Chaleira elétrica 1,7 L', 159.9, 86],
  ['TX-060', 'Avental de lona', 44.9, 14], ['TX-061', 'Kit panos de prato 6', 39.9, 13],
  ['MS-070', 'Jogo americano 4 peças', 74.9, 34], ['MS-071', 'Conjunto taças 6', 169.9, 99],
];

const r0 = rng(42);
export const SKUS = PRODUTOS.map(([sku, nome, preco, custo], i) => {
  const peso = Math.pow(0.86, i) * (0.7 + r0() * 0.6);
  const canais = {
    ml: 1, amz: r0() > 0.25 ? 0.55 + r0() * 0.5 : 0, shp: r0() > 0.2 ? 0.6 + r0() * 0.6 : 0,
  };
  const giro = 4 + r0() * 70; // dias de estoque na criação
  return { sku, nome, preco, custo, peso, canais, giro };
});

const DIAS_BASE = 18; // unidades/dia do SKU líder no ML

function unidadesDia(s, canal, dia, seed) {
  const r = rng(seed + dia * 7 + s.sku.charCodeAt(4) * 13 + canal.length * 101);
  const sazonal = 1 + 0.18 * Math.sin(dia / 3.2) + (dia % 7 >= 5 ? 0.12 : 0);
  return Math.max(0, DIAS_BASE * s.peso * s.canais[canal] * sazonal * (0.75 + r() * 0.5));
}

// Canais conectados pelo usuário (protótipo). 'todos' significa todos os conectados.
let ATIVOS = ['ml', 'amz', 'shp'];
export function setCanaisAtivos(ids) { ATIVOS = [...ids]; }
export function canaisAtivos() { return ATIVOS; }
export function filtrarCanais(canal) { return canal === 'todos' ? ATIVOS : [canal]; }

function linhaSku(s, canal, dias, seed) {
  let un = 0; for (let d = 0; d < dias; d++) un += unidadesDia(s, canal, d, seed);
  un = Math.round(un);
  const t = TAXAS[canal];
  const receita = un * s.preco;
  const comissao = receita * t.comissao, frete = receita * t.frete, imposto = receita * IMPOSTO;
  const ads = receita * t.ads * (0.6 + (s.peso % 0.3) * 3);
  const custo = un * s.custo;
  const margem = receita - comissao - frete - imposto - ads - custo;
  return { sku: s.sku, nome: s.nome, canal, unidades: un, receita, comissao, frete, imposto, ads, custo, margem };
}

export function margemPorSku(canal, dias, seed = 1) {
  const linhas = [];
  for (const s of SKUS) for (const c of filtrarCanais(canal)) if (s.canais[c] > 0) linhas.push(linhaSku(s, c, dias, seed));
  return linhas;
}

export function resumo(canal, dias) {
  const soma = (ls) => ls.reduce((a, l) => {
    for (const k of ['unidades', 'receita', 'comissao', 'frete', 'imposto', 'ads', 'custo', 'margem']) a[k] = (a[k] || 0) + l[k];
    return a;
  }, {});
  const atual = soma(margemPorSku(canal, dias, 1));
  const ant = soma(margemPorSku(canal, dias, 9)); ant.receita *= 0.93; ant.margem *= 0.9;
  const pedidos = Math.round(atual.unidades / 1.18), pedidosAnt = Math.round(ant.unidades / 1.16);
  return {
    gmv: atual.receita, gmvAnt: ant.receita, pedidos, pedidosAnt,
    ticket: atual.receita / pedidos, ticketAnt: ant.receita / pedidosAnt,
    margem: atual.margem, margemAnt: ant.margem,
    margemPct: atual.margem / atual.receita, margemPctAnt: ant.margem / ant.receita,
    ads: atual.ads, tacos: atual.ads / atual.receita,
    cascata: atual,
  };
}

export function serieDiaria(canal, dias) {
  const porCanal = {};
  for (const c of filtrarCanais(canal)) {
    porCanal[c] = Array.from({ length: dias }, (_, d) => SKUS.reduce((a, s) => a + (s.canais[c] ? unidadesDia(s, c, d, 1) * s.preco : 0), 0));
  }
  const total = Array.from({ length: dias }, (_, d) => Object.values(porCanal).reduce((a, v) => a + v[d], 0));
  const anterior = Array.from({ length: dias }, (_, d) =>
    filtrarCanais(canal).reduce((a, c) => a + SKUS.reduce((b, s) => b + (s.canais[c] ? unidadesDia(s, c, d, 9) * s.preco : 0), 0), 0) * 0.93);
  return { porCanal, total, anterior };
}

export function funil(canal, dias) {
  const ped = resumo(canal, dias).pedidos;
  const fator = { ml: 31, amz: 22, shp: 38 };
  const visitas = filtrarCanais(canal).reduce((a, c) => a + ped * fator[c] / filtrarCanais(canal).length, 0);
  return [
    { rot: 'Visitas', v: Math.round(visitas) },
    { rot: 'Pedidos', v: ped },
    { rot: 'Entregues sem devolução', v: Math.round(ped * 0.947) },
  ];
}

export function mapaCalor(canal) {
  const r = rng(canal.length * 17 + 3);
  return Array.from({ length: 7 }, (_, d) => Array.from({ length: 24 }, (_, h) =>
    Math.min(1, Math.exp(-Math.pow((h - 21) / 3.1, 2)) * 0.85 + Math.exp(-Math.pow((h - 12.5) / 2, 2)) * 0.42 + (d >= 5 ? 0.1 : 0) + r() * 0.08 + 0.03)));
}

export function anunciosBaixaConversao(canal) {
  const r = rng(77);
  return SKUS.slice(0, 14).flatMap(s => filtrarCanais(canal).filter(c => s.canais[c]).map(c => {
    const visitas = Math.round(800 + r() * 5200), conv = 0.4 + r() * 4.2;
    return { sku: s.sku, nome: s.nome, canal: c, visitas, conv, vendas: Math.round(visitas * conv / 100) };
  })).filter(a => a.conv < 1.6).sort((a, b) => b.visitas - a.visitas).slice(0, 8);
}

const PARADOS = ['TX-060', 'MS-070'];
SKUS.forEach(s => {
  const total = ['ml', 'amz', 'shp'].reduce((a, c) => a + DIAS_BASE * s.peso * s.canais[c], 0);
  s.estoque = Math.round(PARADOS.includes(s.sku) ? 60 + total * 40 : total * s.giro);
});
export function estoque(canal) {
  // Estoque é compartilhado entre canais: a cobertura usa a venda de todos os canais.
  return SKUS.filter(s => canal === 'todos' || s.canais[canal] > 0).map(s => {
    let vendaDia = ['ml', 'amz', 'shp'].reduce((a, c) => a + DIAS_BASE * s.peso * s.canais[c], 0);
    if (PARADOS.includes(s.sku)) vendaDia *= 0.004;
    const cobertura = vendaDia > 0 ? s.estoque / vendaDia : Infinity;
    const semVenda = PARADOS.includes(s.sku) ? 60 + (s.estoque % 40) : 0;
    return { sku: s.sku, nome: s.nome, estoque: s.estoque, vendaDia, cobertura, semVenda, capital: s.estoque * s.custo,
      local: s.sku.endsWith('1') ? 'Full / FBA' : 'Próprio' };
  });
}

export function campanhas(canal) {
  const r = rng(5);
  const nomes = ['Campeões', 'Lançamentos', 'Cozinha premium', 'Utilidades', 'Queima de estoque', 'Presentes', 'Eletroportáteis'];
  const out = [];
  for (const c of filtrarCanais(canal)) nomes.forEach((n, i) => {
    if (c === 'shp' && i > 4) return;
    const invest = 300 + r() * 2400, roas = 1.8 + r() * 9;
    const vendas = invest * roas, acos = 1 / roas;
    const margemAntesAds = 0.12 + r() * 0.22;
    out.push({ id: `${c}-${i}`, nome: n, canal: c, invest, vendas, roas, acos, cliques: Math.round(invest / (0.6 + r())),
      margemAntesAds, resultado: vendas * margemAntesAds - invest });
  });
  return out;
}

export const LIMITES_REP = {
  ml: [['Reclamações', 1.2, 2], ['Envio atrasado', 6.4, 10], ['Cancelamentos', 0.9, 2]],
  amz: [['Taxa de defeitos (ODR)', 0.6, 1], ['Envio atrasado', 2.8, 4], ['Cancelamento pré-envio', 1.1, 2.5]],
  shp: [['Pedidos não concluídos', 4.1, 10], ['Envio atrasado', 3.2, 10], ['Tempo de resposta (h)', 9, 12]],
};
export const NIVEL_REP = { ml: 'Verde (MercadoLíder Gold)', amz: 'Saúde da conta: boa', shp: 'Pontos de penalidade: 0' };

export function tendenciaRep(canal) {
  const r = rng(canal.length * 3 + 11);
  return Array.from({ length: 12 }, (_, i) => +(LIMITES_REP[canal][0][1] * (0.7 + i * 0.03 + r() * 0.2)).toFixed(2));
}

export function pendencias(canal) {
  const base = [
    ['CF-011', 'ml', 'Pausado por moderação', 'Foto com marca d’água', 'alta'],
    ['PN-032', 'amz', 'Inativo', 'Problema no atributo de tensão', 'alta'],
    ['EL-050', 'shp', 'Baixa qualidade', 'Descrição curta, sem vídeo', 'media'],
    ['GT-002', 'ml', 'Sem estoque', 'Estoque zerado há 2 dias', 'alta'],
    ['UT-022', 'shp', 'Preço acima da média', '18% acima da mediana do canal', 'media'],
    ['MS-071', 'ml', 'Baixa qualidade', 'Faltam atributos obrigatórios', 'media'],
    ['OR-042', 'amz', 'Supressão de Buy Box', 'Preço acima do de referência', 'media'],
    ['TX-061', 'ml', 'Sem venda há 60 dias', 'Revisar preço ou encerrar', 'baixa'],
  ];
  return base.filter(p => canal === 'todos' || p[1] === canal).map(([sku, c, tipo, motivo, sev]) => {
    const s = SKUS.find(x => x.sku === sku);
    return { sku, nome: s.nome, canal: c, tipo, motivo, sev, risco: s.preco * DIAS_BASE * s.peso * 30 };
  }).sort((a, b) => b.risco - a.risco);
}

export function repasses(canal) {
  const r = rng(21);
  return filtrarCanais(canal).flatMap(c => Array.from({ length: 4 }, (_, i) => {
    const previsto = 8000 + r() * 30000, diverg = i === 1 && c !== 'amz' ? -(120 + r() * 600) : 0;
    return { id: `${c.toUpperCase()}-${2026110 + i}`, canal: c, data: `${10 + i * 2}/11`, previsto, recebido: previsto + diverg, diverg };
  }));
}

export function alertas(canal) {
  const out = [];
  estoque(canal).filter(e => e.cobertura < 15).forEach(e => out.push({ sev: 'alta', titulo: `Ruptura em ${Math.floor(e.cobertura)} dias: ${e.nome}`, detalhe: `${e.estoque} un. em estoque, vendendo ${e.vendaDia.toFixed(1).replace('.', ',')} un./dia.`, tela: 'estoque' }));
  campanhas(canal).filter(c => c.acos > c.margemAntesAds).slice(0, 4).forEach(c => out.push({ sev: 'alta', titulo: `Campanha com prejuízo: ${c.nome} (${nomeCanal(c.canal)})`, detalhe: `ACOS ${(c.acos * 100).toFixed(0)}% acima do equilíbrio de ${(c.margemAntesAds * 100).toFixed(0)}%.`, tela: 'ads' }));
  pendencias(canal).filter(p => p.sev === 'alta').forEach(p => out.push({ sev: 'media', titulo: `${p.tipo}: ${p.nome}`, detalhe: `${nomeCanal(p.canal)}. ${p.motivo}.`, tela: 'catalogo' }));
  repasses(canal).filter(r => r.diverg < 0).forEach(r => out.push({ sev: 'media', titulo: `Repasse menor que o previsto (${r.id})`, detalhe: `Diferença de ${brl(-r.diverg)} em ${nomeCanal(r.canal)}.`, tela: 'margem' }));
  filtrarCanais(canal).forEach(c => { const [n, v, lim] = LIMITES_REP[c][1]; if (v / lim > 0.6) out.push({ sev: 'baixa', titulo: `${n} perto do limite em ${nomeCanal(c)}`, detalhe: `${v.toString().replace('.', ',')}% de ${lim}% permitido.`, tela: 'reputacao' }); });
  return out;
}

export const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export const brl2 = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const num = v => Math.round(v).toLocaleString('pt-BR');
export const pct = (v, d = 1) => (v * 100).toFixed(d).replace('.', ',') + '%';
export const varPct = (a, b) => (a - b) / Math.abs(b);
