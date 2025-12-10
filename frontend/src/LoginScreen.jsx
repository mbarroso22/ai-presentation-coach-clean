import { useState } from "react";

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Simple passcode for the project
  const CORRECT_PASSWORD = "frontiers2025";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError("");
      onLogin();
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
        padding: "2rem",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2rem",
          borderRadius: "0.75rem",
          background: "#020617",
          border: "1px solid #1e293b",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>
          AI Presentation Coach
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "1.25rem" }}>
          Enter the access password to open the app.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.95rem",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #1f2937",
              background: "#020617",
              color: "white",
              marginBottom: "0.75rem",
            }}
          />

          {error && (
            <p
              style={{
                marginBottom: "0.75rem",
                color: "#fca5a5",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.7rem 1.2rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#3b82f6",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Enter App
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginScreen;
