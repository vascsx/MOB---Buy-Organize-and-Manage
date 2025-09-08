import { useState } from "react";
export default function IncomeForm({ renda, setRenda, atualizarDadosDoMes }) {
  const [rendaInput, setRendaInput] = useState("");

  function getToken() {
    return localStorage.getItem("token") || "";
  }

  const handleRendaSubmit = async (e) => {
    e.preventDefault();
    const valor = parseFloat(rendaInput);
    if (valor <= 0) return;
    await fetch(`http://localhost:8080/renda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ mesAno: `${new Date().getMonth()}-${new Date().getFullYear()}`, renda: valor })
    });
    setRendaInput("");
    atualizarDadosDoMes();
  };

  return (
    <div className="card">
      <h3><i className="fas fa-money-bill-wave"></i> Renda do mês</h3>
      <form className="row income-form" onSubmit={handleRendaSubmit}>
        <div>
          <input
            type="number"
            placeholder="Valor da renda mensal (R$)"
            min="0"
            step="0.01"
            value={rendaInput}
            onChange={e => setRendaInput(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit" className="btn-income"><i className="fas fa-check"></i> Definir Renda</button>
        </div>
      </form>
      <div className="income-display">
        <span>Renda definida:</span>
        <span className="income-value">R$ {renda.toFixed(2)}</span>
      </div>
    </div>
  );
}
