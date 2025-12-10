import { useState } from "react";
import SpeakerView from "./SpeakerView";
import AudienceView from "./AudienceView";
import PresentationEditor from "./PresentationEditor";
import ReviewPanel from "./ReviewPanel";
import LoginScreen from "./LoginScreen";


function App() {
  const [presentationId, setPresentationId] = useState(null);
  const [createdId, setCreatedId] = useState(null);
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const handleCreateDemo = async () => {
    setLoading(true);
    setError("");

    try {
      const createRes = await fetch("http://localhost:3001/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Demo Talk: Frontiers in Computing",
          slides: [
            {
              title: "Introduction",
              content: "Welcome to my talk about frontiers in computing.",
            },
            {
              title: "Problem Statement",
              content:
                "Computing systems are becoming more complex and interconnected.",
            },
            {
              title: "Our Proposal",
              content:
                "We propose an AI-assisted presentation coach to help presenters.",
            },
          ],
        }),
      });

      if (!createRes.ok) {
        throw new Error("Failed to create presentation");
      }

      const created = await createRes.json();
      setCreatedId(created.id);

      const analyzeRes = await fetch(
        `http://localhost:3001/api/presentations/${created.id}/analyze`,
        {
          method: "POST",
        }
      );

      if (!analyzeRes.ok) {
        throw new Error("Failed to analyze presentation");
      }

      const analyzed = await analyzeRes.json();
      setPresentationId(analyzed.presentation.id);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinExisting = async (e) => {
    e.preventDefault();
    setError("");

    const idNum = Number(manualId);
    if (!manualId || Number.isNaN(idNum) || idNum <= 0) {
      setError("Please enter a valid numeric presentation ID.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3001/api/presentations/${idNum}`
      );
      if (!res.ok) {
        if (res.status === 404) {
          setError("No presentation found with that ID.");
        } else {
          setError("Error looking up that presentation.");
        }
        return;
      }

      setPresentationId(idNum);
    } catch (err) {
      console.error("Error verifying presentation ID:", err);
      setError("Could not contact server to verify ID.");
    }
  };

  // Called when the PresentationEditor successfully creates & analyzes a presentation
  const handleCustomCreated = (presentation) => {
    setCreatedId(presentation.id);
    setPresentationId(presentation.id);
    setError("");
  };

    return isLoggedIn ? (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        minHeight: "100vh",
        padding: "2rem",
        background: "#0f172a",
        color: "white",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* Centered inner container */}
      <div style={{ width: "100%", maxWidth: "1200px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
          AI Presentation Coach (Prototype)
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#cbd5f5" }}>
          Use this app to create or join a presentation session, then use the
          Speaker View and Audience View to see real-time slide sync.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginBottom: "2rem",
            maxWidth: "900px",
          }}
        >
          {/* Left: create demo presentation */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              background: "#020617",
              border: "1px solid #1e293b",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              1. Create Demo Presentation
            </h2>
            <button
              onClick={handleCreateDemo}
              disabled={loading}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#22c55e",
                color: "black",
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Setting up demo..." : "Create Demo + Analyze"}
            </button>
            {createdId && (
              <p style={{ marginTop: "0.75rem", color: "#bbf7d0" }}>
                Latest created presentation ID: <strong>{createdId}</strong>
                <br />
                Use this ID in another tab/device to join the same session.
              </p>
            )}
          </div>

          {/* Right: join existing presentation */}
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              background: "#020617",
              border: "1px solid #1e293b",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
              2. Join Existing Presentation
            </h2>
            <form onSubmit={handleJoinExisting}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Presentation ID:
              </label>
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="e.g., 1"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #1f2937",
                  background: "#020617",
                  color: "white",
                  marginBottom: "0.75rem",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0.5rem 1.2rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "#3b82f6",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Join Speaker/Audience Session
              </button>
            </form>
          </div>
        </div>

        {/* Custom Presentation Editor */}
        <PresentationEditor onCreated={handleCustomCreated} />

        {error && (
          <p
            style={{
              marginTop: "1rem",
              marginBottom: "1rem",
              color: "#fca5a5",
            }}
          >
            {error}
          </p>
        )}

        {/* If we have an active presentationId, show Speaker + Audience + Review */}
        {presentationId && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr",
                gap: "1.5rem",
                marginTop: "1.5rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
                  Speaker View
                </h2>
                <SpeakerView presentationId={presentationId} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>
                  Audience View (Preview)
                </h2>
                <AudienceView presentationId={presentationId} />
              </div>
            </div>

            {/* Review & Edit AI Notes panel */}
            <ReviewPanel presentationId={presentationId} />
          </>
        )}
      </div>
    </div>
  ) : (
    <LoginScreen onLogin={() => setIsLoggedIn(true)} />
  );
}

export default App;
