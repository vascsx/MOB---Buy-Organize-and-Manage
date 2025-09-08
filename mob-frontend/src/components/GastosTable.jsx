import { useState } from "react";

const categories = ["Fixed Cost", "Variable Cost", "Savings", "Investment"];

export default function ExpensesTable({ expenses, removeExpense, editExpense }) {
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ category: "", description: "", amount: "" });

  const startEdit = (e, i) => {
    setEditIndex(i);
    setEditData({ category: e.category, description: e.description, amount: e.amount });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(d => ({ ...d, [name]: value }));
  };

  const handleEditSave = () => {
    editExpense(editIndex, editData);
    setEditIndex(null);
  };

  const handleEditCancel = () => {
    setEditIndex(null);
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
            {expenses.map((e, i) => (
              <tr key={i}>
                {editIndex === i ? (
                  <>
                    <td>
                      <select name="category" value={editData.category} onChange={handleEditChange}>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </td>
                    <td><input name="description" value={editData.description} onChange={handleEditChange} /></td>
                    <td><input name="amount" type="number" value={editData.amount} onChange={handleEditChange} /></td>
                    <td className="actions">
                      <button className="small success" onClick={handleEditSave}><i className="fas fa-check"></i></button>
                      <button className="small danger" onClick={handleEditCancel}><i className="fas fa-times"></i></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td><span className={`category-badge badge-${e.category.replace(" ", "").toLowerCase()}`}>{e.category}</span></td>
                    <td>{e.description}</td>
                    <td>${e.amount.toFixed(2)}</td>
                    <td className="actions">
                      <button className="small" onClick={() => startEdit(e, i)}><i className="fas fa-pen"></i></button>
                      <button className="small danger" onClick={() => removeExpense(i)}><i className="fas fa-trash"></i></button>
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
