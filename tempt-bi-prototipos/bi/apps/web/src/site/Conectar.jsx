import { useState } from 'react';
import Icon from '../components/icons.jsx';
import Marca from '../components/Marca.jsx';

export const CONECTORES = [
  { id: 'ml', nome: 'Mercado Livre', sigla: 'ML', desc: 'Pedidos, visitas, tarifas, Product Ads e reputação. Login pelo Mercado Livre.' },
  { id: 'amz', nome: 'Amazon', sigla: 'AZ', desc: 'Pedidos, financeiro, estoque FBA e Sponsored Ads. Autorização pelo Seller Central.' },
  { id: 'shp', nome: 'Shopee', sigla: 'SP', desc: 'Pedidos, repasses, devoluções, saúde da loja e Ads. Autorização da loja.' },
];

export function ListaConectores({ conectados, alternar }) {
  const [carregando, setCarregando] = useState(null);
  const clicar = id => {
    if (conectados.includes(id)) return alternar(id);
    setCarregando(id); setTimeout(() => { setCarregando(null); alternar(id); }, 700);
  };
  return (
    <div className="lista canais-cfg">{CONECTORES.map(c => {
      const on = conectados.includes(c.id);
      return (
        <div className="conector" key={c.id}>
          <div className={`logo bg-${c.id}`} aria-hidden="true">{c.sigla}</div>
          <div><strong>{c.nome}</strong><p>{on ? 'Conectado. Última sincronização: hoje, 06:00.' : c.desc}</p></div>
          {on ? (<div style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
            <span className="ok"><Icon n="check" size={15} />Conectado</span>
            <button className="btn sec" onClick={() => clicar(c.id)}>Desconectar</button>
          </div>) : (
            <button className="btn" onClick={() => clicar(c.id)} disabled={carregando === c.id}>
              <Icon n="link" size={15} />{carregando === c.id ? 'Conectando…' : `Conectar ${c.nome}`}
            </button>
          )}
        </div>
      );
    })}</div>
  );
}

export default function Conectar({ conectados, alternar, concluir, nome }) {
  return (
    <div style={{ background: 'var(--fundo)', minHeight: '100vh' }}>
      <header className="site-topo"><div className="in"><Marca href="#inicio" /><span className="muted small">Etapa final: conectar canais</span></div></header>
      <div className="conectar">
        <p className="eyebrow">Conta criada{nome ? `, ${nome.split(' ')[0]}` : ''}</p>
        <h1>Conecte seus canais</h1>
        <p className="muted">Escolha os marketplaces em que você vende. Você pode conectar ou remover canais depois em Configurações. No protótipo a conexão é simulada.</p>
        <ListaConectores conectados={conectados} alternar={alternar} />
        <div style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap' }}>
          <button className="btn grande" onClick={concluir}>{conectados.length ? 'Ir para o dashboard' : 'Pular por enquanto'} <Icon n="seta" size={16} /></button>
        </div>
      </div>
    </div>
  );
}
