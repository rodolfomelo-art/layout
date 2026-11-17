import { useState } from 'react';
import Icon from '../components/icons.jsx';
import Marca from '../components/Marca.jsx';

function PainelMarca() {
  return (
    <div className="auth-esq navy">
      <Marca href="#inicio" />
      <p className="eyebrow" style={{ marginTop: '2.2rem' }}>O lucro começa antes da venda</p>
      <h1>Vendas claras. Margem <em>real</em>.</h1>
      <p className="lead">Mercado Livre, Amazon e Shopee em um só painel, com o que sobra de cada venda.</p>
      <div className="pe">
        <div className="avatares"><i className="bg-ml">ML</i><i className="bg-amz">AZ</i><i className="bg-shp">SP</i></div>
        Três canais, um só número
      </div>
    </div>
  );
}

function Campo({ id, rot, tipo = 'text', valor, set, erro, auto, ...rest }) {
  const [ver, setVer] = useState(false);
  const senha = tipo === 'password';
  return (
    <div className="campo">
      <label htmlFor={id}>{rot}</label>
      <div className="caixa">
        <input id={id} type={senha && ver ? 'text' : tipo} value={valor} onChange={e => set(e.target.value)} autoComplete={auto}
          aria-invalid={!!erro} aria-describedby={erro ? id + '-erro' : undefined} {...rest} />
        {senha && <button type="button" className="olho" onClick={() => setVer(v => !v)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}><Icon n="olho" size={17} /></button>}
      </div>
      {erro && <div className="erro" id={id + '-erro'}>{erro}</div>}
    </div>
  );
}

const soDig = v => v.replace(/\D/g, '');
const mascaraCnpj = v => soDig(v).slice(0, 14).replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
const mascaraTel = v => soDig(v).slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');

export function Cadastro({ ir, onCriar }) {
  const [passo, setPasso] = useState(1);
  const [d, setD] = useState({ nome: '', email: '', empresa: '', cnpj: '', tel: '' });
  const [tentou, setTentou] = useState(false);
  const [s1, setS1] = useState(''), [s2, setS2] = useState('');
  const [termos, setTermos] = useState(false), [idade, setIdade] = useState(false);
  const set = k => v => setD(x => ({ ...x, [k]: k === 'cnpj' ? mascaraCnpj(v) : k === 'tel' ? mascaraTel(v) : v }));
  const erros = {
    nome: d.nome.trim().length < 3 && 'Informe seu nome completo.',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) && 'Informe um e-mail válido.',
    empresa: !d.empresa.trim() && 'Informe o nome da empresa.',
    cnpj: soDig(d.cnpj).length !== 14 && 'O CNPJ tem 14 dígitos.',
  };
  const ok1 = !Object.values(erros).some(Boolean);
  const reqs = [['Mínimo 8 caracteres', s1.length >= 8], ['Ao menos uma letra', /[a-zA-Z]/.test(s1)], ['Ao menos um número', /\d/.test(s1)]];
  const forca = reqs.filter(r => r[1]).length;
  const ok2 = forca === 3 && s1 === s2 && termos && idade;
  return (
    <div className="auth">
      <PainelMarca />
      <div className="auth-dir">
        <p className="eyebrow">Crie sua conta</p>
        <h1>Comece agora</h1>
        <p className="sub">Cadastro em duas etapas, exclusivo para empresas.</p>
        <div className="passos" aria-label={`Etapa ${passo} de 2`}>
          <span className={`p ${passo > 1 ? 'feito' : 'atual'}`}><span className="n">{passo > 1 ? <Icon n="check" size={13} /> : 1}</span>Seus dados</span>
          <span className="traco" />
          <span className={`p ${passo === 2 ? 'atual' : ''}`}><span className="n">2</span>Senha</span>
        </div>
        {passo === 1 ? (
          <form className="form" noValidate onSubmit={e => { e.preventDefault(); setTentou(true); if (ok1) setPasso(2); }}>
            <Campo id="nome" rot="Nome completo" valor={d.nome} set={set('nome')} auto="name" erro={tentou && erros.nome} />
            <Campo id="email" rot="E-mail corporativo" tipo="email" valor={d.email} set={set('email')} auto="email" erro={tentou && erros.email} />
            <div className="campos2">
              <Campo id="empresa" rot="Empresa" valor={d.empresa} set={set('empresa')} auto="organization" erro={tentou && erros.empresa} />
              <Campo id="cnpj" rot="CNPJ" valor={d.cnpj} set={set('cnpj')} inputMode="numeric" placeholder="00.000.000/0000-00" erro={tentou && erros.cnpj} />
            </div>
            <Campo id="tel" rot="Telefone (opcional)" valor={d.tel} set={set('tel')} inputMode="tel" auto="tel" placeholder="(11) 90000-0000" />
            <button className="btn bloco grande" type="submit">Continuar <Icon n="seta" size={16} /></button>
            <p className="centro small muted">Já tem conta? <a className="link" href="#entrar" onClick={e => { e.preventDefault(); ir('entrar'); }}>Entrar</a></p>
          </form>
        ) : (
          <form className="form" noValidate onSubmit={e => { e.preventDefault(); if (ok2) onCriar(d); }}>
            <div>
              <Campo id="senha" rot="Senha" tipo="password" valor={s1} set={setS1} auto="new-password" />
              <ul className="reqs">{reqs.map(([t, v]) => <li key={t} className={v ? 'ok' : ''}><span className="bola">{v && <Icon n="check" size={10} />}</span>{t}</li>)}</ul>
              <div className="forca" aria-label={`Força da senha: ${forca} de 3`}>{[1, 2, 3].map(i => <i key={i} className={i <= forca ? `on${forca}` : ''} />)}</div>
            </div>
            <Campo id="senha2" rot="Confirmar senha" tipo="password" valor={s2} set={setS2} auto="new-password" erro={s2 && s1 !== s2 && 'As senhas não são iguais.'} />
            <label className="check-row"><input type="checkbox" checked={termos} onChange={e => setTermos(e.target.checked)} />
              <span>Li e aceito os <a href="#cadastro">Termos</a> e a <a href="#cadastro">Política de Privacidade</a>.</span></label>
            <label className="check-row"><input type="checkbox" checked={idade} onChange={e => setIdade(e.target.checked)} /><span>Declaro ter 18 anos ou mais.</span></label>
            <button className="btn bloco grande" type="submit" disabled={!ok2}>Criar conta <Icon n="seta" size={16} /></button>
            <p className="centro"><button type="button" className="link" onClick={() => setPasso(1)}>Voltar</button></p>
          </form>
        )}
      </div>
    </div>
  );
}

export function Entrar({ ir, onEntrar }) {
  const [email, setEmail] = useState(''), [senha, setSenha] = useState('');
  return (
    <div className="auth">
      <PainelMarca />
      <div className="auth-dir">
        <p className="eyebrow">Bem-vindo de volta</p>
        <h1>Entrar</h1>
        <p className="sub">No protótipo, qualquer e-mail e senha abrem a conta de demonstração com os três canais.</p>
        <form className="form" onSubmit={e => { e.preventDefault(); onEntrar(); }}>
          <Campo id="login-email" rot="E-mail" tipo="email" valor={email} set={setEmail} auto="email" />
          <Campo id="login-senha" rot="Senha" tipo="password" valor={senha} set={setSenha} auto="current-password" />
          <button className="btn bloco grande" type="submit">Entrar <Icon n="seta" size={16} /></button>
          <p className="centro small muted">Ainda não tem conta? <a className="link" href="#cadastro" onClick={e => { e.preventDefault(); ir('cadastro'); }}>Criar conta</a></p>
        </form>
      </div>
    </div>
  );
}
