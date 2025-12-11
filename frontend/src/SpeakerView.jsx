// frontend/src/SpeakerView.jsx
import { useEffect, useState } from "react";
import socket from "./socket";

function SpeakerView({ presentationId }) {
  const [presentation, setPresentation] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTimer, setCurrentTimer] = useState(0); // seconds
  const [intervalId, setIntervalId] = useState(null);

  // Join the socket.io room for this presentationId
  useEffect(() => {
    if (!presentationId) return;

    socket.emit("join_presentation", { presentationId });

    socket.on("slide_changed", (data) => {
      if (data.presentationId === presentationId) {
        setCurrentIndex(data.currentSlideIndex);
      }
    });

    return () => {
      socket.off("slide_changed");
    };
  }, [presentationId]);

  // Fetch presentation details from backend
  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        const res = await fetch(`/api/presentations/${presentationId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch presentation");
        }
        const data = await res.json();
        setPresentation(data);
      } catch (err) {
        console.error("Error fetching presentation:", err);
      }
    };

    if (presentationId != null) {
      fetchPresentation();
    }
  }, [presentationId]);

  // Timer: restart whenever the current slide changes
  useEffect(() => {
    if (!presentation) return;

    if (intervalId) {
      clearInterval(intervalId);
    }

    setCurrentTimer(0);
    const id = setInterval(() => {
      setCurrentTimer((t) => t + 1);
    }, 1000);
    setIntervalId(id);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, presentation]);

  if (!presentation) {
    return <p>Loading presentation...</p>;
  }

  const { title, slides, analysis } = presentation;
  const slide = slides[currentIndex];

  const analysisForSlide =
    analysis && analysis.find((a) => a.slideIndex === currentIndex);

  const expectedTime =
    analysisForSlide?.expectedTimeSeconds != null
      ? analysisForSlide.expectedTimeSeconds
      : 30;

  const importance = analysisForSlide?.importance || "medium";
  const coachingNotes =
    analysisForSlide?.speakerNotes ||
    "No coaching notes available for this slide.";
  const keyPoints = analysisForSlide?.keyPoints || [];
  const speakingScript =
    analysisForSlide?.speakingScript ||
    "No suggested script generated for this slide.";
  const transitionToNext =
    analysisForSlide?.transitionToNext ||
    "No specific transition line generated.";

  const overTime = currentTimer > expectedTime;
  const progressPercent = Math.min(
    100,
    Math.round((currentTimer / expectedTime) * 100)
  );

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      socket.emit("advance_slide", { presentationId, newIndex });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      socket.emit("previous_slide", { presentationId, newIndex });
    }
  };

  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        background: "#020617",
        border: "1px solid #1e293b",
        maxWidth: "960px",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Speaker View – {title}
      </h2>
      <p style={{ marginBottom: "0.5rem", color: "#64748b" }}>
        Slide {currentIndex + 1} of {slides.length} • Importance:{" "}
        <strong>{importance}</strong>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.7fr",
          gap: "1.5rem",
          marginTop: "1rem",
        }}
      >
        {/* Left: slide content preview */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            background: "#0b1120",
            border: "1px solid #1f2937",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
            {slide.title}
          </h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
            {slide.content}
          </p>
        </div>

        {/* Right: AI coaching panel */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.75rem",
            background: "#020617",
            border: "1px solid #1f2937",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* Coaching tips */}
          <div>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
              Coaching Tips
            </h4>
            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
                color: "#e5e7eb",
              }}
            >
              {coachingNotes}
            </p>
          </div>

          {/* Key Points */}
          <div>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
              Key Points to Hit
            </h4>
            {keyPoints.length > 0 ? (
              <ul
                style={{
                  marginLeft: "1rem",
                  marginTop: "0.25rem",
                  marginBottom: "0.5rem",
                  color: "#e5e7eb",
                }}
              >
                {keyPoints.map((kp, idx) => (
                  <li key={idx} style={{ marginBottom: "0.15rem" }}>
                    {kp}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#9ca3af" }}>No specific key points listed.</p>
            )}
          </div>

          {/* Script */}
          <div>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
              Suggested Script
            </h4>
            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
                fontSize: "0.95rem",
                color: "#e5e7eb",
              }}
            >
              {speakingScript}
            </p>
          </div>

          {/* Transition line */}
          <div>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
              Transition to Next Slide
            </h4>
            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
                fontStyle: "italic",
                color: "#cbd5f5",
              }}
            >
              {transitionToNext}
            </p>
          </div>

          {/* Timing / pacing */}
          <div style={{ marginTop: "0.25rem" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
              Timing
            </h4>
            <p style={{ marginBottom: "0.5rem", color: "#cbd5f5" }}>
              Time on this slide: {currentTimer}s (expected: {expectedTime}s)
            </p>

            <div
              style={{
                height: "10px",
                borderRadius: "999px",
                background: "#020617",
                border: "1px solid #1e293b",
                overflow: "hidden",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPercent}%`,
                  background: overTime ? "#f97373" : "#22c55e",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {overTime ? (
              <p style={{ color: "#f97373" }}>
                ⚠ You're over the suggested time for this slide. Consider
                wrapping up and transitioning.
              </p>
            ) : (
              <p style={{ color: "#22c55e" }}>✓ Pacing looks okay so far.</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#1d4ed8",
            color: "white",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentIndex === 0 ? 0.5 : 1,
          }}
        >
          ◀ Prev Slide
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === slides.length - 1}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#22c55e",
            color: "black",
            fontWeight: 600,
            cursor:
              currentIndex === slides.length - 1 ? "not-allowed" : "pointer",
            opacity: currentIndex === slides.length - 1 ? 0.5 : 1,
          }}
        >
          Next Slide ▶
        </button>
      </div>
    </div>
  );
}

export default SpeakerView;
