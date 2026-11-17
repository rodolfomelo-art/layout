import { PRODUTO } from '../brand.js';
// Logotipo Tempt BI: selo com o "T" + palavra TEMPT em peso forte e BI em destaque,
// seguindo a estrutura do logotipo da Tempt Tecnologia (TEMPT forte + complemento).
export default function Marca({ onClick, href = '#inicio', assinatura = true }) {
  return (
    <a className="marca" href={href} onClick={onClick} aria-label={`${PRODUTO.nome} ${PRODUTO.destaque}, início`}>
      <svg className="selo" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="1.5" y="1.5" width="37" height="37" rx="9" className="selo-fundo" />
        <path d="M11 12.5h18M20 12.5v15" className="selo-t" />
        <circle cx="29" cy="27.5" r="2.6" className="selo-ponto" />
      </svg>
      <div>
        <b><span className="w1">{PRODUTO.nome.toUpperCase()}</span><span className="w2">{PRODUTO.destaque}</span></b>
        {assinatura && <small>{PRODUTO.assinatura}</small>}
      </div>
    </a>
  );
}
