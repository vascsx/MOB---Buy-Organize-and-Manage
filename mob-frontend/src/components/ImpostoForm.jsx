import { useState } from "react";

const SALARIO_MINIMO_2025 = 1412;
const MEI_DEFAULT = {
  inss: SALARIO_MINIMO_2025 * 0.05,
  iss: 5.0,
  icms: 1.0
};


export default function ImpostoForm({ onRegistrarGasto }) {
  const [tipo, setTipo] = useState("mei");
  const [atividade, setAtividade] = useState("comercio"); // comercio, servico, ambos
  const [faturamento, setFaturamento] = useState(0);
  const [mesAno, setMesAno] = useState(() => {
    const d = new Date();
    return `${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}`;
  });
  const [valor, setValor] = useState(0);
  const [desc, setDesc] = useState("");
  const [ok, setOk] = useState("");
  // Para ME
  const [rbt12, setRbt12] = useState(0); // Receita Bruta 12 meses
  const [aliquotaNominal, setAliquotaNominal] = useState(0.06); // Exemplo: 6%
  const [parcelaDeduzir, setParcelaDeduzir] = useState(0);

  function calcular() {
    if (tipo === "mei") {
      let total = MEI_DEFAULT.inss;
      let descricao = "Imposto MEI: INSS";
      if (atividade === "comercio") {
        total += MEI_DEFAULT.icms;
        descricao += "+ICMS";
      } else if (atividade === "servico") {
        total += MEI_DEFAULT.iss;
        descricao += "+ISS";
      } else if (atividade === "ambos") {
        total += MEI_DEFAULT.icms + MEI_DEFAULT.iss;
        descricao += "+ICMS+ISS";
      }
      setValor(total);
      setDesc(descricao);
    } else if (tipo === "me") {
      // ME: Simples Nacional
      // Alíquota Efetiva = ((RBT12 x Alíquota Nominal) - Parcela a Deduzir) / RBT12
      if (!rbt12 || !aliquotaNominal) {
        setValor(0);
        setDesc("");
        return;
      }
      const aliquotaEfetiva = ((rbt12 * aliquotaNominal) - parcelaDeduzir) / rbt12;
      const imposto = faturamento * aliquotaEfetiva;
      setValor(imposto);
      setDesc(`Imposto ME (Simples Nacional) - Alíquota Efetiva: ${(aliquotaEfetiva*100).toFixed(2)}%`);
    }
  }

  async function registrar() {
    if (!valor || valor <= 0) return;
    await onRegistrarGasto({
      mesAno,
      categoria: "Imposto",
      descricao: desc,
      valor: Number(valor)
    });
    setOk("Imposto registrado como gasto!");
    setTimeout(() => setOk(""), 2000);
  }

  return (
    <div className="card" style={{maxWidth:500, margin:"32px auto"}}>
      <h3>Pay Tax</h3>
      <div style={{display:'flex', gap:8, marginBottom:8, flexWrap:'wrap'}}>
        <select value={tipo} onChange={e => setTipo(e.target.value)}>
          <option value="mei">MEI</option>
          <option value="me">ME</option>
        </select>
        <input type="text" value={mesAno} onChange={e => setMesAno(e.target.value)} style={{width:90}} placeholder="MM-AAAA" />
      </div>
      {tipo === "mei" && (
        <div style={{marginBottom:8}}>
          <label>Atividade:&nbsp;
            <select value={atividade} onChange={e => setAtividade(e.target.value)}>
              <option value="comercio">Commerce</option>
              <option value="servico">Service</option>
              <option value="ambos">Commerce + Service</option>
            </select>
          </label>
          <div style={{fontSize:13, color:'#555', marginTop:4}}>
            INSS: R$ {MEI_DEFAULT.inss.toFixed(2)} | ISS: R$ {MEI_DEFAULT.iss.toFixed(2)} | ICMS: R$ {MEI_DEFAULT.icms.toFixed(2)}<br/>
            Fixed value, regardless of monthly revenue (up to R$ 81,000/year)
          </div>
        </div>
      )}
      {tipo === "me" && (
        <div style={{marginBottom:8}}>
          <input type="number" min="0" value={faturamento} onChange={e => setFaturamento(Number(e.target.value))} placeholder="Faturamento do mês" style={{width:150}} />
          <input type="number" min="0" value={rbt12} onChange={e => setRbt12(Number(e.target.value))} placeholder="RBT12 (últimos 12 meses)" style={{width:180}} />
          <input type="number" min="0" step="0.0001" value={aliquotaNominal} onChange={e => setAliquotaNominal(Number(e.target.value))} placeholder="Alíquota Nominal (ex: 0.06)" style={{width:120}} />
          <input type="number" min="0" value={parcelaDeduzir} onChange={e => setParcelaDeduzir(Number(e.target.value))} placeholder="Parcela a Deduzir" style={{width:120}} />
          <div style={{fontSize:13, color:'#555', marginTop:4}}>
            Effective Rate = ((RBT12 × Nominal Rate) - Deductible Portion) / RBT12<br/>
            Example: Nominal Rate 6% = 0.06
          </div>
        </div>
      )}
      <button onClick={calcular} style={{marginBottom:8}}>Calcular imposto</button>
      {valor > 0 && (
        <div style={{marginBottom:8}}>
          <b>Tax amount:</b> R$ {valor.toLocaleString(undefined, {minimumFractionDigits:2})} <br/>
          <b>Description:</b> {desc}
        </div>
      )}
      <button onClick={registrar} disabled={!valor || valor <= 0}>Registrar como gasto</button>
      {ok && <div style={{color:'green', marginTop:8}}>{ok}</div>}
    </div>
  );
}
