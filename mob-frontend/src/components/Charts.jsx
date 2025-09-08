import { Pie, Doughnut, Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";

export default function Charts({ summary }) {
  const categories = Object.keys(summary.totals || {});
  const values = Object.values(summary.totals || {});
  const totalExpenses = values.reduce((a, b) => a + b, 0);

  const [monthlyTotals, setMonthlyTotals] = useState(Array(12).fill(0));

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const token = localStorage.getItem("token") || "";
    fetch(`http://localhost:8080/gastos-anuais/${currentYear}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.totals) setMonthlyTotals(data.totals);
      });
  }, []);

  const pieData = {
    labels: categories,
    datasets: [
      { data: values, backgroundColor: ["#7c3aed","#3b82f6","#16a34a","#f59e0b"] }
    ]
  };

  const doughnutData = {
    labels: ["Income","Expenses"],
    datasets: [{ data: [summary.income, totalExpenses], backgroundColor: ["#10b981","#ef4444"] }]
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const barData = {
    labels: months,
    datasets: [{ label: "Total Expenses", data: monthlyTotals, backgroundColor: "#3b82f6" }]
  };

  return (
    <div className="card">
      <h3><i className="fas fa-chart-pie"></i> Monthly Summary</h3>
      <div className="chip balance">
        <span className="muted">Available Balance:</span>
        <span className={`value ${summary.balance >= 0 ? "balance-positive" : "balance-negative"}`}>
          ${(typeof summary.balance === 'number' && !isNaN(summary.balance) ? summary.balance : 0).toFixed(2)}
        </span>
      </div>

      <div className="totals">
        <div className="chip total-expenses">
          <span className="muted">Total Expenses</span>
          <span className="value">${totalExpenses.toFixed(2)}</span>
        </div>
        {categories.map((cat, i) => (
          <div className={`chip ${cat.replace(" ","").toLowerCase()}`} key={i}>
            <span className="muted">{cat}</span>
            <span className="value">${values[i].toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart-wrapper">
          <div className="chart-title">Category Distribution</div>
          <Pie data={pieData} />
        </div>
        <div className="chart-wrapper">
          <div className="chart-title">Income vs Expenses</div>
          <Doughnut data={doughnutData} />
        </div>
        <div className="chart-wrapper">
          <div className="chart-title">Monthly Comparison</div>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
}
