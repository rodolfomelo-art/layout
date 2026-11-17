import { filtrarCanais, LIMITES_REP, NIVEL_REP, tendenciaRep, nomeCanal } from '../data/mock.js';
import { Card, CanalTag } from '../components/ui.jsx';
import { Sparkline } from '../components/charts.jsx';

export default function Reputacao({ canal }) {
  return (<>
    <div className="grade" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
      {filtrarCanais(canal).map(c => (
        <Card key={c} titulo={<CanalTag id={c} />} sub={NIVEL_REP[c]}>
          <div className="medidores">
            {LIMITES_REP[c].map(([n, v, lim]) => {
              const f = v / lim, cor = f > 0.8 ? 'var(--alerta)' : f > 0.6 ? 'var(--aviso)' : 'var(--lucro)';
              return (<div className="medidor" key={n}>
                <div className="linha"><span>{n}</span><strong>{String(v).replace('.', ',')}{n.includes('(h)') ? ' h' : '%'} <span className="muted" style={{ fontWeight: 400 }}>de {String(lim).replace('.', ',')}</span></strong></div>
                <div className="trilho" role="img" aria-label={`${n}: ${Math.round(f * 100)}% do limite`}><i style={{ width: `${Math.min(100, f * 100)}%`, background: cor }} /><em style={{ left: '100%' }} /></div>
              </div>);
            })}
            <div><span className="muted small">{LIMITES_REP[c][0][0]}, últimas 12 semanas (tracejado: limite)</span><Sparkline valores={tendenciaRep(c)} limite={LIMITES_REP[c][0][2]} /></div>
          </div>
        </Card>
      ))}
    </div>
    <p className="aviso-proto">Cada canal calcula a reputação com regras e períodos próprios. No produto, os valores vêm de seller_reputation (Mercado Livre), do relatório de desempenho do vendedor (Amazon) e de shop_performance (Shopee). Limites aqui são ilustrativos.</p>
  </>);
}
