import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, BarElement, ArcElement, BarController, PieController, DoughnutController, Legend, Tooltip } from "chart.js";
Chart.register(
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  BarController,
  PieController,
  DoughnutController,
  Legend,
  Tooltip
);
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
