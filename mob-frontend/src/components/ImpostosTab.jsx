import ImpostoForm from "./ImpostoForm";

export default function ImpostosTab({ onRegistrarGasto }) {
  return (
    <div>
      <h2>Taxes (MEI/ME)</h2>
      <ImpostoForm onRegistrarGasto={onRegistrarGasto} />
    </div>
  );
}
