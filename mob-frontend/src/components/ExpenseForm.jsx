import { useState } from "react";

const API_URL = "http://localhost:8080";

export default function ExpenseForm({ atualizarDados, mesAno }) {
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoria || !descricao || valor <= 0) return;

    await fetch(`${API_URL}/gasto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesAno, categoria, descricao, valor: Number(valor) })
    });

    setCategoria(""); setDescricao(""); setValor("");
    atualizarDados();
  };

  return (
    <div className="card">
      <h3><i className="fas fa-plus-circle"></i> Adicionar gasto</h3>
      <form className="row" onSubmit={handleSubmit}>
        <div>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} required>
            <option value="">Selecione uma categoria</option>
            <option value="Custo Fixo">Custo Fixo</option>
            <option value="Custo Variável">Custo Variável</option>
            <option value="Reserva">Reserva</option>
            <option value="Investimento">Investimento</option>
          </select>
        </div>
        <div><input placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} required /></div>
        <div><input type="number" placeholder="Valor (R$)" value={valor} onChange={e => setValor(e.target.value)} required /></div>
        <div><button type="submit"><i className="fas fa-plus"></i> Adicionar</button></div>
      </form>
    </div>
  );
}
