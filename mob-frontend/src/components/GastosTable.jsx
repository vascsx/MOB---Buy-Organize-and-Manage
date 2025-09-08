import { useState } from "react";

const categorias = ["Custo Fixo", "Custo Variável", "Reserva", "Investimento"];

export default function GastosTable({ gastos, removerGasto, editarGasto }) {
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ categoria: "", descricao: "", valor: "" });

  const startEdit = (g, i) => {
    setEditIndex(i);
    setEditData({ categoria: g.categoria, descricao: g.descricao, valor: g.valor });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(d => ({ ...d, [name]: value }));
  };

  const handleEditSave = () => {
    editarGasto(editIndex, editData);
    setEditIndex(null);
  };

  const handleEditCancel = () => {
    setEditIndex(null);
  };

  return (
    <div className="card">
      <h3><i className="fas fa-table"></i> Todos os gastos</h3>
      {gastos.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-receipt"></i>
          <p>Nenhum gasto registrado este mês</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Valor (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((g, i) => (
              <tr key={i}>
                {editIndex === i ? (
                  <>
                    <td>
                      <select name="categoria" value={editData.categoria} onChange={handleEditChange}>
                        {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </td>
                    <td><input name="descricao" value={editData.descricao} onChange={handleEditChange} /></td>
                    <td><input name="valor" type="number" value={editData.valor} onChange={handleEditChange} /></td>
                    <td className="actions">
                      <button className="small success" onClick={handleEditSave}><i className="fas fa-check"></i></button>
                      <button className="small danger" onClick={handleEditCancel}><i className="fas fa-times"></i></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td><span className={`category-badge badge-${g.categoria.replace(" ", "").toLowerCase()}`}>{g.categoria}</span></td>
                    <td>{g.descricao}</td>
                    <td>R$ {g.valor.toFixed(2)}</td>
                    <td className="actions">
                      <button className="small" onClick={() => startEdit(g, i)}><i className="fas fa-pen"></i></button>
                      <button className="small danger" onClick={() => removerGasto(i)}><i className="fas fa-trash"></i></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
