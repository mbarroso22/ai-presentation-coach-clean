// frontend/src/AudienceView.jsx
import { useEffect, useState } from "react";
import socket from "./socket";

function AudienceView({ presentationId }) {
  const [presentation, setPresentation] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch presentation once
  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        const res = await fetch(
          `/api/presentations/${presentationId}`
        );
        if (!res.ok) throw new Error("Failed to fetch presentation");
        const data = await res.json();
        setPresentation(data);
      } catch (err) {
        console.error("AudienceView fetch error:", err);
      }
    };

    if (presentationId) {
      fetchPresentation();
    }
  }, [presentationId]);

  // Socket: join room + listen for slide changes
  useEffect(() => {
    if (!presentationId) return;

    socket.emit("join_presentation", { presentationId });

    socket.on("presentation_state", (data) => {
      if (data.presentationId === presentationId) {
        setCurrentIndex(data.currentSlideIndex);
      }
    });

    socket.on("slide_changed", (data) => {
      if (data.presentationId === presentationId) {
        setCurrentIndex(data.currentSlideIndex);
      }
    });

    return () => {
      socket.off("presentation_state");
      socket.off("slide_changed");
    };
  }, [presentationId]);

  if (!presentation) {
    return (
      <div
        style={{
          padding: "1rem",
          borderRadius: "0.75rem",
          background: "#020617",
          border: "1px solid #1e293b",
        }}
      >
        <p>Loading presentation...</p>
      </div>
    );
  }

  const { slides, title } = presentation;
  const slide = slides[currentIndex];

  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: "0.75rem",
        background: "#020617",
        border: "1px solid #1e293b",
        minHeight: "250px",
      }}
    >
      <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
        Viewing: {title} — Slide {currentIndex + 1} of {slides.length}
      </p>
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
    </div>
  );
}

export default AudienceView;
