// Gráficos leves em SVG para o protótipo. Na F5 podem ser trocados por Apache ECharts mantendo as mesmas props.
import { brl, num, pct } from '../data/mock.js';

const k = v => (Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1).replace('.', ',') + ' mi' : Math.abs(v) >= 1e3 ? Math.round(v / 1e3) + ' mil' : Math.round(v).toString());

export function LineChart({ series, w = 640, h = 230, rotuloIni = 'início', rotuloFim = 'hoje' }) {
  const all = series.flatMap(s => s.valores);
  const mx = Math.max(...all) * 1.05, mn = Math.min(...all) * 0.9;
  const n = series[0].valores.length;
  const L = 48, B = h - 26, T = 10;
  const px = i => L + (i * (w - L - 8)) / (n - 1), py = v => B - ((v - mn) / (mx - mn)) * (B - T);
  const ticks = [0, 0.5, 1].map(f => mn + f * (mx - mn));
  return (
    <svg className="graf" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Linha diária">
      {ticks.map((t, i) => (<g key={i}><line x1={L} x2={w - 8} y1={py(t)} y2={py(t)} className="s-linha" /><text x={L - 6} y={py(t) + 4} textAnchor="end" className="ts">{k(t)}</text></g>))}
      {series.map(s => (
        <path key={s.nome} d={s.valores.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ')}
          fill="none" className={s.cls} strokeWidth={s.tracejado ? 1.6 : 2.6} strokeDasharray={s.tracejado ? '5 4' : undefined} />
      ))}
      <text x={L} y={h - 6} className="ts">{rotuloIni}</text>
      <text x={w - 8} y={h - 6} textAnchor="end" className="ts">{rotuloFim}</text>
    </svg>
  );
}

export function StackedBars({ grupos, w = 640, h = 230, blocos = 10 }) {
  const n = grupos[0].valores.length, tam = Math.ceil(n / blocos);
  const agreg = grupos.map(g => ({ ...g, v: Array.from({ length: Math.ceil(n / tam) }, (_, b) => g.valores.slice(b * tam, (b + 1) * tam).reduce((a, x) => a + x, 0)) }));
  const nb = agreg[0].v.length, tot = Array.from({ length: nb }, (_, b) => agreg.reduce((a, g) => a + g.v[b], 0));
  const mx = Math.max(...tot) * 1.08, L = 48, B = h - 24, slot = (w - L - 8) / nb, bw = slot * 0.62;
  return (
    <svg className="graf" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Barras empilhadas por canal">
      {[0, 0.5, 1].map((f, i) => (<g key={i}><line x1={L} x2={w - 8} y1={B - f * (B - 10)} y2={B - f * (B - 10)} className="s-linha" /><text x={L - 6} y={B - f * (B - 10) + 4} textAnchor="end" className="ts">{k(f * mx)}</text></g>))}
      {Array.from({ length: nb }, (_, b) => {
        let y = B;
        return (<g key={b}>
          {agreg.map(g => { const hh = (g.v[b] / mx) * (B - 10); y -= hh; return <rect key={g.nome} x={L + b * slot + (slot - bw) / 2} y={y} width={bw} height={hh} className={g.cls}><title>{`${g.nome}: ${brl(g.v[b])}`}</title></rect>; })}
          <text x={L + b * slot + slot / 2} y={h - 6} textAnchor="middle" className="ts">{tam > 1 ? `${b * tam + 1}–${Math.min((b + 1) * tam, n)}` : b + 1}</text>
        </g>);
      })}
    </svg>
  );
}

export function Waterfall({ etapas, clsVenda = 'f-tinta', w = 640, h = 260 }) {
  const total = etapas[0][1];
  const T = 24, B = h - 40, n = etapas.length + 1, slot = w / n, bw = slot * 0.6;
  const y = v => B - (v / total) * (B - T);
  let run = total; const barras = [{ rot: etapas[0][0], de: 0, ate: total, cls: clsVenda, txt: brl(total) }];
  etapas.slice(1).forEach(([r, v]) => { barras.push({ rot: r, de: run - v, ate: run, cls: 'f-perda', txt: '−' + brl(v) }); run -= v; });
  barras.push({ rot: 'Margem', de: Math.min(0, run), ate: Math.max(0, run), cls: run >= 0 ? 'f-lucro' : 'f-alerta', txt: brl(run) });
  const quebra = t => { const p = t.split(' '); if (p.length < 2) return [t]; const m = Math.ceil(p.length / 2); return [p.slice(0, m).join(' '), p.slice(m).join(' ')]; };
  return (
    <svg className="graf" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Cascata de margem">
      <line x1="0" x2={w} y1={B} y2={B} className="s-linha" />
      {barras.map((b, i) => {
        const x = i * slot + (slot - bw) / 2, y1 = y(b.ate), hh = Math.max(1, y(b.de) - y(b.ate));
        return (<g key={i}>
          <rect x={x} y={y1} width={bw} height={hh} rx="3" className={b.cls} />
          <text x={x + bw / 2} y={y1 - 6} textAnchor="middle" className="t" style={{ fontWeight: 700, fontSize: 11 }}>{b.txt}</text>
          {quebra(b.rot).map((l, j) => <text key={j} x={x + bw / 2} y={B + 16 + j * 14} textAnchor="middle" className="ts">{l}</text>)}
        </g>);
      })}
    </svg>
  );
}

export function Funnel({ etapas, w = 520, h = 210 }) {
  const larg = v => Math.max(40, Math.sqrt(v / etapas[0].v) * (w - 20));
  const cls = ['f-amz', 'f-aviso', 'f-lucro'];
  return (
    <svg className="graf" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Funil de conversão">
      {etapas.map((e, i) => {
        const ww = larg(e.v), y = 8 + i * 66;
        return (<g key={e.rot}>
          <rect x={(w - ww) / 2} y={y} width={ww} height="32" rx="5" className={cls[i]} />
          <text x={w / 2} y={y + 50} textAnchor="middle" className="t">{e.rot}: {num(e.v)}{i > 0 ? ` (${pct(e.v / etapas[i - 1].v)})` : ''}</text>
        </g>);
      })}
    </svg>
  );
}

export function Heatmap({ matriz, w = 640, h = 220 }) {
  const dias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'], L = 36, cw = (w - L) / 24, ch = (h - 24) / 7;
  return (
    <svg className="graf" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Mapa de calor por hora e dia">
      {matriz.map((linha, d) => (<g key={d}>
        <text x={L - 6} y={d * ch + ch * 0.68} textAnchor="end" className="ts">{dias[d]}</text>
        {linha.map((v, hh) => <rect key={hh} x={L + hh * cw} y={d * ch} width={cw - 1.5} height={ch - 1.5} rx="2" style={{ fill: 'var(--amz)', fillOpacity: v }}><title>{`${dias[d]} ${hh}h: ${pct(v, 0)} do pico`}</title></rect>)}
      </g>))}
      {[0, 6, 12, 18, 23].map(hh => <text key={hh} x={L + hh * cw + cw / 2} y={h - 6} textAnchor="middle" className="ts">{hh}h</text>)}
    </svg>
  );
}

export function Scatter({ pontos, onSelect, w = 640, h = 300 }) {
  const mxX = Math.max(0.45, ...pontos.map(p => p.x)) * 1.05, mxY = Math.max(0.4, ...pontos.map(p => p.y)) * 1.05;
  const L = 44, B = h - 30, px = v => L + (v / mxX) * (w - L - 10), py = v => B - (v / mxY) * (B - 10);
  const lim = Math.min(mxX, mxY);
  return (
    <svg className="graf" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="ACOS contra margem por campanha">
      <line x1={L} x2={w - 10} y1={B} y2={B} className="s-linha" /><line x1={L} x2={L} y1={10} y2={B} className="s-linha" />
      {[0.1, 0.2, 0.3, 0.4].filter(v => v < mxX).map(v => <text key={'x' + v} x={px(v)} y={B + 16} textAnchor="middle" className="ts">{pct(v, 0)}</text>)}
      {[0.1, 0.2, 0.3].filter(v => v < mxY).map(v => <text key={'y' + v} x={L - 6} y={py(v) + 4} textAnchor="end" className="ts">{pct(v, 0)}</text>)}
      <line x1={px(0)} y1={py(0)} x2={px(lim)} y2={py(lim)} className="s-tinta" strokeDasharray="5 4" />
      <text x={px(lim) - 4} y={py(lim) + 14} textAnchor="end" className="t">ponto de equilíbrio</text>
      {pontos.map(p => (
        <circle key={p.id} cx={px(p.x)} cy={py(p.y)} r={6 + Math.min(8, p.peso)} className={`ponto ${p.y >= p.x ? 'f-lucro' : 'f-alerta'}`} fillOpacity=".8"
          tabIndex="0" onClick={() => onSelect?.(p)} onKeyDown={e => e.key === 'Enter' && onSelect?.(p)}>
          <title>{`${p.rot}: ACOS ${pct(p.x, 0)}, margem antes de Ads ${pct(p.y, 0)}`}</title>
        </circle>
      ))}
      <text x={w - 10} y={h - 4} textAnchor="end" className="ts">ACOS →</text>
      <text x={L + 4} y={18} className="ts">↑ margem antes de Ads</text>
    </svg>
  );
}

export function CoverageBars({ itens, w = 640, max = 90 }) {
  const L = 170, rowH = 26, h = itens.length * rowH + 26, px = v => L + (Math.min(v, max) / max) * (w - L - 46);
  return (
    <svg className="graf" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Cobertura de estoque em dias">
      <rect x={L} y="0" width={px(15) - L} height={h - 24} style={{ fill: 'var(--alerta)', fillOpacity: 0.09 }} />
      <rect x={px(15)} y="0" width={px(30) - px(15)} height={h - 24} style={{ fill: 'var(--aviso)', fillOpacity: 0.09 }} />
      {itens.map((it, i) => {
        const d = it.cobertura, cls = d < 15 ? 'f-alerta' : d < 30 ? 'f-aviso' : 'f-lucro', y = i * rowH;
        return (<g key={it.sku}>
          <text x={L - 8} y={y + 17} textAnchor="end" className="t">{it.nome.length > 24 ? it.nome.slice(0, 23) + '…' : it.nome}</text>
          <rect x={L} y={y + 5} width={Math.max(2, px(d) - L)} height={rowH - 10} rx="3" className={cls} />
          <text x={px(d) + 5} y={y + 17} className="t">{Number.isFinite(d) ? `${Math.round(d)} d` : 'sem venda'}</text>
        </g>);
      })}
      {[0, 15, 30, 60, 90].map(v => <text key={v} x={px(v)} y={h - 6} textAnchor="middle" className="ts">{v}d</text>)}
    </svg>
  );
}

export function Sparkline({ valores, limite, w = 220, h = 50 }) {
  const mx = Math.max(limite, ...valores) * 1.1, px = i => (i * w) / (valores.length - 1), py = v => h - 4 - (v / mx) * (h - 8);
  return (
    <svg className="graf" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Tendência semanal">
      <line x1="0" x2={w} y1={py(limite)} y2={py(limite)} className="s-sub" strokeDasharray="3 3" />
      <path d={valores.map((v, i) => `${i ? 'L' : 'M'}${px(i)} ${py(v)}`).join(' ')} fill="none" className="s-tinta" strokeWidth="2" />
    </svg>
  );
}
