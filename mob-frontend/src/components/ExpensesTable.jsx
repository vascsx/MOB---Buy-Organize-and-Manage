const API_URL = "http://localhost:8080";

export default function ExpenseTable({ expenses, refreshData, monthYear }) {
  function getToken() {
    return localStorage.getItem("token") || "";
  }

  const removeExpense = async (index) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await fetch(`${API_URL}/expense/${monthYear}/${index}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    refreshData();
  };

  return (
    <div className="card">
      <h3><i className="fas fa-table"></i> All Expenses</h3>
      {expenses.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-receipt"></i>
          <p>No expenses recorded this month</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Amount ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item, i) => {
              let badgeClass = "";
              if (item.category === "Fixed Cost") badgeClass = "badge-fixed";
              else if (item.category === "Variable Cost") badgeClass = "badge-variable";
              else if (item.category === "Savings") badgeClass = "badge-savings";
              else if (item.category === "Investment") badgeClass = "badge-investment";

              return (
                <tr key={i}>
                  <td><span className={`category-badge ${badgeClass}`}>{item.category}</span></td>
                  <td>{item.description}</td>
                  <td>${(typeof item.amount === 'number' && !isNaN(item.amount) ? item.amount : 0).toFixed(2)}</td>
                  <td className="actions">
                    <button className="small danger" onClick={() => removeExpense(i)}>
                      <i className="fas fa-trash"></i>
                    </button>
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
