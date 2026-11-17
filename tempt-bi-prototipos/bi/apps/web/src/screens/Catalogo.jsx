import { pendencias, brl } from '../data/mock.js';
import { Card, Kpis, Tabela, CanalTag, Status } from '../components/ui.jsx';

export default function Catalogo({ canal, abrirSku }) {
  const p = pendencias(canal);
  return (<>
    <Kpis itens={[
      { rot: 'Pendências', val: String(p.length) },
      { rot: 'Alta prioridade', val: String(p.filter(x => x.sev === 'alta').length) },
      { rot: 'Receita em risco (30 dias)', val: brl(p.reduce((a, x) => a + x.risco, 0)) },
      { rot: 'Pausados ou inativos', val: String(p.filter(x => /Pausado|Inativo|Sem estoque/.test(x.tipo)).length) },
      { rot: 'Qualidade baixa', val: String(p.filter(x => x.tipo === 'Baixa qualidade').length) },
    ]} />
    <Card titulo="Anúncios que precisam de ação" sub="Ordenados pela receita que deixam de gerar em 30 dias">
      <Tabela onLinha={l => abrirSku(l.sku)} ordemInicial={{ col: 'risco', dir: 'desc' }} vazio="Nenhuma pendência neste canal." colunas={[
        { id: 'sev', rot: 'Prioridade', render: l => <Status tipo={l.sev === 'alta' ? 'alerta' : l.sev === 'media' ? 'aviso' : 'neutro'}>{l.sev === 'media' ? 'média' : l.sev}</Status> },
        { id: 'nome', rot: 'Produto', render: l => <><strong>{l.nome}</strong> <span className="muted small">{l.sku}</span></> },
        { id: 'canal', rot: 'Canal', render: l => <CanalTag id={l.canal} /> },
        { id: 'tipo', rot: 'Problema' },
        { id: 'motivo', rot: 'Motivo', ordenavel: false },
        { id: 'risco', rot: 'Receita em risco', n: true, render: l => brl(l.risco) },
      ]} linhas={p.map(x => ({ ...x, key: x.sku + x.canal }))} />
    </Card>
  </>);
}
