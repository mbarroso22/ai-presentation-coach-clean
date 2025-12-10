// frontend/src/PresentationEditor.jsx
import { useState } from "react";

function PresentationEditor({ onCreated }) {
  const [title, setTitle] = useState("My New Presentation");
  const [slides, setSlides] = useState([
    { title: "Slide 1 Title", content: "Slide 1 content goes here..." },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSlideChange = (index, field, value) => {
    setSlides((prev) =>
      prev.map((slide, i) =>
        i === index ? { ...slide, [field]: value } : slide
      )
    );
  };

  const handleAddSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        title: `Slide ${prev.length + 1} Title`,
        content: "",
      },
    ]);
  };

  const handleRemoveSlide = (index) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
  setError("");
  if (!title.trim()) {
    setError("Title cannot be empty.");
    return;
  }
  if (slides.length === 0) {
    setError("You need at least one slide.");
    return;
  }
  if (slides.some((s) => !s.title.trim())) {
    setError("Each slide must have a title.");
    return;
  }

  setSaving(true);
  try {
    // 1) Create presentation on backend
    const createRes = await fetch("/api/presentations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slides,
      }),
    });

    if (!createRes.ok) {
      throw new Error("Failed to create presentation");
    }

    const created = await createRes.json();

    // 2) Run analysis
    const analyzeRes = await fetch(
      `/api/presentations/${created.id}/analyze`,
      {
        method: "POST",
      }
    );

    if (!analyzeRes.ok) {
      throw new Error("Failed to analyze presentation");
    }

    const analyzed = await analyzeRes.json();

    // 3) Notify parent
    if (onCreated) {
      onCreated(analyzed.presentation);
    }
  } catch (err) {
    console.error("Error saving presentation:", err);
    setError(err.message || "Something went wrong while saving.");
  } finally {
    setSaving(false);
  }
  };


  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: "0.75rem",
        background: "#020617",
        border: "1px solid #1e293b",
        marginTop: "1.5rem",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
        3. Create Custom Presentation
      </h2>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Presentation Title:
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            border: "1px solid #1f2937",
            background: "#020617",
            color: "white",
          }}
        />
      </div>

      <div style={{ maxHeight: "320px", overflowY: "auto", paddingRight: "0.25rem" }}>
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              background: "#0b1120",
              border: "1px solid #1f2937",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                Slide {index + 1}
              </h3>
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSlide(index)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#f97373",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Title:
            </label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) =>
                handleSlideChange(index, "title", e.target.value)
              }
              style={{
                width: "100%",
                padding: "0.4rem",
                borderRadius: "0.5rem",
                border: "1px solid #1f2937",
                background: "#020617",
                color: "white",
                marginBottom: "0.5rem",
              }}
            />

            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Content:
            </label>
            <textarea
              value={slide.content}
              onChange={(e) =>
                handleSlideChange(index, "content", e.target.value)
              }
              rows={3}
              style={{
                width: "100%",
                padding: "0.4rem",
                borderRadius: "0.5rem",
                border: "1px solid #1f2937",
                background: "#020617",
                color: "white",
                resize: "vertical",
              }}
              placeholder="Enter the main bullet points or text for this slide..."
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={handleAddSlide}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#4b5563",
            color: "white",
            cursor: "pointer",
          }}
        >
          + Add Slide
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.5rem 1.2rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#22c55e",
            color: "black",
            fontWeight: 600,
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Saving & Analyzing..." : "Save & Analyze Presentation"}
        </button>
      </div>

      {error && (
        <p style={{ marginTop: "0.75rem", color: "#fca5a5" }}>{error}</p>
      )}
    </div>
  );
}

export default PresentationEditor;
