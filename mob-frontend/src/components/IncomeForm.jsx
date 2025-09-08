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
    const now = new Date();
    const mesAno = `${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getFullYear()}`;
    await fetch(`http://localhost:8080/renda`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ mesAno, renda: valor })
    });
    setRendaInput("");
    atualizarDadosDoMes();
  };

  return (
    <div className="card">
      <h3><i className="fas fa-money-bill-wave"></i> Monthly Income</h3>
      <form className="row income-form" onSubmit={handleRendaSubmit}>
        <div>
          <input
            type="number"
            placeholder="Monthly income amount (R$)"
            min="0"
            step="0.01"
            value={rendaInput}
            onChange={e => setRendaInput(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit" className="btn-income"><i className="fas fa-check"></i> Set Income</button>
        </div>
      </form>
      <div className="income-display">
        <span>Defined income:</span>
        <span className="income-value">R$ {(typeof renda === 'number' && !isNaN(renda) ? renda : 0).toFixed(2)}</span>
      </div>
    </div>
  );
}
