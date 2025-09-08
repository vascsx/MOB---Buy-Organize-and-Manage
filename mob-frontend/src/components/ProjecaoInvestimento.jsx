import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

const API_URL = "http://localhost:8080";

export default function InvestmentProjection() {
  const [annualRate, setAnnualRate] = useState(10); 
  const [actualInvestments, setActualInvestments] = useState([]); 
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/investments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject("Error fetching investments"))
      .then(data => setActualInvestments(data))
      .catch(() => setActualInvestments([]));
  }, []);

  let totalInvested = 0;
  let totalStock = 0, totalFixed = 0, totalCrypto = 0;
  let monthLabels = [];
  let details = [];
  let contributions = [];
  if (actualInvestments && actualInvestments.length > 0) {
    monthLabels = actualInvestments.map(a => a.monthYear);
    details = actualInvestments.map(a => {
      totalInvested += a.total || 0;
      totalStock += a.stock || 0;
      totalFixed += a.fixed || 0;
      totalCrypto += a.crypto || 0;
      return {
        monthYear: a.monthYear,
        stock: a.stock || 0,
        fixed: a.fixed || 0,
        crypto: a.crypto || 0,
        total: a.total || 0
      };
    });
    contributions = actualInvestments.map(a => a.total || 0);
  }

  let balance = 0;
  const balancePerMonth = [];
  const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
  for (let i = 0; i < contributions.length; i++) {
    balance = balance * (1 + monthlyRate) + contributions[i];
    balancePerMonth.push(balance);
  }

  return (
    <div className="card" style={{ maxWidth: 600, margin: "32px auto" }}>
      <h3>Investment Contribution History</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginTop: 8, maxHeight: 220, overflowY: 'auto' }}>
        <table style={{ fontSize: 13, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>Month/Year</th>
              <th style={{ textAlign: 'right', padding: '4px 8px' }}>Stock</th>
              <th style={{ textAlign: 'right', padding: '4px 8px' }}>Fixed Income</th>
              <th style={{ textAlign: 'right', padding: '4px 8px' }}>Crypto</th>
              <th style={{ textAlign: 'right', padding: '4px 8px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {details.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#888' }}>
                  No contributions recorded
                </td>
              </tr>
            )}
            {details.map((row, i) => (
              <tr key={row.monthYear} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '4px 8px' }}>{row.monthYear}</td>
                <td style={{ padding: '4px 8px', textAlign: 'right' }}>${row.stock.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '4px 8px', textAlign: 'right' }}>${row.fixed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '4px 8px', textAlign: 'right' }}>${row.crypto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style={{ padding: '4px 8px', textAlign: 'right' }}>${row.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 16, fontWeight: 'bold', fontSize: 15 }}>
        Total Invested: ${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
        Stock: ${totalStock.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Fixed Income: ${totalFixed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | Crypto: ${totalCrypto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div style={{ marginTop: 32 }}>
        <h4>Projected Accumulated Balance (Historical Basis)</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13 }}>Annual Rate of Return (%):</label>
          <input type="number" min="0" value={annualRate} onChange={e => setAnnualRate(e.target.value)} style={{ width: 80 }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Line
            data={{
              labels: monthLabels,
              datasets: [
                {
                  label: "Accumulated Balance",
                  data: balancePerMonth,
                  borderColor: "#16a34a",
                  backgroundColor: "rgba(22,163,74,0.1)",
                  fill: true,
                  tension: 0.2
                }
              ]
            }}
          />
        </div>
        <div style={{ marginTop: 16, fontSize: 15 }}>
          <b>Projected Final Balance:</b> ${balancePerMonth.length > 0 ? balancePerMonth[balancePerMonth.length - 1].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
        </div>
      </div>
    </div>
  );
}
