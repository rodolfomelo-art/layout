import { useState } from 'react';
import { campanhas, resumo, brl, pct, num, nomeCanal } from '../data/mock.js';
import { Card, Kpis, Tabela, CanalTag, Status } from '../components/ui.jsx';
import { Scatter } from '../components/charts.jsx';

export default function Ads({ canal, dias }) {
  const cs = campanhas(canal), r = resumo(canal, dias), [sel, setSel] = useState(null);
  const inv = cs.reduce((a, c) => a + c.invest, 0), vend = cs.reduce((a, c) => a + c.vendas, 0);
  const prejuizo = cs.filter(c => c.acos > c.margemAntesAds);
  const escolhida = cs.find(c => c.id === sel);
  return (<>
    <Kpis itens={[
      { rot: 'Investimento', val: brl(inv) },
      { rot: 'Vendas atribuídas', val: brl(vend) },
      { rot: 'ROAS', val: (vend / inv).toFixed(1).replace('.', ',') + '×' },
      { rot: 'TACOS', val: pct(r.tacos), nota: 'Ads ÷ venda total' },
      { rot: 'Campanhas no prejuízo', val: String(prejuizo.length), nota: brl(prejuizo.reduce((a, c) => a + c.resultado, 0)) },
    ]} />
    <div className="grade g3">
      <Card titulo="Qual campanha escalar e qual pausar" sub="Acima da linha a campanha paga a si mesma; abaixo, dá prejuízo. Clique em um ponto.">
        <Scatter pontos={cs.map(c => ({ id: c.id, x: c.acos, y: c.margemAntesAds, peso: c.invest / 400, rot: `${c.nome} (${nomeCanal(c.canal)})` }))} onSelect={p => setSel(p.id)} />
      </Card>
      <Card titulo={escolhida ? escolhida.nome : 'Detalhe da campanha'} sub={escolhida ? nomeCanal(escolhida.canal) : 'Selecione um ponto no gráfico ou uma linha da tabela.'}>
        {escolhida ? (<div className="medidores">
          <div><span className="muted small">Investimento</span><div><strong>{brl(escolhida.invest)}</strong></div></div>
          <div><span className="muted small">Vendas atribuídas</span><div><strong>{brl(escolhida.vendas)}</strong></div></div>
          <div><span className="muted small">ACOS e ponto de equilíbrio</span><div><strong>{pct(escolhida.acos)}</strong> de {pct(escolhida.margemAntesAds)}</div></div>
          <div><span className="muted small">Resultado após Ads</span><div><strong className={escolhida.resultado < 0 ? 'neg' : 'pos'}>{brl(escolhida.resultado)}</strong></div></div>
          <p className="small">{escolhida.resultado < 0 ? 'Sugestão: reduzir lance ou tirar os SKUs de menor margem da campanha.' : 'Sugestão: aumentar orçamento aos poucos e acompanhar o ACOS.'} <span className="muted">O BI sugere, não altera a campanha.</span></p>
        </div>) : <div className="vazio">Nenhuma campanha selecionada.</div>}
      </Card>
    </div>
    <Card titulo="Campanhas">
      <Tabela onLinha={l => setSel(l.id)} ordemInicial={{ col: 'resultado', dir: 'asc' }} colunas={[
        { id: 'nome', rot: 'Campanha', render: l => <strong>{l.nome}</strong> },
        { id: 'canal', rot: 'Canal', render: l => <CanalTag id={l.canal} /> },
        { id: 'invest', rot: 'Investimento', n: true, render: l => brl(l.invest) },
        { id: 'cliques', rot: 'Cliques', n: true, render: l => num(l.cliques) },
        { id: 'roas', rot: 'ROAS', n: true, render: l => l.roas.toFixed(1).replace('.', ',') + '×' },
        { id: 'acos', rot: 'ACOS', n: true, render: l => pct(l.acos) },
        { id: 'margemAntesAds', rot: 'Equilíbrio', n: true, render: l => pct(l.margemAntesAds) },
        { id: 'resultado', rot: 'Resultado', n: true, render: l => <span className={l.resultado < 0 ? 'neg' : 'pos'}>{brl(l.resultado)}</span> },
        { id: 'st', rot: 'Sugestão', ordenavel: false, render: l => l.resultado < 0 ? <Status tipo="alerta">Revisar</Status> : l.acos < l.margemAntesAds * 0.6 ? <Status tipo="ok">Escalar</Status> : <Status tipo="neutro">Manter</Status> },
      ]} linhas={cs.map(c => ({ ...c, key: c.id }))} />
    </Card>
    <p className="aviso-proto">Janela de atribuição usada no protótipo: 14 dias (Amazon) e vendas diretas + indiretas (Mercado Livre e Shopee).</p>
  </>);
}
