import { estoque, brl, num } from '../data/mock.js';
import { Card, Kpis, Tabela, Status } from '../components/ui.jsx';
import { CoverageBars } from '../components/charts.jsx';

export default function Estoque({ canal, abrirSku }) {
  const e = estoque(canal), vendendo = e.filter(x => Number.isFinite(x.cobertura));
  const ruptura = vendendo.filter(x => x.cobertura < 15), parados = e.filter(x => x.semVenda >= 60);
  const criticos = [...vendendo].sort((a, b) => a.cobertura - b.cobertura).slice(0, 10);
  return (<>
    <Kpis itens={[
      { rot: 'SKUs com estoque', val: num(e.filter(x => x.estoque > 0).length) },
      { rot: 'Ruptura em até 15 dias', val: String(ruptura.length) },
      { rot: 'Cobertura mediana', val: `${Math.round([...vendendo].sort((a, b) => a.cobertura - b.cobertura)[Math.floor(vendendo.length / 2)]?.cobertura ?? 0)} dias` },
      { rot: 'Capital em estoque', val: brl(e.reduce((a, x) => a + x.capital, 0)) },
      { rot: 'Parado há 60+ dias', val: String(parados.length), nota: brl(parados.reduce((a, x) => a + x.capital, 0)) },
    ]} />
    <Card titulo="Cobertura em dias" sub="Os 10 SKUs mais próximos de acabar. Faixas: até 15 dias e até 30 dias."><CoverageBars itens={criticos} /></Card>
    <Card titulo="Todos os SKUs" sub="Clique para ver o detalhe">
      <Tabela onLinha={l => abrirSku(l.sku)} ordemInicial={{ col: 'cobertura', dir: 'asc' }} colunas={[
        { id: 'nome', rot: 'Produto', render: l => <><strong>{l.nome}</strong> <span className="muted small">{l.sku}</span></> },
        { id: 'local', rot: 'Onde está' },
        { id: 'estoque', rot: 'Estoque', n: true },
        { id: 'vendaDia', rot: 'Venda/dia', n: true, render: l => l.vendaDia.toFixed(1).replace('.', ',') },
        { id: 'cobertura', rot: 'Cobertura', n: true, render: l => l.semVenda ? `sem venda há ${l.semVenda} d` : `${Math.round(l.cobertura)} d` },
        { id: 'capital', rot: 'Capital', n: true, render: l => brl(l.capital) },
        { id: 'sit', rot: 'Situação', ordenavel: false, render: l => l.semVenda >= 60 ? <Status tipo="neutro">Parado</Status> : l.cobertura < 15 ? <Status tipo="alerta">Repor já</Status> : l.cobertura < 30 ? <Status tipo="aviso">Planejar reposição</Status> : l.semVenda >= 60 ? <Status tipo="neutro">Parado</Status> : <Status tipo="ok">Saudável</Status> },
      ]} linhas={e.map(x => ({ ...x, key: x.sku }))} />
    </Card>
  </>);
}
