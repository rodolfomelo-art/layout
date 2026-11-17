import { funil, mapaCalor, anunciosBaixaConversao, resumo, brl, num, pct, varPct } from '../data/mock.js';
import { Card, Kpis, Tabela, CanalTag } from '../components/ui.jsx';
import { Funnel, Heatmap } from '../components/charts.jsx';

export default function Vendas({ canal, dias, abrirSku }) {
  const f = funil(canal, dias), r = resumo(canal, dias), baixa = anunciosBaixaConversao(canal);
  return (<>
    <Kpis itens={[
      { rot: 'Visitas', val: num(f[0].v) },
      { rot: 'Pedidos', val: num(f[1].v), var: varPct(r.pedidos, r.pedidosAnt) },
      { rot: 'Conversão', val: pct(f[1].v / f[0].v, 2) },
      { rot: 'Unidades por pedido', val: (r.cascata.unidades / r.pedidos).toFixed(2).replace('.', ',') },
      { rot: 'Entregues sem devolução', val: pct(f[2].v / f[1].v) },
    ]} />
    <div className="grade g3b">
      <Card titulo="Onde o cliente se perde" sub="Da visita ao pedido entregue"><Funnel etapas={f} /></Card>
      <Card titulo="Quando o cliente compra" sub="Intensidade de pedidos por hora e dia da semana"><Heatmap matriz={mapaCalor(canal)} /></Card>
    </div>
    <Card titulo="Muita visita, pouca venda" sub="Anúncios com conversão abaixo de 1,6%. Revise preço, fotos, frete e prazo.">
      <Tabela onLinha={l => abrirSku(l.sku)} ordemInicial={{ col: 'visitas', dir: 'desc' }} colunas={[
        { id: 'nome', rot: 'Anúncio', render: l => <><strong>{l.nome}</strong> <span className="muted small">{l.sku}</span></> },
        { id: 'canal', rot: 'Canal', render: l => <CanalTag id={l.canal} /> },
        { id: 'visitas', rot: 'Visitas', n: true, render: l => num(l.visitas) },
        { id: 'vendas', rot: 'Vendas', n: true },
        { id: 'conv', rot: 'Conversão', n: true, render: l => <span className="neg">{l.conv.toFixed(2).replace('.', ',')}%</span> },
      ]} linhas={baixa.map(b => ({ ...b, key: b.sku + b.canal }))} />
    </Card>
  </>);
}
