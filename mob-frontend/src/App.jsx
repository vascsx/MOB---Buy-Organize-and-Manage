import { useState, useEffect } from "react";
import Header from "./components/Header";
import IncomeForm from "./components/IncomeForm";
import ExpensesTable from "./components/ExpensesTable";
import ExpenseForm from "./components/ExpenseForm";
import Charts from "./components/Charts";
import AuthForm from "./components/AuthForm";
import ProjecaoInvestimento from "./components/ProjecaoInvestimento";
import ImpostosTab from "./components/ImpostosTab";
import "./App.css";

const API_URL = "http://localhost:8080";

function getToken() {
  return localStorage.getItem("token") || "";
}

function App() {
  const [token, setToken] = useState(getToken());
  const [screen, setScreen] = useState("dashboard");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ income: 0, balance: 0, totals: {} });
  const [error, setError] = useState("");

  const monthYearKey = `${(month + 1).toString().padStart(2, "0")}-${year}`;

  async function refreshMonthData() {
    setError("");
    try {
    const respExpenses = await fetch(`${API_URL}/gastos/${monthYearKey}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!respExpenses.ok) throw new Error("Error fetching expenses");
    const monthExpenses = await respExpenses.json();
    setExpenses(monthExpenses || []);

    const respSummary = await fetch(`${API_URL}/resumo/${monthYearKey}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!respSummary.ok) throw new Error("Error fetching summary");
    const summaryData = await respSummary.json();
    // Map backend fields to frontend expected fields
    setSummary({
      income: summaryData.renda ?? 0,
      balance: summaryData.saldo ?? 0,
      totals: summaryData.totais ?? {},
    });
    } catch (e) {
      setError("Could not load data from backend. Showing empty interface.");
      setExpenses([]);
      setSummary({ income: 0, balance: 0, totals: {} });
    }
  }

  useEffect(() => {
    refreshMonthData();
  }, [month, year]);

  const removeExpense = async (i) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
    await fetch(`${API_URL}/gasto/${monthYearKey}/${i}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    refreshMonthData();
    } catch (e) {
      setError("Error removing expense.");
    }
  };

  const editExpense = async (i, updated) => {
    try {
    await fetch(`${API_URL}/gasto/${monthYearKey}/${i}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...updated,
        valor: Number(updated.amount ?? updated.valor ?? 0),
        categoria: updated.category ?? updated.categoria ?? "",
        descricao: updated.description ?? updated.descricao ?? ""
      })
    });
    refreshMonthData();
    } catch (e) {
      setError("Error editing expense.");
    }
  };

  if (!token) {
    return <AuthForm onAuth={tok => { setToken(tok); localStorage.setItem("token", tok); }} />;
  }

  async function registerTaxAsExpense({ mesAno, categoria, descricao, valor }) {
    try {
      await fetch(`${API_URL}/gasto`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mesAno,
          categoria,
          descricao,
          valor: Number(valor)
        })
      });
      refreshMonthData();
    } catch (e) {
      setError("Error registering tax as expense.");
    }
  }

  return (
    <div className="container">
      <button
        style={{ float: "right", margin: 8 }}
        onClick={() => { setToken(""); localStorage.removeItem("token"); }}
      >
        Logout
      </button>
      <nav style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <button onClick={() => setScreen("dashboard")}>Dashboard</button>
        <button onClick={() => setScreen("projection")}>Investment Projection</button>
        <button onClick={() => setScreen("taxes")}>Taxes (MEI/ME)</button>
      </nav>
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      {screen === "dashboard" && <>
        <Header month={month} setMonth={setMonth} year={year} setYear={setYear} />
        <div className="grid">
          <div>
            <IncomeForm
              renda={summary.income}
              setRenda={value => setSummary(s => ({ ...s, income: value }))}
              atualizarDadosDoMes={refreshMonthData}
            />
            <ExpenseForm refreshData={refreshMonthData} monthYear={monthYearKey} />
            <ExpensesTable expenses={expenses} removeExpense={removeExpense} editExpense={editExpense} />
          </div>
          <div>
            <Charts summary={summary} />
          </div>
        </div>
      </>}
    {screen === "projection" && <ProjecaoInvestimento />}
    {screen === "taxes" && <ImpostosTab onRegistrarGasto={registerTaxAsExpense} />}
      <footer>
        <p>Made for you to organize your finances ✨</p>
      </footer>
    </div>
  );
}

export default App;
