import { Pie, Doughnut, Bar } from "react-chartjs-2";

export default function Charts({ resumo }) {
  const categorias = Object.keys(resumo.totais || {});
  const valores = Object.values(resumo.totais || {});
  const totalGastos = valores.reduce((a,b) => a+b, 0);

  const pieData = { labels: categorias, datasets: [{ data: valores, backgroundColor: ["#7c3aed","#3b82f6","#16a34a","#f59e0b"] }] };
  const doughnutData = { labels: ["Renda","Gastos"], datasets: [{ data: [resumo.renda,totalGastos], backgroundColor:["#10b981","#ef4444"] }] };
  const barData = { labels: categorias, datasets: [{ label: "Gastos", data: valores, backgroundColor: ["#7c3aed","#3b82f6","#16a34a","#f59e0b"] }] };

  return (
    <div className="card">
      <h3><i className="fas fa-chart-pie"></i> Resumo do mês</h3>
      <div className="chip saldo">
        <span className="muted">Saldo disponível:</span>
        <span className={`value ${resumo.saldo >= 0 ? "saldo-positive" : "saldo-negative"}`}>R$ {resumo.saldo.toFixed(2)}</span>
      </div>

      <div className="totals">
        <div className="chip total-gastos"><span className="muted">Total de Gastos</span><span className="value">R$ {totalGastos.toFixed(2)}</span></div>
        {categorias.map((cat,i) => (
          <div className={`chip ${cat.replace(" ","").toLowerCase()}`} key={i}>
            <span className="muted">{cat}</span>
            <span className="value">R$ {valores[i].toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart-wrapper"><div className="chart-title">Distribuição por Categoria</div><Pie data={pieData} /></div>
        <div className="chart-wrapper"><div className="chart-title">Renda vs Gastos</div><Doughnut data={doughnutData} /></div>
        <div className="chart-wrapper"><div className="chart-title">Comparativo Mensal</div><Bar data={barData} /></div>
      </div>
    </div>
  );
}
