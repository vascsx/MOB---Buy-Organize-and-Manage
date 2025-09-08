import { useState } from "react";

const API_URL = "http://localhost:8080";

export default function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/login" : "/register";
    try {
      const resp = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Erro desconhecido");
      if (isLogin) {
        localStorage.setItem("token", data.token);
        onAuth(data.token);
      } else {
        setIsLogin(true);
        setUsername("");
        setPassword("");
        setError("Cadastro realizado! Faça login.");
      }
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 350, margin: "40px auto" }}>
      <h3>{isLogin ? "Login" : "Registrar"}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="Usuário"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">{isLogin ? "Entrar" : "Registrar"}</button>
        </div>
      </form>
      <div style={{ marginTop: 10 }}>
        <button className="small" onClick={() => { setIsLogin(!isLogin); setError(""); }}>
          {isLogin ? "Não tem conta? Registrar" : "Já tem conta? Login"}
        </button>
      </div>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </div>
  );
}
