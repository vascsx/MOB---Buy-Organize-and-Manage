export default function Header({ mes, setMes, ano, setAno }) {
  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                 "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const anos = [];
  const anoAtual = new Date().getFullYear();
  for (let i = anoAtual - 5; i <= anoAtual + 1; i++) anos.push(i);

  return (
    <header>
      <div>
        <h1><i className="fas fa-wallet"></i> Controle Financeiro Mensal</h1>
        <p className="lead">Organize seus custos fixos, variáveis, reservas e investimentos</p>
      </div>
      <div className="period-selector">
        <i className="fas fa-calendar"></i>
        <select value={mes} onChange={(e) => setMes(parseInt(e.target.value))}>
          {meses.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={ano} onChange={(e) => setAno(parseInt(e.target.value))}>
          {anos.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </header>
  );
}
