import { useEffect, useState } from "react";

function ReviewPanel({ presentationId }) {
  const [presentation, setPresentation] = useState(null);
  const [analysisDraft, setAnalysisDraft] = useState([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // Fetch the presentation (including analysis)
  useEffect(() => {
    if (!presentationId) return;

    const fetchPresentation = async () => {
      try {
        const res = await fetch(
          `/api/presentations/${presentationId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch presentation");
        }
        const data = await res.json();
        setPresentation(data);
        setAnalysisDraft(data.analysis || []);
      } catch (err) {
        console.error("Error loading presentation for review:", err);
        setStatus("Failed to load presentation.");
      }
    };

    fetchPresentation();
  }, [presentationId]);

  const handleFieldChange = (index, field, value) => {
    setAnalysisDraft((prev) =>
      prev.map((item) =>
        item.slideIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async () => {
    if (!presentation) return;
    setSaving(true);
    setStatus("");

    try {
      const res = await fetch(
        `/api/presentations/${presentationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysis: analysisDraft }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to save updates");
      }

      const updated = await res.json();
      setPresentation(updated);
      setStatus("Saved changes to AI notes.");
    } catch (err) {
      console.error("Error saving updated analysis:", err);
      setStatus("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!presentation) {
    return null; // nothing until loaded
  }

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        background: "#020617",
        border: "1px solid #1e293b",
        maxWidth: "1100px",
      }}
    >
      <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>
        Review & Edit AI Notes
      </h2>
      <p style={{ color: "#9ca3af", marginBottom: "1rem" }}>
        Fine-tune the AI notes, script, and timing before you present.
      </p>

      {status && (
        <p
          style={{
            marginBottom: "1rem",
            color: status.startsWith("Saved") ? "#4ade80" : "#fca5a5",
          }}
        >
          {status}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {presentation.slides.map((slide, idx) => {
          const a = analysisDraft.find(
            (item) => item.slideIndex === idx
          ) || {
            slideIndex: idx,
            importance: "medium",
            expectedTimeSeconds: 30,
            speakerNotes: "",
            keyPoints: [],
            speakingScript: "",
            transitionToNext: "",
          };

          return (
            <div
              key={idx}
              style={{
                padding: "1rem",
                borderRadius: "0.75rem",
                background: "#020617",
                border: "1px solid #1f2937",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                Slide {idx + 1}: {slide.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#9ca3af",
                  marginBottom: "0.75rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {slide.content}
              </p>

              {/* Importance + Time */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <label style={{ fontSize: "0.9rem", color: "#e5e7eb" }}>
                  Importance:{" "}
                  <select
                    value={a.importance}
                    onChange={(e) =>
                      handleFieldChange(idx, "importance", e.target.value)
                    }
                    style={{
                      marginLeft: "0.3rem",
                      background: "#020617",
                      color: "white",
                      borderRadius: "0.4rem",
                      border: "1px solid #374151",
                      padding: "0.2rem 0.4rem",
                    }}
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </label>

                <label style={{ fontSize: "0.9rem", color: "#e5e7eb" }}>
                  Expected Time (s):{" "}
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={a.expectedTimeSeconds}
                    onChange={(e) =>
                      handleFieldChange(
                        idx,
                        "expectedTimeSeconds",
                        Number(e.target.value)
                      )
                    }
                    style={{
                      marginLeft: "0.3rem",
                      width: "5rem",
                      background: "#020617",
                      color: "white",
                      borderRadius: "0.4rem",
                      border: "1px solid #374151",
                      padding: "0.2rem 0.4rem",
                    }}
                  />
                </label>
              </div>

              {/* Speaker notes */}
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#e5e7eb",
                    marginBottom: "0.25rem",
                  }}
                >
                  High-level Speaker Notes
                </label>
                <textarea
                  rows={3}
                  value={a.speakerNotes || ""}
                  onChange={(e) =>
                    handleFieldChange(idx, "speakerNotes", e.target.value)
                  }
                  style={{
                    width: "100%",
                    background: "#020617",
                    color: "white",
                    borderRadius: "0.5rem",
                    border: "1px solid #374151",
                    padding: "0.5rem",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Script */}
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#e5e7eb",
                    marginBottom: "0.25rem",
                  }}
                >
                  Detailed Script (what to say)
                </label>
                <textarea
                  rows={4}
                  value={a.speakingScript || ""}
                  onChange={(e) =>
                    handleFieldChange(idx, "speakingScript", e.target.value)
                  }
                  style={{
                    width: "100%",
                    background: "#020617",
                    color: "white",
                    borderRadius: "0.5rem",
                    border: "1px solid #374151",
                    padding: "0.5rem",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Transition */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.9rem",
                    color: "#e5e7eb",
                    marginBottom: "0.25rem",
                  }}
                >
                  Transition to Next Slide / Closing Line
                </label>
                <textarea
                  rows={2}
                  value={a.transitionToNext || ""}
                  onChange={(e) =>
                    handleFieldChange(idx, "transitionToNext", e.target.value)
                  }
                  style={{
                    width: "100%",
                    background: "#020617",
                    color: "white",
                    borderRadius: "0.5rem",
                    border: "1px solid #374151",
                    padding: "0.5rem",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: "1.5rem",
          padding: "0.7rem 1.5rem",
          borderRadius: "0.5rem",
          border: "none",
          background: saving ? "#4b5563" : "#22c55e",
          color: "black",
          fontWeight: 600,
          cursor: saving ? "wait" : "pointer",
        }}
      >
        {saving ? "Saving..." : "Save All Changes"}
      </button>
    </div>
  );
}

export default ReviewPanel;
