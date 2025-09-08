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
      if (!resp.ok) throw new Error(data.error || "Unknown error");
      if (isLogin) {
        localStorage.setItem("token", data.token);
        onAuth(data.token);
      } else {
        setIsLogin(true);
        setUsername("");
        setPassword("");
        setError("Registration successful! Please login.");
      }
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 350, margin: "40px auto" }}>
      <h3>{isLogin ? "Login" : "Register"}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">{isLogin ? "Login" : "Register"}</button>
        </div>
      </form>
      <div style={{ marginTop: 10 }}>
        <button
          className="small"
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </div>
  );
}
