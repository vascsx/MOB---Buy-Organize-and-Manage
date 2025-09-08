export default function GastosTable({ gastos, removerGasto }) {
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
                <td><span className={`category-badge badge-${g.categoria.replace(" ", "").toLowerCase()}`}>{g.categoria}</span></td>
                <td>{g.descricao}</td>
                <td>R$ {g.valor.toFixed(2)}</td>
                <td className="actions">
                  <button className="small danger" onClick={() => removerGasto(i)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
