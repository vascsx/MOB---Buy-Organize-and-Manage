import { useState, useEffect } from "react";

const API_URL = "http://localhost:8080";

export default function ProjecaoInvestimento() {
  const [mostrarSimulacao, setMostrarSimulacao] = useState(false);
  const [valorInicial, setValorInicial] = useState(1000);
  const [aporteMensal, setAporteMensal] = useState(0);
  const [taxaAno, setTaxaAno] = useState(10);
  const [anos, setAnos] = useState(5);
  const [aportesReais, setAportesReais] = useState([]); // [{mesAno, valor}]
  const [erro, setErro] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/investimentos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject("Erro ao buscar investimentos"))
      .then(data => setAportesReais(data))
      .catch(() => setAportesReais([]));
  }, []);

  let totalInvestido = 0;
  let totalAcao = 0, totalFixa = 0, totalCripto = 0;
  let mesesLabels = [];
  let detalhamento = [];
  if (aportesReais && aportesReais.length > 0) {
    mesesLabels = aportesReais.map(a => a.mesAno);
    detalhamento = aportesReais.map(a => {
      totalInvestido += a.total || 0;
      totalAcao += a.acao || 0;
      totalFixa += a.fixa || 0;
      totalCripto += a.cripto || 0;
      return {
        mesAno: a.mesAno,
        acao: a.acao || 0,
        fixa: a.fixa || 0,
        cripto: a.cripto || 0,
        total: a.total || 0
      };
    });
  }

  return (
    <div className="card" style={{ maxWidth: 600, margin: "32px auto" }}>
      <h3>Histórico de Aportes em Investimento</h3>
      {erro && <div style={{color:'red'}}>{erro}</div>}
      <div style={{marginTop:8, maxHeight:220, overflowY:'auto'}}>
        <table style={{fontSize:13, width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f3f4f6'}}>
              <th style={{textAlign:'left', padding:'4px 8px'}}>Mês/Ano</th>
              <th style={{textAlign:'right', padding:'4px 8px'}}>Ação</th>
              <th style={{textAlign:'right', padding:'4px 8px'}}>Renda Fixa</th>
              <th style={{textAlign:'right', padding:'4px 8px'}}>Cripto</th>
              <th style={{textAlign:'right', padding:'4px 8px'}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {detalhamento.length === 0 && (
              <tr><td colSpan={5} style={{textAlign:'center', color:'#888'}}>Nenhum aporte registrado</td></tr>
            )}
            {detalhamento.map((linha, i) => (
              <tr key={linha.mesAno} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:'4px 8px'}}>{linha.mesAno}</td>
                <td style={{padding:'4px 8px', textAlign:'right'}}>R$ {linha.acao.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{padding:'4px 8px', textAlign:'right'}}>R$ {linha.fixa.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{padding:'4px 8px', textAlign:'right'}}>R$ {linha.cripto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{padding:'4px 8px', textAlign:'right'}}>R$ {linha.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:16, fontWeight:'bold', fontSize:15}}>
        Total investido: R$ {totalInvestido.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>
        Ação: R$ {totalAcao.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Renda Fixa: R$ {totalFixa.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Cripto: R$ {totalCripto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <button style={{marginTop:24}} onClick={() => setMostrarSimulacao(v => !v)}>
        {mostrarSimulacao ? "Ocultar Simulação" : "Simular Projeção"}
      </button>
      {mostrarSimulacao && (
        <div style={{marginTop:24}}>
          <h4>Simulação de Projeção</h4>
          <form className="row" style={{ gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{display:'flex', flexDirection:'column', minWidth:140}}>
              <label style={{fontSize:13, marginBottom:2}}>Valor inicial (R$)</label>
              <input type="number" min="0" value={valorInicial} onChange={e => setValorInicial(e.target.value)} placeholder="Valor inicial" />
            </div>
            <div style={{display:'flex', flexDirection:'column', minWidth:140}}>
              <label style={{fontSize:13, marginBottom:2}}>Aporte mensal (R$)</label>
              <input type="number" min="0" value={aporteMensal} onChange={e => setAporteMensal(e.target.value)} placeholder="Aporte mensal" />
            </div>
            <div style={{display:'flex', flexDirection:'column', minWidth:140}}>
              <label style={{fontSize:13, marginBottom:2}}>% ao ano</label>
              <input type="number" min="0" value={taxaAno} onChange={e => setTaxaAno(e.target.value)} placeholder="% ao ano" />
            </div>
            <div style={{display:'flex', flexDirection:'column', minWidth:100}}>
              <label style={{fontSize:13, marginBottom:2}}>Anos</label>
              <input type="number" min="1" value={anos} onChange={e => setAnos(e.target.value)} placeholder="Anos" />
            </div>
          </form>
          {/* Aqui pode-se adicionar o gráfico e projeção futura se desejar */}
        </div>
      )}
    </div>
  );
}
