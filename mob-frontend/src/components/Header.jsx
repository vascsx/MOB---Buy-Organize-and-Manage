export default function Header({ month, setMonth, year, setYear }) {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear + 1; i++) years.push(i);

  return (
    <header>
      <div>
        <h1><i className="fas fa-wallet"></i> Monthly Financial Control</h1>
        <p className="lead">Organize your fixed costs, variable expenses, savings, and investments</p>
      </div>
      <div className="period-selector">
        <i className="fas fa-calendar"></i>
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
          {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </header>
  );
}
