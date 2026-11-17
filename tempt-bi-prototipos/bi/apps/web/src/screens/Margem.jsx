import { useState } from 'react';
import { margemPorSku, resumo, repasses, brl, brl2, pct } from '../data/mock.js';
import { Card, Kpis, Tabela, CanalTag, Status } from '../components/ui.jsx';
import { Waterfall } from '../components/charts.jsx';

export default function Margem({ canal, dias, abrirSku }) {
  const [soNeg, setSoNeg] = useState(false);
  const r = resumo(canal, dias), c = r.cascata;
  const linhas = margemPorSku(canal, dias).map(l => ({ ...l, key: l.sku + l.canal, mpct: l.margem / l.receita })).filter(l => !soNeg || l.margem < 0);
  const rep = repasses(canal), div = rep.filter(x => x.diverg < 0);
  return (<>
    <Kpis itens={[
      { rot: 'Receita', val: brl(c.receita) },
      { rot: 'Comissão efetiva', val: pct(c.comissao / c.receita) },
      { rot: 'Frete do vendedor', val: pct(c.frete / c.receita) },
      { rot: 'Margem de contribuição', val: brl(c.margem), var: (r.margem - r.margemAnt) / Math.abs(r.margemAnt) },
      { rot: 'Repasses divergentes', val: String(div.length), nota: div.length ? brl(div.reduce((a, x) => a - x.diverg, 0)) + ' a menos' : 'tudo conferido' },
    ]} />
    <div className="grade g2">
      <Card titulo="Cascata de margem" sub="Do valor vendido ao que sobra">
        <Waterfall etapas={[['Venda', c.receita], ['Comissão', c.comissao], ['Frete', c.frete], ['Impostos', c.imposto], ['Publicidade', c.ads], ['Custo do produto', c.custo]]} />
      </Card>
      <Card titulo="Conciliação de repasses" sub="Previsto pelos pedidos contra o recebido">
        <Tabela colunas={[
          { id: 'id', rot: 'Repasse' }, { id: 'canal', rot: 'Canal', render: l => <CanalTag id={l.canal} /> },
          { id: 'data', rot: 'Data' }, { id: 'previsto', rot: 'Previsto', n: true, render: l => brl2(l.previsto) },
          { id: 'recebido', rot: 'Recebido', n: true, render: l => brl2(l.recebido) },
          { id: 'diverg', rot: 'Situação', render: l => l.diverg < 0 ? <Status tipo="alerta">{brl2(l.diverg)}</Status> : <Status tipo="ok">Conferido</Status> },
        ]} linhas={rep.map(x => ({ ...x, key: x.id }))} />
      </Card>
    </div>
    <Card titulo="Margem por SKU e canal" sub="Clique em uma linha para abrir a composição do SKU"
      extra={<label className="small"><input type="checkbox" checked={soNeg} onChange={e => setSoNeg(e.target.checked)} /> Só margem negativa</label>}>
      <Tabela onLinha={l => abrirSku(l.sku)} ordemInicial={{ col: 'margem', dir: 'asc' }} vazio="Nenhum SKU com margem negativa neste filtro." colunas={[
        { id: 'nome', rot: 'Produto', render: l => <><strong>{l.nome}</strong> <span className="muted small">{l.sku}</span></> },
        { id: 'canal', rot: 'Canal', render: l => <CanalTag id={l.canal} /> },
        { id: 'unidades', rot: 'Un.', n: true },
        { id: 'receita', rot: 'Receita', n: true, render: l => brl(l.receita) },
        { id: 'comissao', rot: 'Comissão', n: true, render: l => brl(l.comissao) },
        { id: 'frete', rot: 'Frete', n: true, render: l => brl(l.frete) },
        { id: 'ads', rot: 'Ads', n: true, render: l => brl(l.ads) },
        { id: 'custo', rot: 'Custo', n: true, render: l => brl(l.custo) },
        { id: 'margem', rot: 'Margem', n: true, render: l => <strong className={l.margem < 0 ? 'neg' : 'pos'}>{brl(l.margem)}</strong> },
        { id: 'mpct', rot: '%', n: true, render: l => <span className={l.mpct < 0 ? 'neg' : ''}>{pct(l.mpct)}</span> },
      ]} linhas={linhas} />
    </Card>
  </>);
}
