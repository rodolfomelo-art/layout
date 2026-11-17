import Icon from '../components/icons.jsx';
import Marca from '../components/Marca.jsx';
import { nomeProduto } from '../brand.js';

const RECURSOS = [
  ['moedas', 'Margem real por SKU', 'Comissão, frete, impostos, Ads e custo descontados de cada venda, em cada canal.'],
  ['recibo', 'Conciliação de repasses', 'Compare o que cada pedido prometia com o que o marketplace depositou.'],
  ['caixa', 'Estoque, Full e FBA', 'Cobertura em dias, ruptura prevista e capital parado em um só lugar.'],
  ['megafone', 'Publicidade com lucro', 'Veja quais campanhas pagam a si mesmas usando a margem real, não só o ACOS.'],
  ['estrela', 'Reputação nos três canais', 'Reclamações, atrasos e cancelamentos contra o limite de cada marketplace.'],
  ['chat', 'Pergunte ao BI', 'Faça perguntas em português e receba a resposta com período e definição.'],
];
const rolar = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export default function Landing({ ir }) {
  const go = r => e => { e.preventDefault(); ir(r); };
  return (
    <div className="site">
      <header className="site-topo"><div className="in">
        <Marca onClick={go('inicio')} />
        <nav aria-label="Seções">
          <a href="#inicio" onClick={e => { e.preventDefault(); rolar('produto'); }}>Produto</a>
          <a href="#inicio" onClick={e => { e.preventDefault(); rolar('recursos'); }}>Recursos</a>
          <a href="#inicio" onClick={e => { e.preventDefault(); rolar('planos'); }}>Planos</a>
        </nav>
        <div className="acoes">
          <a className="link" href="#entrar" onClick={go('entrar')}>Já sou cliente</a>
          <a className="btn" href="#cadastro" onClick={go('cadastro')}>Começar agora</a>
        </div>
      </div></header>

      <section className="hero" id="produto"><div className="wrap in">
        <div>
          <span className="pill">Dados &amp; Analytics da Tempt para quem vende online</span>
          <h1>Venda em todo lugar. Saiba quanto <em>sobra</em>.</h1>
          <p className="lead">O {nomeProduto} junta Mercado Livre, Amazon e Shopee em um só painel e mostra a margem real de cada venda, o estoque que vai faltar e as campanhas que dão prejuízo.</p>
          <div className="ctas">
            <button className="btn grande" onClick={() => rolar('planos')}>Conhecer os planos <Icon n="seta" size={16} /></button>
            <a className="btn sec grande" href="#entrar" onClick={go('entrar')}>Explorar a demonstração</a>
          </div>
          <ul className="checks">
            <li><Icon n="check" size={14} />Conexão oficial com os canais</li>
            <li><Icon n="check" size={14} />Dados atualizados todo dia</li>
            <li><Icon n="check" size={14} />Suporte especializado</li>
          </ul>
        </div>
        <div className="mock" aria-label="Exemplo do painel">
          <div className="barra"><span className="pontos">•••</span><span>Loja Exemplo</span><span className="tag-ok">● Dados em dia</span></div>
          <div className="corpo">
            <div className="lado"><i /><i className="on" /><i /><i /><i /></div>
            <div className="conteudo-mock">
              <p className="eyebrow" style={{ fontSize: '.62rem', margin: 0 }}>Visão geral</p>
              <strong style={{ fontSize: '1.2rem' }}>Quanto sobrou este mês</strong>
              <div className="mini-kpis">
                <div><small>GMV</small><strong>R$ 1,17 mi</strong><em>↑ 8% no mês</em></div>
                <div><small>Margem</small><strong>16,9%</strong><em>↑ 1,2 p.p.</em></div>
                <div><small>Ruptura</small><strong>5 SKUs</strong><em style={{ color: 'var(--alerta)' }}>em até 15 dias</em></div>
              </div>
              <svg className="graf" viewBox="0 0 400 130" aria-hidden="true">
                {[52, 64, 58, 80, 74, 92, 104].map((h, i) => <rect key={i} x={8 + i * 56} y={124 - h} width="44" height={h} rx="3" style={{ fill: 'var(--laranja)', fillOpacity: .8 }} />)}
                <line x1="0" x2="400" y1="124" y2="124" className="s-linha" />
              </svg>
            </div>
          </div>
        </div>
      </div></section>

      <section className="secao" id="recursos"><div className="wrap">
        <div className="cab">
          <p className="eyebrow">Feito para quem vende em marketplace</p>
          <h2>Menos planilhas e painéis separados. Mais lucro em cada venda.</h2>
          <p>Do primeiro anúncio ao último repasse, sua equipe olha para os mesmos números.</p>
        </div>
        <div className="recursos">{RECURSOS.map(([ic, t, d]) => (
          <div className="recurso" key={t}><div className="ic"><Icon n={ic} size={17} /></div><h3>{t}</h3><p>{d}</p></div>
        ))}</div>
        <div className="canais-faixa">
          <span><i className="dot d-ml" />Mercado Livre</span><span><i className="dot d-amz" />Amazon</span><span><i className="dot d-shp" />Shopee</span>
        </div>
      </div></section>

      <section className="secao creme" id="planos"><div className="wrap">
        <div className="cab">
          <p className="eyebrow">Planos simples e transparentes</p>
          <h2>Todos os seus canais em um só painel.</h2>
          <p>Os dois planos incluem todos os recursos e os três marketplaces.</p>
        </div>
        <div className="planos">
          <div className="plano">
            <p className="eyebrow" style={{ fontSize: '.68rem' }}>Plano mensal</p>
            <h3>Flexibilidade para começar</h3>
            <p className="muted small">Ideal para validar o BI na sua operação.</p>
            <div className="preco"><sup>R$</sup><strong>349</strong><span>/mês</span></div>
            <p className="muted small">Cobrança mensal. Cancele quando quiser.</p>
            <a className="btn sec bloco" href="#cadastro" onClick={go('cadastro')}>Contratar plano mensal</a>
            <ul>{['Mercado Livre, Amazon e Shopee', 'Margem e conciliação', 'Estoque, Ads e reputação', 'Alertas diários', 'Pergunte ao BI'].map(x => <li key={x}><Icon n="check" size={15} />{x}</li>)}</ul>
          </div>
          <div className="plano destaque">
            <span className="selo-off">Mais vantajoso: 20% off</span>
            <p className="eyebrow" style={{ fontSize: '.68rem' }}>Plano anual</p>
            <h3>Para operações que não param</h3>
            <p className="muted small">Economize no ano inteiro e mantenha o histórico sempre ativo.</p>
            <div className="preco"><sup>R$</sup><strong>3.350</strong><span>/ano</span></div>
            <p className="small"><s className="muted">R$ 4.188</s> <span className="pos" style={{ fontWeight: 700 }}>equivale a R$ 279/mês</span></p>
            <a className="btn bloco" href="#cadastro" onClick={go('cadastro')}>Contratar plano anual <Icon n="seta" size={16} /></a>
            <ul>{['Tudo do plano mensal', 'Economia de R$ 838 por ano', 'Histórico ilimitado', 'Prioridade no suporte', 'Implantação assistida'].map(x => <li key={x}><Icon n="check" size={15} />{x}</li>)}</ul>
          </div>
        </div>
        <p className="nota-planos">Valores de exemplo para o protótipo. Pagamento seguro; após a contratação você conecta seus canais.</p>
      </div></section>

      <section className="cta-band"><div className="wrap in">
        <div>
          <p className="eyebrow">Clareza primeiro. Sem caixa-preta.</p>
          <h2>Dados que transformam vendas em <em>resultados</em>.</h2>
          <p>Cada número mostra de onde veio e como foi calculado, para você decidir preço, estoque e Ads com segurança.</p>
        </div>
        <a className="btn grande" href="#cadastro" onClick={go('cadastro')}>Começar com o {nomeProduto} <Icon n="seta" size={16} /></a>
      </div></section>
      <footer className="rodape-site"><div className="wrap in">
        <Marca onClick={go('inicio')} />
        <span>© 2026 Tempt Tecnologia. <a href="mailto:contato@tempttecnologia.com.br">contato@tempttecnologia.com.br</a></span>
        <nav><a href="#inicio">Termos</a><a href="#inicio">Privacidade</a><a href="#inicio">Cookies</a><a href="#entrar" onClick={go('entrar')}>Entrar</a></nav>
      </div></footer>
    </div>
  );
}
