import { useState } from 'react';
import { alertas, margemPorSku, estoque, campanhas, resumo, brl, pct, nomeCanal, canaisAtivos } from '../data/mock.js';
import { Card, Vazio } from '../components/ui.jsx';
import Icon from '../components/icons.jsx';

export const SUGESTOES = ['Quais SKUs têm margem negativa?', 'O que vai faltar no estoque?', 'Quais campanhas dão prejuízo?', 'Como está a margem por canal?'];

export function responder(q, canal, dias) {
  const t = q.toLowerCase();
  if (!canaisAtivos().length) return { txt: 'Conecte ao menos um canal para eu ter dados para responder.', itens: [] };
  if (t.includes('margem') && t.includes('negativ')) {
    const l = margemPorSku(canal, dias).filter(x => x.margem < 0).sort((a, b) => a.margem - b.margem);
    return { txt: l.length ? `${l.length} combinações de SKU e canal com margem negativa nos últimos ${dias} dias:` : 'Nenhum SKU com margem negativa no período.', itens: l.slice(0, 5).map(x => `${x.nome} em ${nomeCanal(x.canal)}: ${brl(x.margem)}`) };
  }
  if (t.includes('estoque') || t.includes('faltar') || t.includes('ruptura')) {
    const l = estoque(canal).filter(x => x.cobertura < 30 && !x.semVenda).sort((a, b) => a.cobertura - b.cobertura);
    return { txt: `${l.length} SKUs com menos de 30 dias de cobertura:`, itens: l.slice(0, 5).map(x => `${x.nome}: ${Math.floor(x.cobertura)} dias (${x.estoque} un.)`) };
  }
  if (t.includes('campanha') || t.includes('ads') || t.includes('acos')) {
    const l = campanhas(canal).filter(c => c.resultado < 0).sort((a, b) => a.resultado - b.resultado);
    return { txt: `${l.length} campanhas com ACOS acima do ponto de equilíbrio:`, itens: l.slice(0, 5).map(c => `${c.nome} (${nomeCanal(c.canal)}): ACOS ${pct(c.acos)}, equilíbrio ${pct(c.margemAntesAds)}`) };
  }
  if (t.includes('canal') || t.includes('margem')) {
    return { txt: `Margem de contribuição nos últimos ${dias} dias:`, itens: canaisAtivos().map(c => { const r = resumo(c, dias); return `${nomeCanal(c)}: ${brl(r.margem)} (${pct(r.margemPct)})`; }) };
  }
  return { txt: 'No protótipo eu respondo sobre margem, estoque, campanhas e canais. Tente uma das sugestões.', itens: [] };
}

export function ChatBI({ canal, dias, fechar }) {
  const [msgs, setMsgs] = useState([{ de: 'bi', txt: 'Olá! Pergunte sobre margem, estoque, campanhas ou canais. Uso os mesmos filtros da tela.', itens: [] }]);
  const [q, setQ] = useState('');
  const enviar = texto => { if (!texto.trim()) return; const r = responder(texto, canal, dias); setMsgs(m => [...m, { de: 'eu', txt: texto }, { de: 'bi', ...r }]); setQ(''); };
  return (<>
    <div className="gaveta-fundo" onClick={fechar} />
    <aside className="gaveta chat-gaveta" role="dialog" aria-modal="true" aria-labelledby="chat-t">
      <div className="cab">
        <div><h2 id="chat-t" style={{ fontSize: '1.3rem' }}>Pergunte ao BI</h2><p className="muted small" style={{ margin: '.2rem 0 0' }}>Protótipo: respostas sobre os dados fictícios. No produto, o agente usa o MCP do BI.</p></div>
        <button className="icone-btn" onClick={fechar} aria-label="Fechar"><Icon n="fechar" /></button>
      </div>
      <div className="chat" style={{ flex: 1 }}>
        <div className="msgs" aria-live="polite">{msgs.map((m, i) => (
          <div key={i} className={`msg ${m.de}`}>{m.txt}{m.itens?.length > 0 && <ul>{m.itens.map((x, j) => <li key={j}>{x}</li>)}</ul>}</div>
        ))}</div>
        <div className="sugestoes">{SUGESTOES.map(s => <button key={s} className="chip" onClick={() => enviar(s)}>{s}</button>)}</div>
        <form onSubmit={e => { e.preventDefault(); enviar(q); }}>
          <label className="sr" htmlFor="pergunta">Pergunta</label>
          <input id="pergunta" value={q} onChange={e => setQ(e.target.value)} placeholder="Ex.: quais SKUs têm margem negativa?" autoFocus />
          <button className="btn" type="submit">Perguntar</button>
        </form>
      </div>
    </aside>
  </>);
}

export default function Alertas({ canal, ir }) {
  const [sev, setSev] = useState('todas');
  const todos = alertas(canal), a = todos.filter(x => sev === 'todas' || x.sev === sev);
  const n = s => todos.filter(x => x.sev === s).length;
  return (
    <Card titulo="Alertas" sub={`${todos.length} itens gerados após a última carga`}
      extra={<div className="seg" role="group" aria-label="Prioridade">
        {[['todas', `Todas (${todos.length})`], ['alta', `Alta (${n('alta')})`], ['media', `Média (${n('media')})`], ['baixa', `Baixa (${n('baixa')})`]].map(([id, r]) =>
          <button key={id} aria-pressed={sev === id} onClick={() => setSev(id)}>{r}</button>)}
      </div>}>
      {a.length ? <ul className="alertas">{a.map((x, i) => (
        <li key={i} className={`sev-${x.sev}`}>
          <span className={`status st-${x.sev === 'alta' ? 'alerta' : x.sev === 'media' ? 'aviso' : 'neutro'}`}>{x.sev === 'media' ? 'média' : x.sev}</span>
          <div><strong>{x.titulo}</strong><div className="muted small">{x.detalhe}</div></div>
          <a href={`#${x.tela}`} onClick={e => { e.preventDefault(); ir(x.tela); }}>Abrir →</a>
        </li>))}</ul> : <Vazio titulo="Nada pendente por aqui" texto="Sem itens desta prioridade agora." />}
    </Card>
  );
}
