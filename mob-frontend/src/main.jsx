import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from "chart.js";
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip);
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
