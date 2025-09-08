const API_URL = "http://localhost:8080";

export default function ExpenseTable({ gastos, atualizarDados, mesAno }) {
  function getToken() {
    return localStorage.getItem("token") || "";
  }

  const remover = async (index) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    await fetch(`${API_URL}/gasto/${mesAno}/${index}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    atualizarDados();
  };

  return (
    <div className="card">
      <h3><i className="fas fa-table"></i> Todos os gastos</h3>
      {gastos.length === 0 ? (
        <div className="empty-state"><i className="fas fa-receipt"></i><p>Nenhum gasto registrado este mês</p></div>
      ) : (
        <table>
          <thead>
            <tr><th>Categoria</th><th>Descrição</th><th>Valor (R$)</th><th>Ações</th></tr>
          </thead>
          <tbody>
            {gastos.map((item, i) => {
              let badgeClass = "";
              if (item.categoria === "Custo Fixo") badgeClass = "badge-fixo";
              else if (item.categoria === "Custo Variável") badgeClass = "badge-variavel";
              else if (item.categoria === "Reserva") badgeClass = "badge-reserva";
              else if (item.categoria === "Investimento") badgeClass = "badge-investimento";

              return (
                <tr key={i}>
                  <td><span className={`category-badge ${badgeClass}`}>{item.categoria}</span></td>
                  <td>{item.descricao}</td>
                  <td>R$ {item.valor.toFixed(2)}</td>
                  <td className="actions">
                    <button className="small danger" onClick={() => remover(i)}><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
