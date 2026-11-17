import { resumo, serieDiaria, filtrarCanais, nomeCanal, brl, num, pct, varPct, margemPorSku, alertas } from '../data/mock.js';
import { Card, Kpis, Legenda, Tabela, CanalTag, Secao, Status } from '../components/ui.jsx';
import { LineChart, StackedBars, Waterfall } from '../components/charts.jsx';
import Icon from '../components/icons.jsx';

export default function Visao({ canal, dias, abrirSku, ir, abrirChat }) {
  const r = resumo(canal, dias), s = serieDiaria(canal, dias), c = r.cascata;
  const canais = filtrarCanais(canal);
  const porCanal = canais.map(id => ({ id, ...resumo(id, dias) }));
  const piores = margemPorSku(canal, dias).sort((a, b) => a.margem - b.margem).slice(0, 5);
  const al = alertas(canal);
  return (<>
    <Kpis itens={[
      { ic: 'carrinho', rot: 'GMV', val: brl(r.gmv), var: varPct(r.gmv, r.gmvAnt) },
      { ic: 'recibo', rot: 'Pedidos', val: num(r.pedidos), var: varPct(r.pedidos, r.pedidosAnt) },
      { ic: 'etiqueta', rot: 'Ticket médio', val: brl(r.ticket), var: varPct(r.ticket, r.ticketAnt) },
      { ic: 'moedas', rot: 'Margem de contribuição', val: brl(r.margem), var: varPct(r.margem, r.margemAnt) },
      { ic: 'porcento', rot: 'Margem %', val: pct(r.margemPct), nota: `TACOS ${pct(r.tacos)}` },
    ]} />
    <div className="grade g3">
      <Secao titulo="Faturamento diário" sub="Comparado ao mesmo intervalo do período anterior"
        extra={<Legenda itens={[['Período atual', 'd-amz'], ['Período anterior', 's-sub', true]]} />}>
        <Card><LineChart series={[{ nome: 'anterior', valores: s.anterior, cls: 's-sub', tracejado: true }, { nome: 'atual', valores: s.total, cls: 's-amz' }]} rotuloIni={`há ${dias} dias`} /></Card>
      </Secao>
      <Secao titulo="Alertas importantes" sub="Itens que pedem sua atenção">
        <Card>
          <ul className="alertas">{al.slice(0, 3).map((x, i) => (
            <li key={i} className={`sev-${x.sev}`} style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
              <div><strong className="small">{x.titulo}</strong><div className="muted small">{x.detalhe}</div></div>
              <a href={`#${x.tela}`} onClick={e => { e.preventDefault(); ir(x.tela); }}>Abrir</a>
            </li>))}</ul>
          <button className="btn sec bloco" style={{ marginTop: '.8rem' }} onClick={() => ir('alertas')}>Ver todos os {al.length} alertas</button>
        </Card>
      </Secao>
    </div>
    <div className="grade g2">
      <Secao titulo="Para onde vai cada venda" sub="Cascata do período, em R$">
        <Card><Waterfall etapas={[['Venda', c.receita], ['Comissão', c.comissao], ['Frete', c.frete], ['Impostos', c.imposto], ['Publicidade', c.ads], ['Custo do produto', c.custo]]} /></Card>
      </Secao>
      <Secao titulo="Por canal" sub="GMV, participação e margem" extra={<Legenda itens={canais.map(id => [nomeCanal(id), `d-${id}`])} />}>
        <Card>
          <div className="canais-lista">{porCanal.map(p => (
            <div key={p.id}>
              <div className="l1"><CanalTag id={p.id} /><strong>{brl(p.gmv)}</strong></div>
              <div className="barra-mini" style={{ marginTop: '.35rem' }}><i className={`d-${p.id}`} style={{ width: `${(p.gmv / r.gmv) * 100}%` }} /></div>
              <div className="l2"><span>{pct(p.gmv / r.gmv, 0)} do GMV</span><span className={p.margemPct > 0.12 ? 'pos' : 'neg'}>margem {pct(p.margemPct)}</span></div>
            </div>
          ))}</div>
          <div style={{ marginTop: '1rem' }}><StackedBars h={170} grupos={canais.map(id => ({ nome: nomeCanal(id), cls: `f-${id}`, valores: s.porCanal[id] }))} blocos={dias > 30 ? 13 : dias > 7 ? 10 : 7} /></div>
        </Card>
      </Secao>
    </div>
    <Secao titulo="SKUs com pior margem" sub="Clique para ver a composição" extra={<a className="link" href="#margem" onClick={e => { e.preventDefault(); ir('margem'); }}>Ver todos →</a>}>
      <Card>
        <Tabela onLinha={l => abrirSku(l.sku)} colunas={[
          { id: 'nome', rot: 'Produto', render: l => <><strong>{l.nome}</strong> <span className="muted small">{l.sku}</span></> },
          { id: 'canal', rot: 'Canal', render: l => <CanalTag id={l.canal} /> },
          { id: 'receita', rot: 'Receita', n: true, render: l => brl(l.receita) },
          { id: 'margem', rot: 'Margem', n: true, render: l => <span className={l.margem < 0 ? 'neg' : ''}>{brl(l.margem)}</span> },
          { id: 'st', rot: 'Situação', ordenavel: false, render: l => l.margem < 0 ? <Status tipo="alerta">Prejuízo</Status> : <Status tipo="aviso">Margem baixa</Status> },
        ]} linhas={piores.map(p => ({ ...p, key: p.sku + p.canal }))} />
      </Card>
    </Secao>
    <Secao titulo="Ações rápidas" sub="Comece por aqui">
      <div className="acoes-rapidas">
        <button className="acao" onClick={() => ir('canais')}><span className="ic"><Icon n="link" /></span><span><b>Conectar canal</b><small>Mercado Livre, Amazon ou Shopee</small></span></button>
        <button className="acao" onClick={() => ir('margem')}><span className="ic"><Icon n="mais" /></span><span><b>Importar custos</b><small>Planilha de custo por SKU</small></span></button>
        <button className="acao" onClick={abrirChat}><span className="ic"><Icon n="chat" /></span><span><b>Pergunte ao BI</b><small>Respostas sobre seus números</small></span></button>
      </div>
    </Secao>
  </>);
}
