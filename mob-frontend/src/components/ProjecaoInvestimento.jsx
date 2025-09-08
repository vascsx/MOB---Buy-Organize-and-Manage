import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

const API_URL = "http://localhost:8080";

export default function ProjecaoInvestimento() {
  const [taxaAno, setTaxaAno] = useState(10); // Único campo ajustável
  const [aportesReais, setAportesReais] = useState([]); 
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
  let aportes = [];
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
    aportes = aportesReais.map(a => a.total || 0);
  }

  let saldo = 0;
  const saldoPorMes = [];
  const taxaMes = Math.pow(1 + taxaAno / 100, 1 / 12) - 1;
  for (let i = 0; i < aportes.length; i++) {
    saldo = saldo * (1 + taxaMes) + aportes[i];
    saldoPorMes.push(saldo);
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
      <div style={{marginTop:32}}>
        <h4>Projeção do saldo acumulado (base histórica)</h4>
        <div style={{display:'flex', alignItems:'center', gap:16, flexWrap:'wrap'}}>
          <label style={{fontSize:13}}>Taxa anual de rendimento (%):</label>
          <input type="number" min="0" value={taxaAno} onChange={e => setTaxaAno(e.target.value)} style={{width:80}} />
        </div>
        <div style={{marginTop:16}}>
          <Line
            data={{
              labels: mesesLabels,
              datasets: [
                {
                  label: "Saldo acumulado",
                  data: saldoPorMes,
                  borderColor: "#16a34a",
                  backgroundColor: "rgba(22,163,74,0.1)",
                  fill: true,
                  tension: 0.2
                }
              ]
            }}
          />
        </div>
        <div style={{marginTop:16, fontSize:15}}>
          <b>Saldo final projetado:</b> R$ {saldoPorMes.length > 0 ? saldoPorMes[saldoPorMes.length-1].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
        </div>
      </div>
    </div>
  );
}
