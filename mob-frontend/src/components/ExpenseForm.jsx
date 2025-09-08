import { useState } from "react";

const API_URL = "http://localhost:8080";

export default function ExpenseForm({ refreshData, monthYear }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  function getToken() {
    return localStorage.getItem("token") || "";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !description || amount <= 0) return;

    await fetch(`${API_URL}/expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ monthYear, category, description, amount: Number(amount) })
    });

    setCategory("");
    setDescription("");
    setAmount("");
    refreshData();
  };

  return (
    <div className="card">
      <h3><i className="fas fa-plus-circle"></i> Add Expense</h3>
      <form className="row" onSubmit={handleSubmit}>
        <div>
          <select value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">Select a category</option>
            <option value="Fixed Cost">Fixed Cost</option>
            <option value="Variable Cost">Variable Cost</option>
            <option value="Savings">Savings</option>
            <option value="Investment">Investment</option>
          </select>
        </div>
        <div>
          <input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Amount ($)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <button type="submit">
            <i className="fas fa-plus"></i> Add
          </button>
        </div>
      </form>
    </div>
  );
}
