import { useState, useEffect } from "react";
import Header from "./components/Header";
import IncomeForm from "./components/IncomeForm";
import GastosTable from "./components/GastosTable";
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
  const [tela, setTela] = useState("dashboard");
  const [mes, setMes] = useState(new Date().getMonth());
  const [ano, setAno] = useState(new Date().getFullYear());
  const [gastos, setGastos] = useState([]);
  const [resumo, setResumo] = useState({ renda: 0, saldo: 0, totais: {} });
  const [erro, setErro] = useState("");

  const chaveMesAno = `${(mes+1).toString().padStart(2,'0')}-${ano}`;

  async function atualizarDadosDoMes() {
    setErro("");
    try {
      const respGastos = await fetch(`${API_URL}/gastos/${chaveMesAno}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!respGastos.ok) throw new Error("Erro ao buscar gastos");
      const gastosMes = await respGastos.json();
      setGastos(gastosMes || []);

      const respResumo = await fetch(`${API_URL}/resumo/${chaveMesAno}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      await fetch(`${API_URL}/gasto/${chaveMesAno}/${i}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      atualizarDadosDoMes();
    } catch (e) {
      setErro("Erro ao remover gasto.");
    }
  };

  const editarGasto = async (i, novo) => {
    try {
      await fetch(`${API_URL}/gasto/${chaveMesAno}/${i}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...novo, valor: Number(novo.valor) })
      });
      atualizarDadosDoMes();
    } catch (e) {
      setErro("Erro ao editar gasto.");
    }
  };

  if (!token) {
    return <AuthForm onAuth={tok => { setToken(tok); localStorage.setItem("token", tok); }} />;
  }

  async function registrarImpostoComoGasto({ mesAno, categoria, descricao, valor }) {
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
      atualizarDadosDoMes();
    } catch (e) {
      setErro("Erro ao registrar imposto como gasto.");
    }
  }

  return (
    <div className="container">
      <button style={{ float: "right", margin: 8 }} onClick={() => { setToken(""); localStorage.removeItem("token"); }}>Sair</button>
      <nav style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <button onClick={() => setTela("dashboard")}>Dashboard</button>
        <button onClick={() => setTela("projecao")}>Projeção de Investimento</button>
        <button onClick={() => setTela("impostos")}>Impostos (MEI/ME)</button>
      </nav>
      {erro && <div style={{ color: "red", marginBottom: 16 }}>{erro}</div>}
      {tela === "dashboard" && <>
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
      </>}
      {tela === "projecao" && <ProjecaoInvestimento />}
      {tela === "impostos" && <ImpostosTab onRegistrarGasto={registrarImpostoComoGasto} />}
      <footer>
        <p>Feito para você organizar suas finanças ✨</p>
      </footer>
    </div>
  );
}

export default App;
