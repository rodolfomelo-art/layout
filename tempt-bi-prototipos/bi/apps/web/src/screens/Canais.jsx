import { ListaConectores } from '../site/Conectar.jsx';
import { Card } from '../components/ui.jsx';

export default function Canais({ conectados, alternar }) {
  return (<>
    <Card titulo="Marketplaces" sub="As cargas rodam todo dia às 06:00. Desconectar não apaga o histórico já importado.">
      <ListaConectores conectados={conectados} alternar={alternar} />
    </Card>
    <Card titulo="Custos dos produtos" sub="Necessário para calcular a margem real">
      <p style={{ margin: 0 }}>No protótipo os custos já estão preenchidos. No produto você importa uma planilha com SKU e custo unitário, ou conecta o ERP.</p>
    </Card>
  </>);
}
