import { useEffect, useRef, useState, useCallback } from 'react';
import { SKUS, CANAIS, margemPorSku, estoque, alertas, brl, pct, setCanaisAtivos, nomeCanal } from './data/mock.js';
import { Card, CanalTag, Status, Kpis, Vazio } from './components/ui.jsx';
import { Waterfall } from './components/charts.jsx';
import Icon from './components/icons.jsx';
import Marca from './components/Marca.jsx';
import { nomeProduto } from './brand.js';
import Landing from './site/Landing.jsx';
import { Cadastro, Entrar } from './site/Cadastro.jsx';
import Conectar from './site/Conectar.jsx';
import Visao from './screens/Visao.jsx';
import Vendas from './screens/Vendas.jsx';
import Margem from './screens/Margem.jsx';
import Estoque from './screens/Estoque.jsx';
import Ads from './screens/Ads.jsx';
import Reputacao from './screens/Reputacao.jsx';
import Catalogo from './screens/Catalogo.jsx';
import Alertas, { ChatBI } from './screens/Alertas.jsx';
import Canais from './screens/Canais.jsx';

export const TELAS = [
  { id: 'dashboard', grupo: 'Visão', ic: 'grid', nome: 'Dashboard', sub: 'Quanto vendeu, quanto sobrou e o que precisa de atenção hoje.', C: Visao },
  { id: 'vendas', grupo: 'Operação', ic: 'funil', nome: 'Vendas e conversão', sub: 'Da visita ao pedido entregue.', C: Vendas },
  { id: 'estoque', grupo: 'Operação', ic: 'caixa', nome: 'Estoque', sub: 'Ruptura prevista e capital parado.', C: Estoque },
  { id: 'catalogo', grupo: 'Operação', ic: 'etiqueta', nome: 'Catálogo', sub: 'Anúncios pausados, moderados ou fracos.', C: Catalogo },
  { id: 'margem', grupo: 'Financeiro', ic: 'moedas', nome: 'Margem e conciliação', sub: 'Lucro real por SKU e conferência de repasses.', C: Margem },
  { id: 'ads', grupo: 'Marketing', ic: 'megafone', nome: 'Publicidade', sub: 'Campanhas que pagam a si mesmas.', C: Ads },
  { id: 'reputacao', grupo: 'Marketing', ic: 'estrela', nome: 'Reputação', sub: 'Indicadores contra o limite de cada canal.', C: Reputacao },
  { id: 'alertas', grupo: 'Inteligência', ic: 'alerta', nome: 'Alertas', sub: 'O que precisa de ação agora.', C: Alertas },
  { id: 'canais', grupo: 'Configurações', ic: 'config', nome: 'Canais conectados', curto: 'Canais', sub: 'Conecte, desconecte e acompanhe as sincronizações.', C: Canais, semFiltro: true, semDados: true },
];
const SITE = ['inicio', 'cadastro', 'entrar', 'conectar'];
const rotaDoHash = () => { const h = location.hash.replace('#', ''); return SITE.includes(h) || TELAS.some(t => t.id === h) ? h : 'inicio'; };
const ler = (k, padrao) => { try { const v = localStorage.getItem('bi-proto:' + k); return v ? JSON.parse(v) : padrao; } catch { return padrao; } };
const gravar = (k, v) => { try { localStorage.setItem('bi-proto:' + k, JSON.stringify(v)); } catch { /* sem storage */ } };

function DetalheSku({ sku, dias, fechar }) {
  const s = SKUS.find(x => x.sku === sku), linhas = margemPorSku('todos', dias).filter(l => l.sku === sku);
  const e = estoque('todos').find(x => x.sku === sku);
  useEffect(() => { const f = ev => ev.key === 'Escape' && fechar(); addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, [fechar]);
  return (<>
    <div className="gaveta-fundo" onClick={fechar} />
    <aside className="gaveta" role="dialog" aria-modal="true" aria-labelledby="gav-t">
      <div className="cab">
        <div><p className="migalha" style={{ margin: 0 }}>{s.sku}</p><h2 id="gav-t" style={{ fontSize: '1.4rem' }}>{s.nome}</h2><p className="muted small" style={{ margin: '.2rem 0 0' }}>Preço {brl(s.preco)}, custo {brl(s.custo)}.</p></div>
        <button className="icone-btn" onClick={fechar} aria-label="Fechar" autoFocus><Icon n="fechar" /></button>
      </div>
      {linhas.length ? linhas.map(l => (
        <Card key={l.canal} titulo={<CanalTag id={l.canal} />} sub={`${l.unidades} unidades nos últimos ${dias} dias. Margem ${pct(l.margem / l.receita)}.`}>
          <Waterfall clsVenda={`f-${l.canal}`} h={230} etapas={[['Venda', l.receita], ['Comissão', l.comissao], ['Frete', l.frete], ['Impostos', l.imposto], ['Publicidade', l.ads], ['Custo do produto', l.custo]]} />
        </Card>
      )) : <Vazio ic="caixa" titulo="Sem vendas nos canais conectados" texto="Este SKU não vendeu no período." />}
      {e && <Card titulo="Estoque">
        <p style={{ margin: 0 }}>{e.estoque} unidades ({e.local}). {e.semVenda ? `Sem venda há ${e.semVenda} dias.` : `Cobertura de ${Math.floor(e.cobertura)} dias.`}{' '}
          {e.semVenda ? <Status tipo="neutro">Parado</Status> : e.cobertura < 15 ? <Status tipo="alerta">Repor já</Status> : e.cobertura < 30 ? <Status tipo="aviso">Planejar reposição</Status> : <Status tipo="ok">Saudável</Status>}</p>
      </Card>}
    </aside>
  </>);
}

function Busca({ ir, abrirSku, temDados }) {
  const [q, setQ] = useState(''), [aberto, setAberto] = useState(false), ref = useRef(null);
  useEffect(() => { const f = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ref.current?.focus(); } }; addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, []);
  const t = q.trim().toLowerCase();
  const res = t ? [
    ...TELAS.filter(x => x.nome.toLowerCase().includes(t)).map(x => ({ k: 't' + x.id, rot: x.nome, tipo: 'Tela', ir: () => ir(x.id) })),
    ...(temDados ? SKUS.filter(s => s.nome.toLowerCase().includes(t) || s.sku.toLowerCase().includes(t)).map(s => ({ k: s.sku, rot: `${s.nome} (${s.sku})`, tipo: 'SKU', ir: () => abrirSku(s.sku) })) : []),
  ].slice(0, 7) : [];
  return (
    <div className="busca" style={{ position: 'relative' }}>
      <Icon n="busca" size={17} />
      <label className="sr" htmlFor="busca">Buscar</label>
      <input id="busca" ref={ref} value={q} placeholder="Buscar SKU, produto ou tela…" onChange={e => { setQ(e.target.value); setAberto(true); }}
        onFocus={() => setAberto(true)} onBlur={() => setTimeout(() => setAberto(false), 150)} autoComplete="off" />
      <kbd>⌘ K</kbd>
      {aberto && t && <div className="resultados" role="listbox">{res.length ? res.map(r => (
        <button key={r.k} role="option" onMouseDown={e => e.preventDefault()} onClick={() => { r.ir(); setQ(''); setAberto(false); }}><span>{r.rot}</span><span className="muted small">{r.tipo}</span></button>
      )) : <div className="muted small" style={{ padding: '.6rem' }}>Nada encontrado para “{q}”.</div>}</div>}
    </div>
  );
}

function Shell({ tela, ir, conectados, alternar, usuario, sair }) {
  const [canal, setCanal] = useState('todos');
  const [dias, setDias] = useState(30);
  const [sku, setSku] = useState(null);
  const [chat, setChat] = useState(false);
  const [compacta, setCompacta] = useState(false);
  const [menu, setMenu] = useState(false);
  setCanaisAtivos(conectados);
  useEffect(() => { if (canal !== 'todos' && !conectados.includes(canal)) setCanal('todos'); }, [conectados, canal]);
  const atual = TELAS.find(t => t.id === tela), Tela = atual.C;
  const temDados = conectados.length > 0;
  const nAlta = temDados ? alertas(canal).filter(a => a.sev === 'alta').length : 0;
  const grupos = [...new Set(TELAS.map(t => t.grupo))];
  const fecharSku = useCallback(() => setSku(null), []);
  const nav = (e, id) => { e.preventDefault(); ir(id); };
  return (
    <div className={`app ${compacta ? 'compacta' : ''}`}>
      <nav className="side" aria-label="Menu principal">
        <Marca href="#dashboard" onClick={e => nav(e, 'dashboard')} />
        <button className="workspace" title="Loja"><span className="av">LE</span><span><b>Loja Exemplo</b><small>{usuario.papel}</small></span><Icon n="baixo" size={16} /></button>
        <div className="menu-grupos">
        {grupos.map(g => (<div key={g}>
          <div className="grupo">{g}</div>
          <div className="nav">{TELAS.filter(t => t.grupo === g).map(t => (
            <a key={t.id} href={`#${t.id}`} aria-current={t.id === tela ? 'page' : undefined} onClick={e => nav(e, t.id)} title={t.nome}>
              <Icon n={t.ic} /><span className="rot">{t.curto ?? t.nome}</span>
              {t.id === 'alertas' && nAlta > 0 && <span className="badge" aria-label={`${nAlta} alertas de alta prioridade`}>{nAlta}</span>}
              {t.id === 'canais' && <span className="badge" style={{ background: 'var(--navy-2)' }} aria-label={`${conectados.length} de 3 conectados`}>{conectados.length}/3</span>}
            </a>
          ))}</div>
        </div>))}
        <div><div className="grupo">Ajuda</div>
        <div className="nav"><a href="#dashboard" onClick={e => { e.preventDefault(); setChat(true); }} title="Pergunte ao BI"><Icon n="chat" /><span className="rot">Pergunte ao BI</span></a></div></div>
        </div>
      </nav>
      <div className="main" style={{ minWidth: 0 }}>
        <header className="topbar">
          <button className="icone-btn sem-borda ham" onClick={() => setCompacta(c => !c)} aria-label={compacta ? 'Expandir menu' : 'Recolher menu'} aria-pressed={compacta}><Icon n="menu" /></button>
          <Busca ir={ir} abrirSku={setSku} temDados={temDados} />
          <div className="dir">
            <button className="icone-btn" onClick={() => setChat(true)} aria-label="Ajuda e Pergunte ao BI"><Icon n="ajuda" /></button>
            <button className="icone-btn" onClick={() => ir('alertas')} aria-label={`Alertas${nAlta ? `: ${nAlta} de alta prioridade` : ''}`}><Icon n="sino" />{nAlta > 0 && <span className="ponto" />}</button>
            <div style={{ position: 'relative' }}>
              <button className="usuario" onClick={() => setMenu(m => !m)} aria-expanded={menu} aria-haspopup="menu">
                <span className="av">{usuario.nome.slice(0, 1).toUpperCase()}</span><div><b>{usuario.nome.split(' ')[0]}</b><small>{usuario.papel}</small></div><Icon n="baixo" size={16} />
              </button>
              {menu && <div className="resultados" role="menu" style={{ left: 'auto', width: 200 }}>
                <button role="menuitem" onClick={() => { setMenu(false); ir('canais'); }}><span>Canais conectados</span></button>
                <button role="menuitem" onClick={() => { setMenu(false); sair(); }}><span>Sair</span><Icon n="sair" size={16} /></button>
              </div>}
            </div>
          </div>
        </header>
        <main className="pagina">
          <div>
            <div className="migalha">{nomeProduto} / <b>{atual.nome}</b></div>
            <div className="cab-pag" style={{ marginTop: '.6rem' }}>
              <div><h1>{atual.nome}</h1><p>{atual.sub}</p></div>
              {!atual.semFiltro && temDados && <div className="filtros">
                <div className="seg" role="group" aria-label="Canal">
                  {[{ id: 'todos', nome: 'Todos' }, ...CANAIS.filter(c => conectados.includes(c.id))].map(c => (
                    <button key={c.id} aria-pressed={canal === c.id} onClick={() => setCanal(c.id)}>{c.id !== 'todos' && <span className={`dot d-${c.id}`} aria-hidden="true" />}{c.nome}</button>
                  ))}
                </div>
                <div className="seg" role="group" aria-label="Período">{[7, 30, 90].map(d => <button key={d} aria-pressed={dias === d} onClick={() => setDias(d)}>{d} dias</button>)}</div>
              </div>}
            </div>
          </div>
          {temDados || atual.semDados ? (
            <Tela key={tela} canal={canal} dias={dias} abrirSku={setSku} ir={ir} abrirChat={() => setChat(true)} conectados={conectados} alternar={alternar} />
          ) : (<>
            <Kpis itens={[['carrinho', 'GMV'], ['recibo', 'Pedidos'], ['etiqueta', 'Ticket médio'], ['moedas', 'Margem de contribuição'], ['porcento', 'Margem %']].map(([ic, rot]) => ({ ic, rot, val: '—', nota: 'Sem dados ainda', notaCls: 'pos' }))} />
            <Vazio ic="link" titulo="Nenhum canal conectado ainda" texto="Conecte o Mercado Livre, a Amazon ou a Shopee e os números aparecem aqui após a primeira carga.">
              <button className="btn" onClick={() => ir('canais')}><Icon n="link" size={15} />Conectar canais</button>
            </Vazio>
          </>)}
          <p className="aviso-proto">Protótipo navegável com dados fictícios. Última carga simulada: hoje, 06:00.</p>
        </main>
      </div>
      <button className="fab" onClick={() => setChat(true)} aria-label="Abrir Pergunte ao BI"><Icon n="chat" size={22} /></button>
      {sku && <DetalheSku sku={sku} dias={dias} fechar={fecharSku} />}
      {chat && <ChatBI canal={canal} dias={dias} fechar={() => setChat(false)} />}
    </div>
  );
}

export default function App() {
  const [rota, setRota] = useState(rotaDoHash());
  const [conectados, setConectados] = useState(() => ler('conectados', ['ml', 'amz', 'shp']));
  const [usuario, setUsuario] = useState(() => ler('usuario', { nome: 'Ana Souza', papel: 'Dono' }));
  useEffect(() => { const f = () => setRota(rotaDoHash()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f); }, []);
  useEffect(() => gravar('conectados', conectados), [conectados]);
  useEffect(() => gravar('usuario', usuario), [usuario]);
  const ir = id => { if (location.hash !== '#' + id) location.hash = id; setRota(id); window.scrollTo(0, 0); };
  const alternar = id => setConectados(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id].sort((a, b) => ['ml', 'amz', 'shp'].indexOf(a) - ['ml', 'amz', 'shp'].indexOf(b)));
  const titulo = rota === 'inicio' ? nomeProduto : rota === 'cadastro' ? 'Criar conta' : rota === 'entrar' ? 'Entrar' : rota === 'conectar' ? 'Conectar canais' : TELAS.find(t => t.id === rota)?.nome;
  useEffect(() => { document.title = `${titulo} | ${nomeProduto}`; }, [titulo]);

  if (rota === 'inicio') return <Landing ir={ir} />;
  if (rota === 'cadastro') return <Cadastro ir={ir} onCriar={d => { setUsuario({ nome: d.nome, papel: 'Dono' }); setConectados([]); ir('conectar'); }} />;
  if (rota === 'entrar') return <Entrar ir={ir} onEntrar={() => { setUsuario({ nome: 'Ana Souza', papel: 'Dono' }); setConectados(['ml', 'amz', 'shp']); ir('dashboard'); }} />;
  if (rota === 'conectar') return <Conectar conectados={conectados} alternar={alternar} nome={usuario.nome} concluir={() => ir('dashboard')} />;
  return <Shell tela={rota} ir={ir} conectados={conectados} alternar={alternar} usuario={usuario} sair={() => ir('inicio')} />;
}
