import { useState } from 'react';
import { nomeCanal, pct } from '../data/mock.js';
import Icon from './icons.jsx';

export function Card({ titulo, sub, extra, children, ...rest }) {
  return (
    <section className="card" {...rest}>
      {(titulo || extra) && (
        <div className="card-cab">
          <div>{titulo && <h2>{titulo}</h2>}{sub && <p className="muted small">{sub}</p>}</div>
          {extra}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpis({ itens }) {
  return (
    <div className="kpis" role="list">
      {itens.map(i => (
        <div className="kpi" role="listitem" key={i.rot}>
          <div className="rot">{i.ic && <Icon n={i.ic} size={15} />}<span>{i.rot}</span></div>
          <div className="val">{i.val}</div>
          {i.var !== undefined && (
            <div className={`var ${i.var >= 0 === !i.inverso ? 'pos' : 'neg'}`}>
              {i.var >= 0 ? '↑' : '↓'} {pct(Math.abs(i.var))} vs. período anterior
            </div>
          )}
          {i.nota && <div className={`var ${i.notaCls ?? 'muted'}`}>{i.nota}</div>}
        </div>
      ))}
    </div>
  );
}

export function Vazio({ ic = 'check', titulo, texto, children }) {
  return (
    <div className="vazio">
      <div className="ic"><Icon n={ic} size={22} /></div>
      <h3>{titulo}</h3>
      <p style={{ margin: 0 }}>{texto}</p>
      {children && <div style={{ marginTop: '1.2rem' }}>{children}</div>}
    </div>
  );
}

export function Secao({ titulo, sub, extra, children }) {
  return (
    <section className="secao-app">
      <div className="cab"><div><h2>{titulo}</h2>{sub && <p>{sub}</p>}</div>{extra}</div>
      {children}
    </section>
  );
}

export function CanalTag({ id }) {
  return <span className="canal-tag"><span className={`dot d-${id}`} aria-hidden="true" />{nomeCanal(id)}</span>;
}

export function Legenda({ itens }) {
  return <div className="legenda">{itens.map(([rot, cls, tracejado]) => (
    <span key={rot}>{tracejado ? <svg width="18" height="6" aria-hidden="true"><line x1="0" x2="18" y1="3" y2="3" className={cls} strokeWidth="2" strokeDasharray="4 3" /></svg> : <span className={`dot ${cls}`} aria-hidden="true" />}{rot}</span>
  ))}</div>;
}

export function Tabela({ colunas, linhas, ordemInicial, onLinha, vazio = 'Nada para mostrar com estes filtros.' }) {
  const [ordem, setOrdem] = useState(ordemInicial ?? { col: null, dir: 'desc' });
  const ord = ordem.col == null ? linhas : [...linhas].sort((a, b) => {
    const c = colunas.find(x => x.id === ordem.col), va = c.valor ? c.valor(a) : a[c.id], vb = c.valor ? c.valor(b) : b[c.id];
    return (va > vb ? 1 : va < vb ? -1 : 0) * (ordem.dir === 'asc' ? 1 : -1);
  });
  if (!linhas.length) return <div className="vazio" style={{ padding: '1.5rem' }}>{vazio}</div>;
  return (
    <div className="tabela">
      <table>
        <thead><tr>{colunas.map(c => (
          <th key={c.id} className={c.n ? 'n' : ''} aria-sort={ordem.col === c.id ? (ordem.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
            {c.ordenavel === false ? c.rot : (
              <button onClick={() => setOrdem(o => ({ col: c.id, dir: o.col === c.id && o.dir === 'desc' ? 'asc' : 'desc' }))}>
                {c.rot}{ordem.col === c.id ? (ordem.dir === 'asc' ? ' ↑' : ' ↓') : ''}
              </button>
            )}
          </th>
        ))}</tr></thead>
        <tbody>{ord.map((l, i) => (
          <tr key={l.key ?? i} className={onLinha ? 'clic' : ''} onClick={onLinha ? () => onLinha(l) : undefined}
            tabIndex={onLinha ? 0 : undefined} onKeyDown={onLinha ? e => e.key === 'Enter' && onLinha(l) : undefined}>
            {colunas.map(c => <td key={c.id} className={c.n ? 'n' : ''}>{c.render ? c.render(l) : l[c.id]}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function Status({ tipo, children }) { return <span className={`status st-${tipo}`}>{children}</span>; }
