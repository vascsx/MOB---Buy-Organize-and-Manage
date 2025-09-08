import { useState, useEffect } from "react";
import Header from "./components/Header";
import IncomeForm from "./components/IncomeForm";
import GastosTable from "./components/GastosTable";
import ExpenseForm from "./components/ExpenseForm";
import Charts from "./components/Charts";
import "./App.css";

const API_URL = "http://localhost:8080";

function App() {
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [gastos, setGastos] = useState([]);
  const [resumo, setResumo] = useState({ renda: 0, saldo: 0, totais: {} });
  const [erro, setErro] = useState("");

  const chaveMesAno = `${mes}-${ano}`;

  async function atualizarDadosDoMes() {
    setErro("");
    try {
      const respGastos = await fetch(`${API_URL}/gastos/${chaveMesAno}`);
      if (!respGastos.ok) throw new Error("Erro ao buscar gastos");
      const gastosMes = await respGastos.json();
      setGastos(gastosMes || []);

      const respResumo = await fetch(`${API_URL}/resumo/${chaveMesAno}`);
      if (!respResumo.ok) throw new Error("Erro ao buscar resumo");
      const resumoData = await respResumo.json();
      setResumo(resumoData || { renda: 0, saldo: 0, totais: {} });
    } catch (e) {
      setErro("Não foi possível carregar dados do backend. Exibindo interface vazia.");
      setGastos([]);
      setResumo({ renda: 0, saldo: 0, totais: {} });
    }
  }

  useEffect(() => {
    atualizarDadosDoMes();
  }, [mes, ano]);


  const removerGasto = async (i) => {
    if (!window.confirm("Tem certeza que deseja excluir este item?")) return;
    try {
      await fetch(`${API_URL}/gasto/${chaveMesAno}/${i}`, { method: "DELETE" });
      atualizarDadosDoMes();
    } catch (e) {
      setErro("Erro ao remover gasto.");
    }
  };

  const editarGasto = async (i, novo) => {
    try {
      await fetch(`${API_URL}/gasto/${chaveMesAno}/${i}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...novo,
          valor: Number(novo.valor)
        })
      });
      atualizarDadosDoMes();
    } catch (e) {
      setErro("Erro ao editar gasto.");
    }
  };

  return (
    <div className="container">
      {erro && <div style={{ color: "red", marginBottom: 16 }}>{erro}</div>}
      <Header mes={mes} setMes={setMes} ano={ano} setAno={setAno} />
      <div className="grid">
        <div>
          <IncomeForm renda={resumo.renda} setRenda={valor => setResumo(r => ({ ...r, renda: valor }))} atualizarDadosDoMes={atualizarDadosDoMes} />
          <ExpenseForm atualizarDados={atualizarDadosDoMes} mesAno={chaveMesAno} />
          <GastosTable gastos={gastos} removerGasto={removerGasto} editarGasto={editarGasto} />
        </div>
        <div>
          <Charts resumo={resumo} />
        </div>
      </div>
      <footer>
        <p>Feito para você organizar suas finanças ✨</p>
      </footer>
    </div>
  );
}

export default App;
